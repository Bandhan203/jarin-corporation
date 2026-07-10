<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'total_katha'               => 'decimal:2',
            'base_sqft_rate'            => 'decimal:2',
            'management_fee_percentage' => 'decimal:2',
            'funding_percentage'        => 'decimal:2',
        ];
    }

    public function inventoryUnits(): HasMany
    {
        return $this->hasMany(InventoryUnit::class);
    }

    public function paymentLedgers(): HasMany
    {
        return $this->hasMany(PaymentLedger::class);
    }

    public function escrowLedgers(): HasMany
    {
        return $this->hasMany(ProjectEscrowLedger::class);
    }
}
