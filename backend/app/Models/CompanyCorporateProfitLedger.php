<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyCorporateProfitLedger extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'split_percentage' => 'decimal:2',
        ];
    }

    public function paymentLedger(): BelongsTo
    {
        return $this->belongsTo(PaymentLedger::class);
    }
}
