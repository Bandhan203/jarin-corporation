<?php

namespace App\Http\Controllers;

use App\Models\LandSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandSubmissionController extends Controller
{
    public function index(): JsonResponse
    {
        $rows = LandSubmission::orderByDesc('submitted_at')->get();

        return response()->json([
            'data' => $rows->map(fn ($r) => [
                'dbId'       => $r->id,
                'id'         => $r->reference_id,
                'name'       => $r->landowner_name,
                'location'   => $r->location,
                'katha'      => (float) $r->katha,
                'submitted'  => $r->submitted_at->format('Y-m-d'),
                'status'     => $r->status,
                'email'      => $r->email,
                'phone'      => $r->phone,
                'notes'      => $r->notes,
            ]),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $submission = LandSubmission::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,lawyer_assigned,approved,rejected'],
            'notes'  => ['nullable', 'string'],
        ]);

        $submission->update($validated);

        return response()->json(['data' => $submission]);
    }

    public function assignLawyer(int $id): JsonResponse
    {
        $submission = LandSubmission::findOrFail($id);
        $submission->update(['status' => 'lawyer_assigned']);

        return response()->json(['data' => $submission]);
    }

    public function approve(int $id): JsonResponse
    {
        $submission = LandSubmission::findOrFail($id);
        $submission->update(['status' => 'approved']);

        return response()->json(['data' => $submission]);
    }
}
