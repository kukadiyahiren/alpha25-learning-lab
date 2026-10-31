<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

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
            throw new RuntimeException('Could not save the uploaded file. Check storage permissions.');
        }

        return $path;
    }

    public static function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public static function storeChunk(string $uploadId, int $index, UploadedFile $chunk): void
    {
        $uploadId = self::safeUploadId($uploadId);
        $dir = "chunks/{$uploadId}";
        Storage::disk('local')->makeDirectory($dir);
        Storage::disk('local')->putFileAs($dir, $chunk, sprintf('%06d.part', $index));
    }

    public static function assembleChunks(string $uploadId, int $total, string $folder, string $filename): string
    {
        $uploadId = self::safeUploadId($uploadId);
        $dir = "chunks/{$uploadId}";
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: 'bin');
        $target = trim($folder, '/').'/'.Str::uuid().'.'.$extension;

        Storage::disk('public')->makeDirectory($folder);

        $absolute = Storage::disk('public')->path($target);
        $out = fopen($absolute, 'wb');
        if ($out === false) {
            throw new RuntimeException('Could not create assembled upload file.');
        }

        try {
            for ($i = 0; $i < $total; $i++) {
                $part = sprintf('%s/%06d.part', $dir, $i);
                if (! Storage::disk('local')->exists($part)) {
                    throw new RuntimeException("Missing upload chunk {$i}.");
                }
                $data = Storage::disk('local')->get($part);
                fwrite($out, $data);
            }
        } finally {
            fclose($out);
            Storage::disk('local')->deleteDirectory($dir);
        }

        return $target;
    }

    private static function safeUploadId(string $uploadId): string
    {
        $clean = preg_replace('/[^a-zA-Z0-9\-_]/', '', $uploadId) ?: '';
        if ($clean === '' || strlen($clean) > 80) {
            throw new RuntimeException('Invalid upload id.');
        }

        return $clean;
    }
}
