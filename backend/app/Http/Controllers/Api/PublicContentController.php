<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AudioStory;
use App\Models\Ebook;
use App\Models\GkQuestion;
use App\Models\Grade;
use App\Models\PhonicsLesson;
use App\Models\SpokenEnglishLesson;
use App\Models\Worksheet;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicContentController extends Controller
{
    public function classes()
    {
        return Grade::query()
            ->with(['subjects.chapters.questions'])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function audio()
    {
        return AudioStory::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function ebooks()
    {
        return Ebook::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function ebook(int $id)
    {
        return Ebook::query()->findOrFail($id);
    }

    public function ebookFile(int $id): StreamedResponse
    {
        $ebook = Ebook::query()->findOrFail($id);
        abort_unless($ebook->file_path && Storage::disk('public')->exists($ebook->file_path), 404);

        return $this->corsFileResponse($ebook->file_path);
    }

    public function publicFile(string $path): StreamedResponse
    {
        $path = ltrim(str_replace(['..', '\\'], '', $path), '/');
        abort_unless($path !== '' && Storage::disk('public')->exists($path), 404);

        return $this->corsFileResponse($path);
    }

    private function corsFileResponse(string $path): StreamedResponse
    {
        $mime = match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'pdf' => 'application/pdf',
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };

        return Storage::disk('public')->response(
            $path,
            basename($path),
            [
                'Content-Type' => $mime,
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, OPTIONS',
                'Access-Control-Expose-Headers' => 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range',
                'Cache-Control' => 'public, max-age=86400',
            ]
        );
    }

    public function worksheets()
    {
        return Worksheet::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function gk()
    {
        return GkQuestion::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy('category')
            ->map(fn ($items, $category) => [
                'category' => $category,
                'questions' => $items->values(),
            ])
            ->values();
    }

    public function spokenEnglish()
    {
        return SpokenEnglishLesson::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function phonics()
    {
        return PhonicsLesson::query()->orderBy('sort_order')->orderBy('id')->get();
    }
}
