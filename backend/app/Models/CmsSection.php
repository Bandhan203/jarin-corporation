<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsSection extends Model
{
    protected $guarded = [];

    protected $casts = [
        'settings'   => 'array',
        'is_visible' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(CmsPage::class, 'page_id');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(CmsBlock::class, 'section_id')->orderBy('sort_order');
    }
}
