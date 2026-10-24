<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    protected $guarded = ['id'];

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class)->orderBy('sort_order')->orderBy('id');
    }
}
