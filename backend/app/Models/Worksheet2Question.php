<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Worksheet2Question extends Model
{
    protected $table = 'worksheet2_questions';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'answer_index' => 'integer',
            'meta' => 'array',
        ];
    }

    public function sheet(): BelongsTo
    {
        return $this->belongsTo(Worksheet2Sheet::class, 'sheet_id');
    }
}
