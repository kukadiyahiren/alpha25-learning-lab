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

    public static function generateEbookCover(string $title): string
    {
        $title = trim(preg_replace('/\s+/u', ' ', $title) ?? '') ?: 'eBook';
        $lines = self::wrapCoverText($title, 16);
        $palette = [
            ['#006d77', '#00a896', '#1f7aec'],
            ['#1d4ed8', '#2563eb', '#0ea5e9'],
            ['#0f766e', '#14b8a6', '#ffb703'],
            ['#b45309', '#f59e0b', '#ff6b4a'],
            ['#7c3aed', '#2563eb', '#06b6d4'],
        ];
        $colors = $palette[crc32($title) % count($palette)];

        $textSvg = '';
        $startY = 360 - ((count($lines) - 1) * 22);
        foreach ($lines as $index => $line) {
            $y = $startY + ($index * 44);
            $safe = htmlspecialchars($line, ENT_QUOTES | ENT_XML1, 'UTF-8');
            $textSvg .= '<text x="300" y="'.$y.'" text-anchor="middle" font-size="36" font-weight="800" fill="#ffffff" font-family="Nunito, Segoe UI, sans-serif">'.$safe.'</text>';
        }

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" role="img" aria-label="Ebook cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$colors[0]}"/>
      <stop offset="55%" stop-color="{$colors[1]}"/>
      <stop offset="100%" stop-color="{$colors[2]}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" rx="36" fill="url(#bg)"/>
  <circle cx="480" cy="120" r="70" fill="#ffb703" fill-opacity="0.95"/>
  <circle cx="110" cy="680" r="90" fill="#ffffff" fill-opacity="0.12"/>
  <rect x="70" y="90" width="160" height="210" rx="18" fill="#ffffff" fill-opacity="0.18"/>
  <path d="M95 140 h110 M95 180 h90 M95 220 h100" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-opacity="0.7"/>
  <text x="300" y="160" text-anchor="middle" font-size="28" font-weight="800" fill="#ffffff" fill-opacity="0.9" font-family="Nunito, Segoe UI, sans-serif">Alpha 25</text>
  <text x="300" y="198" text-anchor="middle" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.8" font-family="Nunito, Segoe UI, sans-serif">Learning Lab</text>
  {$textSvg}
  <text x="300" y="730" text-anchor="middle" font-size="22" font-weight="700" fill="#ffffff" fill-opacity="0.85" font-family="Nunito, Segoe UI, sans-serif">eBook</text>
</svg>
SVG;

        $path = 'ebooks/covers/'.Str::uuid().'.svg';
        Storage::disk('public')->makeDirectory('ebooks/covers');
        if (! Storage::disk('public')->put($path, $svg)) {
            throw new RuntimeException('Could not generate ebook cover.');
        }

        return $path;
    }

    private static function wrapCoverText(string $text, int $maxChars): array
    {
        $words = preg_split('/\s+/u', $text) ?: [$text];
        $lines = [];
        $current = '';
        foreach ($words as $word) {
            $next = $current === '' ? $word : $current.' '.$word;
            if (mb_strlen($next) > $maxChars && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $next;
            }
            if (count($lines) >= 4) {
                break;
            }
        }
        if ($current !== '' && count($lines) < 5) {
            $lines[] = $current;
        }
        if (count($lines) > 5) {
            $lines = array_slice($lines, 0, 5);
            $lines[4] = rtrim(mb_substr($lines[4], 0, max(1, $maxChars - 1))).'…';
        }

        return $lines ?: [$text];
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
