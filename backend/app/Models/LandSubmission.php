<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandSubmission extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'katha'         => 'decimal:2',
            'submitted_at'  => 'date',
        ];
    }
}
