<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class Media
{
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    public static function store(UploadedFile $file, string $folder): string
    {
        $path = $file->store($folder, 'public');
        if (! $path) {
            throw new \RuntimeException('Could not save the uploaded file. Check storage permissions.');
        }

        return $path;
    }

    public static function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
