<?php

namespace App\Support;

use App\Models\AudioStory;
use App\Models\GkQuestion;
use App\Models\PhonicsLesson;
use App\Models\SpokenEnglishLesson;
use App\Models\Worksheet;

class BulkImport
{
    public static function definitions(): array
    {
        return [
            'audio' => [
                'label' => 'audio stories',
                'sheet' => 'Audio Stories',
                'filename' => 'audio-stories-sample',
                'model' => AudioStory::class,
                'columns' => ['language', 'title', 'body', 'sort_order'],
                'samples' => [
                    ['Gujarati', 'નાની ચકલીની હિંમત', 'એક નાની ચકલી વૃક્ષ પર રહેતી હતી. તે દરરોજ વહેલી સવારે ઊડતી હતી.', 1],
                    ['Hindi', 'मेहनती खरगोश', 'यह हिंदी कहानी का नमूना है. मेहनत से हर काम पूरा होता है.', 2],
                    ['English', 'The Helpful Little Star', 'A little star helped the night sky shine. Kindness made everyone brighter.', 3],
                ],
                'aliases' => [
                    'lang' => 'language',
                    'story_language' => 'language',
                    'story' => 'body',
                    'story_text' => 'body',
                    'text' => 'body',
                    'content' => 'body',
                    'name' => 'title',
                    'story_title' => 'title',
                    'order' => 'sort_order',
                    'sort' => 'sort_order',
                ],
                'map' => function (array $row, int $line): array {
                    $language = trim((string) ($row['language'] ?? ''));
                    $title = trim((string) ($row['title'] ?? ''));
                    $body = trim((string) ($row['body'] ?? ''));
                    $sortOrder = $row['sort_order'] ?? 0;

                    if ($language === '' && $title === '' && $body === '') {
                        return ['skip' => true];
                    }
                    if ($title === '' && $body === '') {
                        return ['error' => "Row {$line}: add at least a title or story text."];
                    }

                    return [
                        'payload' => [
                            'language' => $language !== '' ? $language : null,
                            'title' => $title !== '' ? $title : ($language !== '' ? $language.' story' : 'Untitled'),
                            'body' => $body !== '' ? $body : null,
                            'sort_order' => is_numeric($sortOrder) ? (int) $sortOrder : 0,
                        ],
                    ];
                },
            ],
            'worksheets' => [
                'label' => 'worksheets',
                'sheet' => 'Worksheets',
                'filename' => 'worksheets-sample',
                'model' => Worksheet::class,
                'columns' => ['grade', 'title', 'description', 'sort_order'],
                'samples' => [
                    ['1', 'ધોરણ 1 practice', 'ગુજરાતી • ગણિત • English', 1],
                    ['2', 'ધોરણ 2 practice', 'ગુજરાતી • ગણિત • English', 2],
                    ['3', 'ધોરણ 3 practice', 'ગુજરાતી • ગણિત • English • GK', 3],
                ],
                'aliases' => [
                    'class' => 'grade',
                    'standard' => 'grade',
                    'name' => 'title',
                    'desc' => 'description',
                    'details' => 'description',
                    'order' => 'sort_order',
                    'sort' => 'sort_order',
                ],
                'map' => function (array $row, int $line): array {
                    $grade = trim((string) ($row['grade'] ?? ''));
                    $title = trim((string) ($row['title'] ?? ''));
                    $description = trim((string) ($row['description'] ?? ''));
                    $sortOrder = $row['sort_order'] ?? 0;

                    if ($grade === '' && $title === '' && $description === '') {
                        return ['skip' => true];
                    }
                    if ($grade === '' || $title === '') {
                        return ['error' => "Row {$line}: grade and title are needed."];
                    }

                    return [
                        'payload' => [
                            'grade' => $grade,
                            'title' => $title,
                            'description' => $description !== '' ? $description : null,
                            'sort_order' => is_numeric($sortOrder) ? (int) $sortOrder : 0,
                        ],
                    ];
                },
            ],
            'gk' => [
                'label' => 'GK questions',
                'sheet' => 'GK',
                'filename' => 'gk-questions-sample',
                'model' => GkQuestion::class,
                'columns' => ['category', 'question', 'answer', 'option_1', 'option_2', 'option_3', 'option_4', 'sort_order'],
                'samples' => [
                    ['Gujarat', 'ગુજરાતની રાજધાની કઈ છે?', 'ગાંધીનગર', 'અમદાવાદ', 'ગાંધીનગર', 'સુરત', 'રાજકોટ', 1],
                    ['India', 'ભારતની રાજધાની કઈ છે?', 'નવી દિલ્હી', 'મુંબઈ', 'નવી દિલ્હી', 'કોલકાતા', 'ચેન્નઈ', 2],
                    ['World', 'પૃથ્વીનો ઉપગ્રહ કયો છે?', 'ચંદ્ર', 'સૂર્ય', 'મંગળ', 'ચંદ્ર', 'શુક્ર', 3],
                ],
                'aliases' => [
                    'cat' => 'category',
                    'topic' => 'category',
                    'q' => 'question',
                    'a' => 'answer',
                    'ans' => 'answer',
                    'option1' => 'option_1',
                    'option2' => 'option_2',
                    'option3' => 'option_3',
                    'option4' => 'option_4',
                    'options' => 'option_1',
                    'order' => 'sort_order',
                    'sort' => 'sort_order',
                ],
                'map' => function (array $row, int $line): array {
                    $category = trim((string) ($row['category'] ?? ''));
                    $question = trim((string) ($row['question'] ?? ''));
                    $answer = trim((string) ($row['answer'] ?? ''));
                    $sortOrder = $row['sort_order'] ?? 0;
                    $options = collect([
                        $row['option_1'] ?? null,
                        $row['option_2'] ?? null,
                        $row['option_3'] ?? null,
                        $row['option_4'] ?? null,
                    ])
                        ->map(fn ($option) => trim((string) $option))
                        ->filter(fn ($option) => $option !== '')
                        ->values()
                        ->all();

                    if ($category === '' && $question === '' && $answer === '') {
                        return ['skip' => true];
                    }
                    if ($category === '' || $question === '' || $answer === '') {
                        return ['error' => "Row {$line}: category, question and answer are needed."];
                    }
                    if ($options !== [] && count($options) < 2) {
                        return ['error' => "Row {$line}: add at least 2 options for multiple choice."];
                    }

                    return [
                        'payload' => [
                            'category' => $category,
                            'question' => $question,
                            'answer' => $answer,
                            'options' => $options === [] ? null : $options,
                            'sort_order' => is_numeric($sortOrder) ? (int) $sortOrder : 0,
                        ],
                    ];
                },
            ],
            'spoken-english' => [
                'label' => 'spoken English lessons',
                'sheet' => 'Spoken English',
                'filename' => 'spoken-english-sample',
                'model' => SpokenEnglishLesson::class,
                'columns' => ['day_label', 'topic', 'script', 'sort_order'],
                'samples' => [
                    ['Day 1', 'Greetings', 'Good morning. How are you? I am fine, thank you.', 1],
                    ['Day 2', 'Introduction', 'My name is Rajnish. I am happy to meet you.', 2],
                    ['Day 3', 'Classroom', 'Please open your book. Listen carefully. Repeat after me.', 3],
                ],
                'aliases' => [
                    'day' => 'day_label',
                    'label' => 'day_label',
                    'title' => 'topic',
                    'text' => 'script',
                    'dialogue' => 'script',
                    'content' => 'script',
                    'order' => 'sort_order',
                    'sort' => 'sort_order',
                ],
                'map' => function (array $row, int $line): array {
                    $day = trim((string) ($row['day_label'] ?? ''));
                    $topic = trim((string) ($row['topic'] ?? ''));
                    $script = trim((string) ($row['script'] ?? ''));
                    $sortOrder = $row['sort_order'] ?? 0;

                    if ($day === '' && $topic === '' && $script === '') {
                        return ['skip' => true];
                    }
                    if ($day === '' || $topic === '') {
                        return ['error' => "Row {$line}: day and topic are needed."];
                    }

                    return [
                        'payload' => [
                            'day_label' => $day,
                            'topic' => $topic,
                            'script' => $script !== '' ? $script : null,
                            'sort_order' => is_numeric($sortOrder) ? (int) $sortOrder : 0,
                        ],
                    ];
                },
            ],
            'phonics' => [
                'label' => 'phonics lessons',
                'sheet' => 'Phonics',
                'filename' => 'phonics-sample',
                'model' => PhonicsLesson::class,
                'columns' => ['day_label', 'letter', 'word', 'sort_order'],
                'samples' => [
                    ['Day 1', 'A a', 'apple', 1],
                    ['Day 2', 'B b', 'ball', 2],
                    ['Day 3', 'C c', 'cat', 3],
                ],
                'aliases' => [
                    'day' => 'day_label',
                    'label' => 'day_label',
                    'letters' => 'letter',
                    'sound' => 'letter',
                    'example' => 'word',
                    'order' => 'sort_order',
                    'sort' => 'sort_order',
                ],
                'map' => function (array $row, int $line): array {
                    $day = trim((string) ($row['day_label'] ?? ''));
                    $letter = trim((string) ($row['letter'] ?? ''));
                    $word = trim((string) ($row['word'] ?? ''));
                    $sortOrder = $row['sort_order'] ?? 0;

                    if ($day === '' && $letter === '' && $word === '') {
                        return ['skip' => true];
                    }
                    if ($day === '' || $letter === '' || $word === '') {
                        return ['error' => "Row {$line}: day, letter and word are needed."];
                    }

                    return [
                        'payload' => [
                            'day_label' => $day,
                            'letter' => $letter,
                            'word' => $word,
                            'sort_order' => is_numeric($sortOrder) ? (int) $sortOrder : 0,
                        ],
                    ];
                },
            ],
        ];
    }

    public static function get(string $resource): array
    {
        $definitions = self::definitions();
        abort_unless(isset($definitions[$resource]), 404, 'Bulk import is not available for this section.');

        return $definitions[$resource];
    }
}
