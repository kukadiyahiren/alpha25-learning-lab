<?php

namespace App\Models;

use App\Support\Media;
use Illuminate\Database\Eloquent\Model;

class Ebook extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['cover_url', 'file_url'];

    public function getCoverUrlAttribute(): ?string
    {
        if (! $this->cover_path) {
            $title = trim((string) ($this->title ?: 'eBook'));
            $path = Media::generateEbookCover($title);
            $this->forceFill(['cover_path' => $path])->saveQuietly();
        }

        return Media::url($this->cover_path);
    }

    public function getFileUrlAttribute(): ?string
    {
        return Media::url($this->file_path);
    }
}
