<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Worksheet2AttemptAnswer extends Model
{
    protected $table = 'worksheet2_attempt_answers';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'answer_index' => 'integer',
            'answer_meta' => 'array',
            'is_correct' => 'boolean',
        ];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Worksheet2Attempt::class, 'attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Worksheet2Question::class, 'question_id');
    }
}
