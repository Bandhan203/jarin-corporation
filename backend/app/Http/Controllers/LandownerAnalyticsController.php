<?php

namespace App\Http\Controllers;

use App\Models\InventoryUnit;
use App\Models\PaymentLedger;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class LandownerAnalyticsController extends Controller
{
    public function show(string $id): JsonResponse
    {
        $user = User::where('id', $id)->where('role', 'landowner')->firstOrFail();

        $projects = Project::query()
            ->whereHas('inventoryUnits', fn ($q) => $q->where('reserved_by_user_id', $user->id))
            ->orWhere('status', '!=', 'handover')
            ->limit(3)
            ->get();

        $swapUnits = InventoryUnit::query()
            ->where('reserved_by_user_id', $user->id)
            ->with('project')
            ->get()
            ->map(fn (InventoryUnit $unit) => [
                'unitCode'            => $unit->unit_number,
                'block'               => substr($unit->unit_number, -1),
                'floorNumber'         => $unit->floor_number,
                'sizeSqft'            => (float) $unit->size_sft,
                'currentValuationL'   => round($unit->total_price / 100000, 2),
                'progressPct'         => $this->progressForStatus($unit->status),
                'status'              => $this->trackerStatus($unit->status),
            ]);

        $totalValueL = round($swapUnits->sum('currentValuationL'), 2);
        $projectedValueL = round($totalValueL * 1.92, 2);
        $growthPct = $totalValueL > 0
            ? round((($projectedValueL - $totalValueL) / $totalValueL) * 100, 1)
            : 0;

        $valuation = $this->buildValuationSeries($totalValueL, $projectedValueL);

        return response()->json([
            'landownerId'       => (string) $user->id,
            'totalValueL'       => $totalValueL,
            'projectedValueL'   => $projectedValueL,
            'growthPct'         => $growthPct,
            'valuation'         => $valuation,
            'swapUnits'         => $swapUnits->values(),
            'activeProjects'    => $projects->count(),
        ]);
    }

    private function progressForStatus(string $status): int
    {
        return match ($status) {
            'sold'      => 100,
            'reserved'  => 68,
            default     => 15,
        };
    }

    private function trackerStatus(string $status): string
    {
        return match ($status) {
            'sold'      => 'ahead',
            'reserved'  => 'on_track',
            default     => 'delayed',
        };
    }

    private function buildValuationSeries(float $current, float $projected): array
    {
        $years = ['2022', '2023', '2024', '2025', '2026', '2027', '2028'];
        $actualRatios = [0.33, 0.5, 0.79, 1.0];

        $series = [];
        foreach ($years as $i => $year) {
            $isActual = $i <= 3;
            $series[] = [
                'year'      => $year,
                'actual'    => $isActual ? round($current * $actualRatios[$i], 2) : null,
                'projected' => $i >= 3
                    ? round($current + (($projected - $current) * (($i - 3) / 4)), 2)
                    : null,
            ];
        }

        return $series;
    }
}
