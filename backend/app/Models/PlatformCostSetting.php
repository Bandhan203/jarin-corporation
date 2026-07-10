<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformCostSetting extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'value'              => 'decimal:2',
            'lock_when_running'  => 'boolean',
        ];
    }
}
