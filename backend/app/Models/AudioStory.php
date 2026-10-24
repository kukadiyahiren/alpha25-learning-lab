<?php

namespace App\Models;

use App\Support\Media;
use Illuminate\Database\Eloquent\Model;

class AudioStory extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['audio_url'];

    public function getAudioUrlAttribute(): ?string
    {
        return Media::url($this->audio_path);
    }
}
