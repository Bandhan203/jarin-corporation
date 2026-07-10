<?php

namespace App\Http\Controllers;

use App\Models\CompanyCorporateProfitLedger;
use App\Models\InventoryUnit;
use App\Models\PaymentLedger;
use App\Models\ProjectEscrowLedger;
use App\Services\WebhookSignatureService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    private const SPLIT_BASE_PCT = 0.88;
    private const SPLIT_FEE_PCT  = 0.12;

    public function __construct(
        private readonly WebhookSignatureService $signatureService
    ) {}

    public function bkash(Request $request): JsonResponse
    {
        return $this->handleCallback($request, 'bkash');
    }

    public function nagad(Request $request): JsonResponse
    {
        return $this->handleCallback($request, 'nagad');
    }

    private function handleCallback(Request $request, string $gateway): JsonResponse
    {
        if (! $this->signatureService->verify($request, $gateway)) {
            Log::warning('Webhook signature mismatch', [
                'gateway' => $gateway,
                'ip'      => $request->ip(),
            ]);

            return response()->json(['status' => 'unauthorized'], 401);
        }

        $payload = $request->all();

        $parsed = match ($gateway) {
            'bkash' => $this->parseBkash($payload),
            'nagad' => $this->parseNagad($payload),
        };

        if (! $parsed || empty($parsed['transaction_id']) || empty($parsed['invoice_number'])) {
            Log::error('Webhook parse failed', ['gateway' => $gateway, 'payload' => $payload]);

            return response()->json(['status' => 'parse_error'], 422);
        }

        if (PaymentLedger::where('gateway_transaction_id', $parsed['transaction_id'])->exists()) {
            return response()->json(['status' => 'already_processed'], 200);
        }

        try {
            DB::beginTransaction();

            $invoice = PaymentLedger::query()
                ->where('invoice_number', $parsed['invoice_number'])
                ->whereIn('status', ['unpaid', 'overdue'])
                ->with(['unit', 'project'])
                ->lockForUpdate()
                ->first();

            if (! $invoice) {
                DB::rollBack();
                Log::warning('Webhook: invoice not found', $parsed);

                return response()->json(['status' => 'invoice_not_found'], 404);
            }

            if (abs((float) $invoice->amount_bdt - $parsed['amount']) > 1.0) {
                DB::rollBack();
                Log::error('Webhook: amount mismatch', [
                    'expected' => $invoice->amount_bdt,
                    'received' => $parsed['amount'],
                    'invoice'  => $parsed['invoice_number'],
                ]);

                return response()->json(['status' => 'amount_mismatch'], 422);
            }

            $amountTotal = (float) $parsed['amount'];
            $amountBase  = round($amountTotal * self::SPLIT_BASE_PCT, 2);
            $amountFee   = round($amountTotal - $amountBase, 2);

            $invoice->update([
                'status'                 => 'paid',
                'paid_at'                => Carbon::now(),
                'payment_gateway'        => $gateway,
                'gateway_transaction_id' => $parsed['transaction_id'],
                'gateway_reference'      => $parsed['reference'] ?? null,
                'gateway_raw_response'   => $payload,
                'amount_escrow'          => $amountBase,
                'amount_fee'             => $amountFee,
                'overdue_streak'         => 0,
            ]);

            ProjectEscrowLedger::create([
                'payment_ledger_id' => $invoice->id,
                'project_id'        => $invoice->project_id,
                'amount'            => $amountBase,
                'split_percentage'  => self::SPLIT_BASE_PCT * 100,
                'status'            => 'held',
            ]);

            CompanyCorporateProfitLedger::create([
                'payment_ledger_id' => $invoice->id,
                'amount'            => $amountFee,
                'split_percentage'  => self::SPLIT_FEE_PCT * 100,
                'fiscal_quarter'    => 'Q' . (int) ceil(Carbon::now()->month / 3),
                'fiscal_year'       => Carbon::now()->year,
                'status'            => 'received',
            ]);

            if ($invoice->unit_id) {
                $unit = InventoryUnit::where('id', $invoice->unit_id)->lockForUpdate()->first();

                if ($unit) {
                    if ($invoice->installment_number <= 1) {
                        $unit->update([
                            'status'               => 'sold',
                            'reserved_by_user_id'  => $invoice->user_id,
                        ]);
                    } elseif ($unit->status === 'available') {
                        $unit->update([
                            'status'              => 'reserved',
                            'reserved_by_user_id' => $invoice->user_id,
                        ]);
                    }
                }
            }

            DB::commit();

            Log::info('Payment processed', [
                'invoice'     => $invoice->invoice_number,
                'gateway'     => $gateway,
                'total'       => $amountTotal,
                'base_escrow' => $amountBase,
                'fee_profit'  => $amountFee,
            ]);

            return response()->json([
                'status'  => 'success',
                'invoice' => $invoice->invoice_number,
                'split'   => ['base' => $amountBase, 'fee' => $amountFee],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::critical('Webhook transaction failed', [
                'invoice' => $parsed['invoice_number'],
                'error'   => $e->getMessage(),
            ]);

            return response()->json(['status' => 'transaction_error'], 500);
        }
    }

    private function parseBkash(array $payload): ?array
    {
        if (($payload['transactionStatus'] ?? '') !== 'Completed') {
            return null;
        }

        return [
            'transaction_id' => $payload['trxID'] ?? null,
            'invoice_number' => $payload['merchantInvoiceNumber'] ?? null,
            'amount'         => (float) ($payload['amount'] ?? 0),
            'reference'      => $payload['paymentID'] ?? null,
        ];
    }

    private function parseNagad(array $payload): ?array
    {
        if (($payload['status'] ?? '') !== 'Success') {
            return null;
        }

        return [
            'transaction_id' => $payload['payment_ref_id'] ?? null,
            'invoice_number' => $payload['merchant_order_id'] ?? null,
            'amount'         => (float) ($payload['amount'] ?? 0),
            'reference'      => $payload['order_id'] ?? null,
        ];
    }
}
