<?php

namespace App\Models;

use App\Support\Media;
use Illuminate\Database\Eloquent\Model;

class Worksheet extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['file_url'];

    public function getFileUrlAttribute(): ?string
    {
        return Media::url($this->file_path);
    }
}
