<?php

namespace App\Http\Controllers;

use App\Models\DynamicCmsSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = DynamicCmsSetting::orderBy('group')->orderBy('key')->get();

        return response()->json([
            'data' => $settings->map(fn ($s) => $this->format($s)),
            'byKey' => $settings->pluck('value', 'key'),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $settings = DynamicCmsSetting::orderBy('group')->orderBy('key')->get();

        return response()->json(['data' => $settings->map(fn ($s) => $this->format($s))]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $setting = DynamicCmsSetting::findOrFail($id);

        $validated = $request->validate([
            'value' => ['required', 'string'],
        ]);

        $setting->update([
            'value'      => $validated['value'],
            'updated_by' => $request->user()->email,
        ]);

        return response()->json(['data' => $this->format($setting->fresh())]);
    }

    private function format(DynamicCmsSetting $s): array
    {
        return [
            'id'        => (string) $s->id,
            'group'     => $s->group,
            'key'       => $s->key,
            'type'      => match ($s->type) {
                'rich_text' => 'Rich Text',
                'image'     => 'Image',
                'metric'    => 'Metric',
                default     => 'Text',
            },
            'value'     => $s->value,
            'updatedAt' => $s->updated_at?->format('Y-m-d H:i'),
            'updatedBy' => $s->updated_by ?? 'system',
        ];
    }
}
