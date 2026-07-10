<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaymentLedger extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount_bdt'           => 'decimal:2',
            'amount_escrow'        => 'decimal:2',
            'amount_fee'           => 'decimal:2',
            'due_date'             => 'date',
            'paid_at'              => 'datetime',
            'gateway_raw_response' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(InventoryUnit::class, 'unit_id');
    }

    public function escrowLedger(): HasOne
    {
        return $this->hasOne(ProjectEscrowLedger::class);
    }

    public function profitLedger(): HasOne
    {
        return $this->hasOne(CompanyCorporateProfitLedger::class);
    }
}
