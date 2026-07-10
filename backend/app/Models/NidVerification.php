<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NidVerification extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'date_of_birth'         => 'date',
            'ocr_confidence_score'  => 'decimal:2',
            'ocr_metadata'          => 'array',
            'verified_at'           => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
