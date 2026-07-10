<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryUnit extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'size_sft'       => 'decimal:2',
            'premium_charge' => 'decimal:2',
            'total_price'    => 'decimal:2',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by_user_id');
    }

    public function paymentLedgers(): HasMany
    {
        return $this->hasMany(PaymentLedger::class, 'unit_id');
    }
}
