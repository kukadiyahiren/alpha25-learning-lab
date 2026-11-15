<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Worksheet2Sheet extends Model
{
    protected $table = 'worksheet2_sheets';

    protected $guarded = ['id'];

    protected $appends = ['question_count'];

    public function questions(): HasMany
    {
        return $this->hasMany(Worksheet2Question::class, 'sheet_id')->orderBy('sort_order')->orderBy('id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Worksheet2Attempt::class, 'sheet_id')->latest();
    }

    public function getQuestionCountAttribute(): int
    {
        if (array_key_exists('questions_count', $this->attributes)) {
            return (int) $this->attributes['questions_count'];
        }
        if ($this->relationLoaded('questions')) {
            return $this->questions->count();
        }

        return (int) $this->questions()->count();
    }
}
