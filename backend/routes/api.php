<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CmsController;
use App\Http\Controllers\CostController;
use App\Http\Controllers\LandownerAnalyticsController;
use App\Http\Controllers\LandSubmissionController;
use App\Http\Controllers\CmsMediaController;
use App\Http\Controllers\PageLayoutController;
use App\Http\Controllers\PaymentLedgerController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'estate-archive-api']));

Route::post('/login', [AuthController::class, 'login']);

Route::get('/cms', [CmsController::class, 'index']);
Route::get('/cms/pages', [PageLayoutController::class, 'publicIndex']);
Route::get('/cms/pages/{slug}', [PageLayoutController::class, 'publicShow']);

Route::prefix('webhooks')->group(function () {
    Route::post('bkash', [WebhookController::class, 'bkash']);
    Route::post('nagad', [WebhookController::class, 'nagad']);
});

Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::get('/projects/{id}/matrix', [ProjectController::class, 'matrix']);

Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('nid')->group(function () {
        Route::post('verify', [NidVerificationController::class, 'verify']);
        Route::get('status', [NidVerificationController::class, 'status']);
    });

    Route::get('/landowner/{id}/analytics', [LandownerAnalyticsController::class, 'show']);
    Route::get('/investor/ledger', [PaymentLedgerController::class, 'index']);
    Route::get('/investor/ledger/{invoiceNumber}', [PaymentLedgerController::class, 'show']);

    Route::post('/investor/bookings/reserve', [BookingController::class, 'reserve']);
    Route::post('/investor/payments/initiate', [BookingController::class, 'initiatePayment']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/projects', [AdminController::class, 'projects']);
        Route::patch('/projects/{id}', [AdminController::class, 'updateProject']);
        Route::get('/escrow', [AdminController::class, 'escrowLedger']);

        Route::get('/cms', [CmsController::class, 'adminIndex']);
        Route::patch('/cms/{id}', [CmsController::class, 'update']);

        Route::get('/cms/pages/layout', [PageLayoutController::class, 'adminIndex']);
        Route::post('/cms/pages', [PageLayoutController::class, 'storePage']);
        Route::patch('/cms/pages/{id}', [PageLayoutController::class, 'updatePage']);
        Route::delete('/cms/pages/{id}', [PageLayoutController::class, 'destroyPage']);
        Route::post('/cms/sections', [PageLayoutController::class, 'storeSection']);
        Route::patch('/cms/sections/{id}', [PageLayoutController::class, 'updateSection']);
        Route::delete('/cms/sections/{id}', [PageLayoutController::class, 'destroySection']);
        Route::post('/cms/blocks', [PageLayoutController::class, 'storeBlock']);
        Route::patch('/cms/blocks/{id}', [PageLayoutController::class, 'updateBlock']);
        Route::delete('/cms/blocks/{id}', [PageLayoutController::class, 'destroyBlock']);
        Route::post('/cms/reorder', [PageLayoutController::class, 'reorder']);
        Route::post('/cms/media', [CmsMediaController::class, 'upload']);

        Route::get('/costs', [CostController::class, 'index']);
        Route::patch('/costs/{key}', [CostController::class, 'update']);

        Route::get('/land-submissions', [LandSubmissionController::class, 'index']);
        Route::patch('/land-submissions/{id}', [LandSubmissionController::class, 'updateStatus']);
        Route::post('/land-submissions/{id}/assign-lawyer', [LandSubmissionController::class, 'assignLawyer']);
        Route::post('/land-submissions/{id}/approve', [LandSubmissionController::class, 'approve']);
    });
});
