<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::query()
            ->withCount([
                'inventoryUnits as available_units_count' => fn ($q) => $q->where('status', 'available'),
            ])
            ->orderBy('id')
            ->get()
            ->map(fn (Project $p) => $this->formatListItem($p));

        return response()->json(['data' => $projects]);
    }

    public function show(int $id): JsonResponse
    {
        $project = Project::findOrFail($id);

        return response()->json(['data' => $this->formatDetail($project)]);
    }

    public function matrix(int $id): JsonResponse
    {
        $project = Project::with(['inventoryUnits' => fn ($q) => $q->orderByDesc('floor_number')->orderBy('unit_number')])
            ->findOrFail($id);

        $units = $project->inventoryUnits->map(fn ($unit) => [
            'id'           => $unit->id,
            'unitNumber'   => $unit->unit_number,
            'floorNumber'  => $unit->floor_number,
            'sizeSft'      => (float) $unit->size_sft,
            'premiumCharge'=> (float) $unit->premium_charge,
            'totalPrice'   => (float) $unit->total_price,
            'orientation'  => $unit->orientation,
            'status'       => $unit->status,
        ]);

        return response()->json([
            'project' => $this->formatDetail($project),
            'units'   => $units,
        ]);
    }

    private function formatListItem(Project $project): array
    {
        $sampleUnit = $project->inventoryUnits()->orderBy('total_price')->first();

        return [
            'id'                => (string) $project->id,
            'title'             => $project->title,
            'location'          => $project->location,
            'totalKatha'        => (float) $project->total_katha,
            'fundingPercentage' => (float) $project->funding_percentage,
            'status'            => $project->status,
            'phaseLabel'        => $project->phase_label,
            'heroImage'         => $project->hero_image,
            'availableShares'   => $project->available_units_count ?? 0,
            'displayPrice'      => $sampleUnit
                ? round($sampleUnit->total_price / 100000, 1) . ' LAKH BDT'
                : null,
            'displaySft'        => $sampleUnit
                ? number_format($sampleUnit->size_sft, 0) . ' SFT'
                : null,
        ];
    }

    private function formatDetail(Project $project): array
    {
        return [
            'id'                => (string) $project->id,
            'title'             => $project->title,
            'location'          => $project->location,
            'totalKatha'        => (float) $project->total_katha,
            'totalShares'       => $project->total_shares,
            'baseSqftRate'      => (float) $project->base_sqft_rate,
            'managementFeePct'  => (float) $project->management_fee_percentage,
            'fundingPercentage' => (float) $project->funding_percentage,
            'status'            => $project->status,
            'phaseLabel'        => $project->phase_label,
            'heroImage'         => $project->hero_image,
        ];
    }
}
