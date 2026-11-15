<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Worksheet2Attempt extends Model
{
    protected $table = 'worksheet2_attempts';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'total' => 'integer',
            'percent' => 'integer',
            'meta' => 'array',
        ];
    }

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(Worksheet2Sheet::class, 'sheet_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Worksheet2AttemptAnswer::class, 'attempt_id');
    }
}
