<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CmsMediaController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $path = $validated['file']->store('cms', 'public');
        $url  = Storage::disk('public')->url($path);

        // Return absolute URL for frontend preview
        $absolute = url($url);

        return response()->json([
            'url'  => $absolute,
            'path' => $path,
        ]);
    }
}
