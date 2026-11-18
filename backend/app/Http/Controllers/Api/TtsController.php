<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TtsController extends Controller
{
    public function speak(Request $request)
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'max:180'],
            'tl' => ['nullable', 'string', 'max:12'],
        ]);

        $text = trim($validated['q']);
        $tl = strtolower(trim((string) ($validated['tl'] ?? 'gu')));
        $allowed = ['gu', 'hi', 'en', 'en-in', 'mr', 'ta', 'te', 'kn'];
        if (! in_array($tl, $allowed, true)) {
            $tl = 'gu';
        }
        if ($tl === 'en-in') {
            $tl = 'en';
        }

        $cacheKey = 'tts_'.md5($tl.'|'.$text);
        $cachePath = storage_path('app/public/tts/'.$cacheKey.'.mp3');
        if (! is_dir(dirname($cachePath))) {
            mkdir(dirname($cachePath), 0775, true);
        }

        if (! is_file($cachePath) || filesize($cachePath) < 64) {
            $url = 'https://translate.google.com/translate_tts?'.http_build_query([
                'ie' => 'UTF-8',
                'client' => 'tw-ob',
                'tl' => $tl,
                'q' => $text,
            ]);

            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept' => '*/*',
                'Referer' => 'https://translate.google.com/',
            ])
                ->timeout(20)
                ->get($url);

            if (! $response->successful() || strlen($response->body()) < 64) {
                return response()->json([
                    'message' => 'Indian voice is temporarily unavailable. Try again.',
                ], 502);
            }

            file_put_contents($cachePath, $response->body());
        }

        return response()->file($cachePath, [
            'Content-Type' => 'audio/mpeg',
            'Cache-Control' => 'public, max-age=86400',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
