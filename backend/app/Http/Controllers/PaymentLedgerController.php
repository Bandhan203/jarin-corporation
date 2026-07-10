<?php

namespace App\Http\Controllers;

use App\Models\PaymentLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentLedgerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $rows = PaymentLedger::query()
            ->where('user_id', $user->id)
            ->with(['project', 'unit'])
            ->orderBy('installment_number')
            ->get()
            ->map(fn (PaymentLedger $row) => [
                'id'                => $row->invoice_number,
                'date'              => $row->due_date->format('Y-m-d'),
                'description'       => $this->descriptionFor($row),
                'amount'            => (float) $row->amount_bdt,
                'status'            => $row->status === 'unpaid' ? 'upcoming' : $row->status,
                'installmentNumber' => $row->installment_number,
                'projectName'       => $row->project?->title,
                'unitNumber'        => $row->unit?->unit_number,
            ]);

        $paid = $rows->where('status', 'paid')->sum('amount');
        $due  = $rows->whereIn('status', ['upcoming', 'overdue'])->sum('amount');
        $paidCount = $rows->where('status', 'paid')->count();
        $totalCount = $rows->count();

        return response()->json([
            'summary' => [
                'totalPaid'            => $paid,
                'outstandingBalance'   => $due,
                'installmentsComplete' => "{$paidCount} / {$totalCount}",
            ],
            'rows' => $rows->values(),
        ]);
    }

    public function show(Request $request, string $invoiceNumber): JsonResponse
    {
        $ledger = PaymentLedger::query()
            ->where('user_id', $request->user()->id)
            ->where('invoice_number', $invoiceNumber)
            ->with(['project', 'unit', 'escrowLedger', 'profitLedger'])
            ->firstOrFail();

        return response()->json([
            'invoiceNumber'       => $ledger->invoice_number,
            'installment'         => $ledger->installment_number,
            'projectName'         => $ledger->project?->title,
            'projectLocation'     => $ledger->project?->location,
            'investorName'        => $ledger->user?->name,
            'transactionId'       => $ledger->gateway_transaction_id,
            'gateway'             => $ledger->payment_gateway,
            'paymentDate'         => $ledger->paid_at?->format('d F Y'),
            'dueDate'             => $ledger->due_date->format('d F Y'),
            'amountTotal'         => (float) $ledger->amount_bdt,
            'amountEscrow'        => (float) ($ledger->amount_escrow ?? 0),
            'amountFee'           => (float) ($ledger->amount_fee ?? 0),
            'status'              => $ledger->status,
        ]);
    }

    private function descriptionFor(PaymentLedger $row): string
    {
        if ($row->installment_number === 0) {
            return 'Land Share Booking — Phase 1';
        }

        return sprintf(
            'Construction Installment #%02d',
            $row->installment_number
        );
    }
}
