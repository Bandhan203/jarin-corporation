<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Dummy SMS gateway service with a real-shape HTTP adapter.
 * Swap out $this->sendViaSslCommerz() for any Bangladeshi SMS API
 * (SSL Wireless, Mimsms, Infobip BD) without changing call sites.
 */
class SmsGatewayService
{
    private string $provider;

    public function __construct()
    {
        $this->provider = config('services.sms.provider', 'ssl_wireless');
    }

    /**
     * @throws \RuntimeException on unrecoverable send failure
     */
    public function send(string $to, string $message): bool
    {
        $to = $this->normalisePhone($to);

        Log::channel('sms')->info("SMS dispatch", ['to' => $to, 'length' => strlen($message)]);

        return match ($this->provider) {
            'ssl_wireless' => $this->sendViaSslWireless($to, $message),
            'mimsms'       => $this->sendViaMimsms($to, $message),
            'mock'         => $this->sendViaMock($to, $message),
            default        => throw new \RuntimeException("Unknown SMS provider: {$this->provider}"),
        };
    }

    // ── SSL Wireless (most common in BD) ────────────────────────────
    private function sendViaSslWireless(string $to, string $message): bool
    {
        $response = Http::timeout(10)->post('https://sms.sslwireless.com/pushapi/dynamic/server.php', [
            'api_token' => config('services.sms.ssl_wireless.api_token'),
            'sid'       => config('services.sms.ssl_wireless.sid'),
            'smstext'   => $message,
            'csmsid'    => uniqid('estate_'),
            'mobile'    => $to,
        ]);

        $success = $response->successful() && ($response->json('status') ?? '') === '200';

        if (! $success) {
            Log::error("SSL Wireless SMS failed", ['response' => $response->body()]);
        }

        return $success;
    }

    // ── Mimsms ──────────────────────────────────────────────────────
    private function sendViaMimsms(string $to, string $message): bool
    {
        $response = Http::timeout(10)->get('https://api.mimsms.com/smsapi', [
            'http_api_key'    => config('services.sms.mimsms.api_key'),
            'http_api_secret' => config('services.sms.mimsms.api_secret'),
            'mobile'          => $to,
            'senderid'        => 'EstateArchive',
            'sms'             => $message,
            'type'            => 'text',
        ]);

        return $response->successful();
    }

    // ── Mock (local dev / test) ──────────────────────────────────────
    private function sendViaMock(string $to, string $message): bool
    {
        Log::info("[MOCK SMS] To: {$to} | Message: {$message}");
        return true;
    }

    // ── Normalise BD phone numbers → 880XXXXXXXXXX ──────────────────
    private function normalisePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '880')) {
            return $digits;
        }
        if (str_starts_with($digits, '0')) {
            return '880' . substr($digits, 1);
        }
        return '880' . $digits;
    }
}
