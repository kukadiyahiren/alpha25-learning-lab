<?php

namespace App\Support;

use App\Models\AudioStory;
use App\Models\Ebook;
use App\Models\GkQuestion;
use App\Models\PhonicsLesson;
use App\Models\SpokenEnglishLesson;
use App\Models\Worksheet;

class Catalog
{
    public static function get(string $resource): array
    {
        $audio = ['nullable', 'file', 'mimes:mp3,wav,ogg,m4a,webm', 'max:20480'];
        $document = ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:30720'];
        $image = ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'];

        $map = [
            'audio' => [
                'model' => AudioStory::class,
                'rules' => [
                    'language' => ['nullable', 'string', 'max:50'],
                    'title' => ['nullable', 'string', 'max:255'],
                    'body' => ['nullable', 'string'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [
                    'audio' => ['column' => 'audio_path', 'folder' => 'audio', 'rules' => $audio],
                ],
            ],
            'ebooks' => [
                'model' => Ebook::class,
                'rules' => [
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['nullable', 'string'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [
                    'cover' => ['column' => 'cover_path', 'folder' => 'ebooks/covers', 'rules' => $image],
                    'file' => ['column' => 'file_path', 'folder' => 'ebooks/files', 'rules' => $document],
                ],
            ],
            'worksheets' => [
                'model' => Worksheet::class,
                'rules' => [
                    'grade' => ['required', 'string', 'max:20'],
                    'title' => ['required', 'string', 'max:255'],
                    'description' => ['nullable', 'string'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [
                    'file' => ['column' => 'file_path', 'folder' => 'worksheets', 'rules' => $document],
                ],
            ],
            'gk' => [
                'model' => GkQuestion::class,
                'rules' => [
                    'category' => ['required', 'string', 'max:100'],
                    'question' => ['required', 'string'],
                    'answer' => ['required', 'string'],
                    'options' => ['nullable', 'array', 'max:8'],
                    'options.*' => ['nullable', 'string', 'max:500'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [],
            ],
            'spoken-english' => [
                'model' => SpokenEnglishLesson::class,
                'rules' => [
                    'day_label' => ['required', 'string', 'max:100'],
                    'topic' => ['required', 'string', 'max:255'],
                    'script' => ['nullable', 'string'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [
                    'audio' => ['column' => 'audio_path', 'folder' => 'spoken-english', 'rules' => $audio],
                ],
            ],
            'phonics' => [
                'model' => PhonicsLesson::class,
                'rules' => [
                    'day_label' => ['required', 'string', 'max:100'],
                    'letter' => ['required', 'string', 'max:50'],
                    'word' => ['required', 'string', 'max:100'],
                    'sort_order' => ['nullable', 'integer'],
                ],
                'files' => [
                    'audio' => ['column' => 'audio_path', 'folder' => 'phonics', 'rules' => $audio],
                ],
            ],
        ];

        abort_unless(isset($map[$resource]), 404, 'Unknown section.');

        return $map[$resource];
    }
}
