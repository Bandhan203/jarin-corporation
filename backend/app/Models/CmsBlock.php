<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsBlock extends Model
{
    protected $guarded = [];

    protected $casts = [
        'content'    => 'array',
        'is_visible' => 'boolean',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(CmsSection::class, 'section_id');
    }
}
