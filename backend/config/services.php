<?php

return [

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'bkash' => [
        'app_key' => env('BKASH_APP_KEY'),
    ],

    'nagad' => [
        'api_key' => env('NAGAD_API_KEY'),
    ],

    'sms' => [
        'provider' => env('SMS_PROVIDER', 'mock'),
        'ssl_wireless' => [
            'api_token' => env('SMS_SSL_WIRELESS_API_TOKEN'),
            'sid' => env('SMS_SSL_WIRELESS_SID'),
        ],
        'mimsms' => [
            'api_key' => env('SMS_MIMSMS_API_KEY'),
            'api_secret' => env('SMS_MIMSMS_API_SECRET'),
        ],
    ],

    'ocr' => [
        'provider' => env('OCR_PROVIDER', 'mock'),
        'api_key' => env('OCR_API_KEY'),
        'endpoint' => env('OCR_ENDPOINT'),
    ],

];
