<?php

namespace App\Http\Controllers;

use App\Models\InventoryUnit;
use App\Models\PaymentLedger;
use App\Models\PlatformCostSetting;
use App\Models\Project;
use App\Models\ProjectEscrowLedger;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats(): JsonResponse
    {
        $revenue = PaymentLedger::where('status', 'paid')->sum('amount_bdt');
        $running = Project::whereIn('status', ['crowdfunding', 'construction'])->count();
        $defaults = PaymentLedger::where('status', 'defaulted')->distinct('user_id')->count('user_id');

        return response()->json([
            'revenueBdt'       => (float) $revenue,
            'runningProjects'  => $running,
            'defaultRiskFlags' => $defaults,
        ]);
    }

    public function projects(): JsonResponse
    {
        $projects = Project::withCount('inventoryUnits')
            ->orderBy('id')
            ->get()
            ->map(fn (Project $p) => [
                'id'                => (string) $p->id,
                'name'              => $p->title,
                'location'          => $p->location,
                'katha'             => (float) $p->total_katha,
                'targetCapital'     => '৳ ' . number_format($p->total_shares * $p->base_sqft_rate * 1200 / 10000000, 1) . ' Cr',
                'raisedPct'         => (float) $p->funding_percentage,
                'totalUnits'        => $p->inventory_units_count,
                'status'            => $p->status,
                'phase'             => $p->phase_label,
                'completionTarget'  => $p->completion_target,
                'contractor'        => $p->contractor,
                'baseSqftRate'      => (float) $p->base_sqft_rate,
                'managementFeePct'  => (float) $p->management_fee_percentage,
            ]);

        return response()->json(['data' => $projects]);
    }

    public function updateProject(Request $request, int $id): JsonResponse
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'base_sqft_rate'            => ['sometimes', 'numeric', 'min:0'],
            'management_fee_percentage' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'status'                    => ['sometimes', 'in:crowdfunding,construction,completed,handover'],
            'phase_label'               => ['sometimes', 'nullable', 'string'],
            'funding_percentage'        => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'contractor'                => ['sometimes', 'nullable', 'string'],
            'completion_target'         => ['sometimes', 'nullable', 'string'],
        ]);

        $project->update($validated);

        return response()->json(['data' => $project->fresh()]);
    }

    public function escrowLedger(): JsonResponse
    {
        $entries = ProjectEscrowLedger::with(['paymentLedger.user', 'paymentLedger.unit', 'project'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($e) => [
                'id'        => (string) $e->id,
                'invoiceNo' => $e->paymentLedger?->invoice_number,
                'investor'  => $e->paymentLedger?->user?->name,
                'unit'      => $e->paymentLedger?->unit?->unit_number,
                'amount'    => (float) $e->paymentLedger?->amount_bdt,
                'escrow88'  => (float) $e->amount,
                'fee12'     => (float) ($e->paymentLedger?->amount_fee ?? 0),
                'status'    => $e->status,
                'gateway'   => $e->paymentLedger?->payment_gateway,
                'date'      => $e->created_at?->format('Y-m-d'),
            ]);

        return response()->json(['data' => $entries]);
    }
}
