<?php

namespace App\Http\Controllers;

use App\Models\InventoryUnit;
use App\Models\PaymentLedger;
use App\Models\PlatformCostSetting;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function reserve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_id'    => ['required', 'exists:inventory_units,id'],
            'project_id' => ['required', 'exists:projects,id'],
        ]);

        $user = $request->user();
        $unit = InventoryUnit::where('id', $validated['unit_id'])
            ->where('project_id', $validated['project_id'])
            ->where('status', 'available')
            ->lockForUpdate()
            ->first();

        if (! $unit) {
            return response()->json(['message' => 'Unit is no longer available.'], 409);
        }

        $project = Project::findOrFail($validated['project_id']);
        $bookingPct = (float) (PlatformCostSetting::where('key', 'booking_pct')->value('value') ?? 15);
        $baseAmount = (float) $unit->size_sft * (float) $project->base_sqft_rate;
        $totalPrice = (float) $unit->total_price;
        $bookingAmount = round($totalPrice * ($bookingPct / 100), 2);

        try {
            DB::beginTransaction();

            $unit->update([
                'status'              => 'reserved',
                'reserved_by_user_id' => $user->id,
            ]);

            $invoiceNumber = 'INV-' . now()->format('Y') . '-' . str_pad((string) (PaymentLedger::max('id') + 1), 6, '0', STR_PAD_LEFT);

            $ledger = PaymentLedger::create([
                'user_id'            => $user->id,
                'project_id'         => $project->id,
                'unit_id'            => $unit->id,
                'invoice_number'     => $invoiceNumber,
                'installment_number' => 0,
                'amount_bdt'         => $bookingAmount,
                'status'             => 'unpaid',
                'due_date'           => Carbon::today(),
            ]);

            DB::commit();

            return response()->json([
                'invoiceNumber'  => $ledger->invoice_number,
                'amountBdt'      => $bookingAmount,
                'unitNumber'     => $unit->unit_number,
                'projectName'    => $project->title,
                'calculation'    => [
                    'sizeSft'       => (float) $unit->size_sft,
                    'baseSqftRate'  => (float) $project->base_sqft_rate,
                    'baseAmount'    => $baseAmount,
                    'premiumCharge' => (float) $unit->premium_charge,
                    'totalPrice'    => $totalPrice,
                    'bookingPct'    => $bookingPct,
                    'bookingAmount' => $bookingAmount,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Booking failed. Please retry.'], 500);
        }
    }

    public function initiatePayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_number' => ['required', 'string'],
            'gateway'        => ['required', 'in:bkash,nagad,bank'],
        ]);

        $ledger = PaymentLedger::where('invoice_number', $validated['invoice_number'])
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['unpaid', 'overdue'])
            ->firstOrFail();

        return response()->json([
            'invoiceNumber' => $ledger->invoice_number,
            'amountBdt'     => (float) $ledger->amount_bdt,
            'gateway'       => $validated['gateway'],
            'redirectUrl'   => '/portal/investor/payment-success?invoice=' . $ledger->invoice_number,
        ]);
    }
}
