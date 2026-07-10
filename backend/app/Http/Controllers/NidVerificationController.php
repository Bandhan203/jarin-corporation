<?php

namespace App\Http\Controllers;

use App\Models\NidVerification;
use App\Services\OcrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class NidVerificationController extends Controller
{
    public function __construct(private readonly OcrService $ocr) {}

    public function verify(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nid_number' => ['required', 'string', 'min:10', 'max:17', 'regex:/^[0-9]+$/'],
            'nid_front'  => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
            'nid_back'   => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if ($user->is_verified) {
            return response()->json(['success' => false, 'message' => 'User is already verified.'], 409);
        }

        $existingPending = NidVerification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return response()->json(['success' => false, 'message' => 'A verification request is already under review.'], 409);
        }

        try {
            DB::beginTransaction();

            $ocrResult = $this->ocr->extractNidData(
                nidNumber: $request->nid_number,
                frontPath: 'local/front',
                backPath:  'local/back',
            );

            $approved = $ocrResult['verified'] && ($ocrResult['confidence'] ?? 0) >= 85.0;

            $verification = NidVerification::create([
                'user_id'               => $user->id,
                'nid_number'            => $request->nid_number,
                'full_name'             => $ocrResult['name'] ?? $user->name,
                'date_of_birth'         => $ocrResult['dob'] ?? null,
                'ocr_confidence_score'  => $ocrResult['confidence'] ?? null,
                'status'                => $approved ? 'approved' : 'pending',
                'ocr_metadata'          => $ocrResult['raw'] ?? null,
                'verified_at'           => $approved ? now() : null,
            ]);

            if ($approved) {
                $user->update(['is_verified' => true]);
            }

            DB::commit();

            return response()->json([
                'success'          => true,
                'verification_id'  => $verification->id,
                'status'           => $verification->status,
                'auto_approved'    => $approved,
                'confidence_score' => $verification->ocr_confidence_score,
                'message'          => $approved
                    ? 'Identity verified automatically. Your account is now active.'
                    : 'Submission received. Manual review will complete within 24 hours.',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('NID verification failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return response()->json(['success' => false, 'message' => 'Verification submission failed. Please retry.'], 500);
        }
    }

    public function status(Request $request): JsonResponse
    {
        $latest = NidVerification::where('user_id', $request->user()->id)->latest()->first();

        if (! $latest) {
            return response()->json(['status' => 'not_submitted']);
        }

        return response()->json([
            'status'           => $latest->status,
            'submitted_at'     => $latest->created_at->toIso8601String(),
            'verified_at'      => $latest->verified_at?->toIso8601String(),
            'confidence_score' => $latest->ocr_confidence_score,
            'rejection_reason' => $latest->rejection_reason,
        ]);
    }
}
