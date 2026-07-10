<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * OCR service adapter for NID verification.
 * Uses a mock response that mirrors Bangladesh NID API format.
 * In production: replace with actual OCR provider (Textract, Google Vision, or BD NID API).
 *
 * Bangladesh NID formats:
 *   Smart Card: 10 digits
 *   Old laminate: 13 or 17 digits
 */
class OcrService
{
    public function extractNidData(string $nidNumber, string $frontPath, string $backPath): array
    {
        // Attempt real OCR provider first
        if (config('services.ocr.provider') === 'aws_textract') {
            return $this->extractViaTextract($frontPath, $backPath, $nidNumber);
        }

        // Fall back to mock for development / testing
        return $this->mockOcrResponse($nidNumber);
    }

    // ── AWS Textract adapter ────────────────────────────────────────
    private function extractViaTextract(string $frontPath, string $backPath, string $nidNumber): array
    {
        try {
            $response = Http::withHeaders([
                'X-Api-Key' => config('services.ocr.api_key'),
            ])->timeout(30)->post(config('services.ocr.endpoint'), [
                'document_front_s3_key' => $frontPath,
                'document_back_s3_key'  => $backPath,
                'expected_nid'          => $nidNumber,
                'country'               => 'BD',
            ]);

            if ($response->failed()) {
                Log::error("OCR API error", ['status' => $response->status(), 'body' => $response->body()]);
                return $this->mockOcrResponse($nidNumber, confidence: 60.0); // low confidence → manual review
            }

            $data = $response->json();

            return [
                'verified'   => ($data['confidence'] ?? 0) >= 75.0,
                'confidence' => $data['confidence'] ?? null,
                'name'       => $data['extracted_name'] ?? null,
                'dob'        => $data['date_of_birth'] ?? null,
                'address'    => $data['address'] ?? null,
                'raw'        => $data,
            ];

        } catch (\Throwable $e) {
            Log::error("OCR extraction exception", ['error' => $e->getMessage()]);
            return $this->mockOcrResponse($nidNumber, confidence: 0.0);
        }
    }

    // ── Mock response (development) ──────────────────────────────────
    private function mockOcrResponse(string $nidNumber, float $confidence = 92.5): array
    {
        // Simulate verification logic based on NID format
        $isValidFormat = preg_match('/^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/', $nidNumber);
        $verified      = $isValidFormat && $confidence >= 75.0;

        return [
            'verified'   => $verified,
            'confidence' => $confidence,
            'name'       => $verified ? 'Md. Rafiqul Islam'         : null,
            'dob'        => $verified ? '1985-03-14'                 : null,
            'address'    => $verified ? 'Diabari, Turag, Dhaka-1230' : null,
            'raw'        => [
                'provider'       => 'mock',
                'nid_number'     => $nidNumber,
                'format_valid'   => (bool) $isValidFormat,
                'confidence'     => $confidence,
                'extracted_name' => $verified ? 'Md. Rafiqul Islam' : null,
                'date_of_birth'  => $verified ? '1985-03-14'        : null,
                'address'        => $verified ? 'Diabari, Turag, Dhaka-1230' : null,
                'mock'           => true,
            ],
        ];
    }
}
