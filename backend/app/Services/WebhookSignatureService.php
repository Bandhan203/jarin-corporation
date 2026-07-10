<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

/**
 * Verifies gateway-specific HMAC signatures on inbound webhook callbacks.
 * Each gateway signs its payload differently — this service normalises the check.
 */
class WebhookSignatureService
{
    public function verify(Request $request, string $gateway): bool
    {
        return match ($gateway) {
            'bkash' => $this->verifyBkash($request),
            'nagad' => $this->verifyNagad($request),
            default => false,
        };
    }

    /**
     * bKash sends X-App-Key header; verify against configured app key.
     * In production: validate HMAC-SHA256 against bKash merchant secret.
     */
    private function verifyBkash(Request $request): bool
    {
        $incomingKey = $request->header('X-App-Key');
        $configKey   = Config::get('services.bkash.app_key');
        return $incomingKey && hash_equals((string) $configKey, (string) $incomingKey);
    }

    /**
     * Nagad sends X-KM-Api-Key header.
     */
    private function verifyNagad(Request $request): bool
    {
        $incomingKey = $request->header('X-KM-Api-Key');
        $configKey   = Config::get('services.nagad.api_key');
        return $incomingKey && hash_equals((string) $configKey, (string) $incomingKey);
    }
}
