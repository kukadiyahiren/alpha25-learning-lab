<?php

namespace App\Support;

use App\Models\Worksheet2Question;

class Worksheet2Scoring
{
    public static function normalize(?string $value): string
    {
        $digits = '૦૧૨૩૪૫૬૭૮૯';

        return mb_strtolower(preg_replace(
            '/[\s,.\-]+/u',
            '',
            preg_replace_callback('/[૦-૯]/u', static function (array $match) use ($digits) {
                return (string) mb_strpos($digits, $match[0]);
            }, trim((string) $value)) ?? ''
        ) ?? '');
    }

    public static function isCorrect(Worksheet2Question $question, array $answer): bool
    {
        $type = $question->type ?: 'mcq';

        if (in_array($type, ['fill', 'short', 'sequence'], true)) {
            return self::normalize($answer['answer_text'] ?? null)
                === self::normalize($question->answer_text);
        }

        if ($type === 'clock') {
            $expectedHour = (int) ($question->meta['hour'] ?? -1);
            $expectedMinute = (int) ($question->meta['minute'] ?? -1);
            $hour = (int) ($answer['answer_meta']['hour'] ?? ($answer['answer_index'] ?? -2));
            $minute = (int) ($answer['answer_meta']['minute'] ?? -2);

            return $hour === $expectedHour && $minute === $expectedMinute;
        }

        if ($type === 'match') {
            $expected = $question->meta['answers'] ?? [];
            $given = $answer['answer_meta']['answers'] ?? [];
            if (! is_array($expected) || ! is_array($given) || $expected === []) {
                return false;
            }
            foreach ($expected as $left => $right) {
                if (self::normalize((string) ($given[$left] ?? '')) !== self::normalize((string) $right)) {
                    return false;
                }
            }

            return true;
        }

        // mcq / true_false
        if (! array_key_exists('answer_index', $answer) || $answer['answer_index'] === null || $answer['answer_index'] === '') {
            return false;
        }

        return (int) $answer['answer_index'] === (int) $question->answer_index;
    }

    /** Public question payload without correct answers. */
    public static function publicQuestion(Worksheet2Question $question): array
    {
        $type = $question->type ?: 'mcq';
        $meta = null;

        if ($type === 'match') {
            $meta = [
                'left' => array_values($question->meta['left'] ?? []),
            ];
        }

        if ($type === 'clock') {
            $meta = ['kind' => 'clock'];
        }

        return [
            'id' => $question->id,
            'type' => $type,
            'section' => $question->section,
            'question' => $question->question,
            'options' => $question->options ?: [],
            'meta' => $meta,
            'sort_order' => $question->sort_order,
        ];
    }
}
