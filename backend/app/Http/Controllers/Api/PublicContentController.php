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
