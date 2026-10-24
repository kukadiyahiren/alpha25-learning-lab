<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AudioStory;
use App\Models\Ebook;
use App\Models\GkQuestion;
use App\Models\Grade;
use App\Models\PhonicsLesson;
use App\Models\Question;
use App\Models\SpokenEnglishLesson;
use App\Models\Subject;
use App\Models\Worksheet;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'grades' => Grade::query()->count(),
            'subjects' => Subject::query()->count(),
            'questions' => Question::query()->count(),
            'audio' => AudioStory::query()->count(),
            'ebooks' => Ebook::query()->count(),
            'worksheets' => Worksheet::query()->count(),
            'gk' => GkQuestion::query()->count(),
            'spoken' => SpokenEnglishLesson::query()->count(),
            'phonics' => PhonicsLesson::query()->count(),
        ]);
    }
}
