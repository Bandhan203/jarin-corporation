<?php

namespace App\Http\Controllers;

use App\Models\PlatformCostSetting;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CostController extends Controller
{
    public function index(): JsonResponse
    {
        $costs = PlatformCostSetting::orderBy('id')->get();
        $running = Project::whereIn('status', ['construction', 'crowdfunding'])->count();

        return response()->json([
            'data' => $costs->map(fn ($c) => [
                'key'              => $c->key,
                'label'            => $c->label,
                'value'            => (float) $c->value,
                'lockWhenRunning'  => $c->lock_when_running,
                'isLocked'         => $c->lock_when_running && $running > 0,
            ]),
            'runningProjectCount' => $running,
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $cost = PlatformCostSetting::where('key', $key)->firstOrFail();
        $running = Project::whereIn('status', ['construction', 'crowdfunding'])->exists();

        if ($cost->lock_when_running && $running) {
            return response()->json(['message' => 'This parameter is locked while projects are running.'], 423);
        }

        $validated = $request->validate([
            'value' => ['required', 'numeric', 'min:0'],
        ]);

        $cost->update(['value' => $validated['value']]);

        return response()->json([
            'data' => [
                'key'   => $cost->key,
                'label' => $cost->label,
                'value' => (float) $cost->value,
            ],
        ]);
    }
}
