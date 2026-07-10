<?php

namespace App\Console\Commands;

use App\Events\InvestorDefaulted;
use App\Models\InventoryUnit;
use App\Models\PaymentLedger;
use App\Models\User;
use App\Services\SmsGatewayService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessOverdueInvoices extends Command
{
    protected $signature   = 'invoices:process-overdue {--dry-run : Report only, no state changes}';
    protected $description = 'Scan unpaid invoices past grace period; dispatch alerts; enforce default lockout';

    private const GRACE_DAYS        = 3;
    private const DEFAULT_THRESHOLD = 3;

    public function __construct(private readonly SmsGatewayService $sms)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $today  = Carbon::today();

        $this->info('[' . now()->toDateTimeString() . "] Starting overdue invoice scan");

        $candidates = PaymentLedger::query()
            ->where('status', 'unpaid')
            ->whereDate('due_date', '<', $today)
            ->with(['user', 'project', 'unit'])
            ->orderBy('user_id')
            ->orderBy('installment_number')
            ->get();

        $this->info("Found {$candidates->count()} unpaid invoices past due date.");

        foreach ($candidates as $invoice) {
            $daysLate = Carbon::parse($invoice->due_date)->diffInDays($today);

            if ($daysLate <= self::GRACE_DAYS) {
                continue;
            }

            $this->processOverdueInvoice($invoice, $dryRun);
        }

        $this->enforceDefaultLockout($dryRun);

        $this->info('Scan complete.');

        return Command::SUCCESS;
    }

    private function processOverdueInvoice(PaymentLedger $invoice, bool $dryRun): void
    {
        $user = $invoice->user;

        $this->line("  → Invoice {$invoice->invoice_number} | User {$user->name} | Due {$invoice->due_date->toDateString()}");

        if ($dryRun) {
            return;
        }

        try {
            DB::beginTransaction();

            $invoice->update([
                'status'         => 'overdue',
                'overdue_streak' => $invoice->overdue_streak + 1,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Failed to update invoice {$invoice->invoice_number}", ['error' => $e->getMessage()]);

            return;
        }

        try {
            $this->sms->send(
                to:      $user->phone ?? '',
                message: $this->buildSmsMessage($invoice),
            );
        } catch (\Throwable $e) {
            Log::warning("SMS dispatch failed for invoice {$invoice->invoice_number}", ['error' => $e->getMessage()]);
        }

        Log::info('Overdue alert dispatched', [
            'invoice' => $invoice->invoice_number,
            'user_id' => $user->id,
        ]);
    }

    private function enforceDefaultLockout(bool $dryRun): void
    {
        $userIds = PaymentLedger::query()
            ->select('user_id')
            ->where('status', 'overdue')
            ->groupBy('user_id')
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            $streak = $this->consecutiveOverdueStreak((int) $userId);

            if ($streak < self::DEFAULT_THRESHOLD) {
                continue;
            }

            $user = User::find($userId);
            if (! $user) {
                continue;
            }

            $this->warn("  ⚠ DEFAULT: User #{$userId} | {$user->name} | Streak {$streak}");

            if ($dryRun) {
                continue;
            }

            try {
                DB::beginTransaction();

                PaymentLedger::where('user_id', $userId)
                    ->whereIn('status', ['unpaid', 'overdue'])
                    ->update(['status' => 'defaulted']);

                InventoryUnit::where('reserved_by_user_id', $userId)
                    ->whereIn('status', ['reserved', 'sold'])
                    ->update([
                        'status'              => 'available',
                        'reserved_by_user_id' => null,
                    ]);

                DB::commit();

                event(new InvestorDefaulted($user, $streak));

                Log::critical('Investor defaulted', [
                    'user_id' => $userId,
                    'streak'  => $streak,
                ]);
            } catch (\Throwable $e) {
                DB::rollBack();
                Log::error("Default lockout failed for user #{$userId}", ['error' => $e->getMessage()]);
            }
        }
    }

    private function consecutiveOverdueStreak(int $userId): int
    {
        $ledgers = PaymentLedger::query()
            ->where('user_id', $userId)
            ->orderByDesc('installment_number')
            ->get(['status', 'overdue_streak']);

        $streak = 0;
        foreach ($ledgers as $ledger) {
            if ($ledger->status === 'overdue') {
                $streak++;
                continue;
            }
            if ($ledger->status === 'paid') {
                break;
            }
        }

        return max($streak, (int) PaymentLedger::where('user_id', $userId)->max('overdue_streak'));
    }

    private function buildSmsMessage(PaymentLedger $invoice): string
    {
        $amount   = number_format((float) $invoice->amount_bdt, 0);
        $due      = $invoice->due_date->format('d M Y');
        $daysLate = Carbon::parse($invoice->due_date)->diffInDays(Carbon::today());

        return "Estate Archive Alert: Your installment #{$invoice->installment_number} "
             . "of BDT {$amount} was due {$due} ({$daysLate} days ago). "
             . "Please pay now to avoid default lockout. Invoice: {$invoice->invoice_number}";
    }
}
