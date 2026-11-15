<?php

namespace App\Support;

class Worksheet2
{
    public static function subjects(): array
    {
        return [
            ['id' => 'gujarati', 'name' => 'ગુજરાતી', 'english' => 'Gujarati', 'icon' => '📖'],
            ['id' => 'math', 'name' => 'ગણિત', 'english' => 'Mathematics', 'icon' => '🔢'],
            ['id' => 'environment', 'name' => 'પર્યાવરણ', 'english' => 'Environment', 'icon' => '🌱'],
            ['id' => 'english', 'name' => 'અંગ્રેજી', 'english' => 'English', 'icon' => '🔤'],
            ['id' => 'gk', 'name' => 'સામાન્ય જ્ઞાન', 'english' => 'General Knowledge', 'icon' => '🌎'],
            ['id' => 'hindi', 'name' => 'હિન્દી', 'english' => 'Hindi', 'icon' => '🅰️'],
            ['id' => 'computer', 'name' => 'કમ્પ્યૂટર', 'english' => 'Computer', 'icon' => '💻'],
        ];
    }

    public static function standards(): array
    {
        return collect(range(1, 8))->map(fn (int $n) => [
            'id' => (string) $n,
            'name' => "ધોરણ {$n}",
            'english' => "Standard {$n}",
        ])->all();
    }

    public static function subjectIds(): array
    {
        return array_column(self::subjects(), 'id');
    }

    /** Question types used by satra-style practice papers. */
    public static function questionTypes(): array
    {
        return [
            ['id' => 'mcq', 'label' => 'MCQ (યોગ્ય વિકલ્પ)'],
            ['id' => 'fill', 'label' => 'Fill blank (ખાલી જગ્યા)'],
            ['id' => 'true_false', 'label' => 'True / False (સાચું-ખોટું)'],
            ['id' => 'short', 'label' => 'Short answer (જવાબ લખો)'],
            ['id' => 'sequence', 'label' => 'Sequence (ખૂટતી સંખ્યા)'],
            ['id' => 'match', 'label' => 'Match (જોડકા જોડો)'],
            ['id' => 'clock', 'label' => 'Clock (ઘડિયાળ)'],
        ];
    }

    public static function questionTypeIds(): array
    {
        return array_column(self::questionTypes(), 'id');
    }

    /** One CSV/Excel row = one question; same grade+subject+title groups into one sheet. */
    public static function bulkColumns(): array
    {
        return [
            'grade', 'subject', 'title', 'description', 'marks', 'time_label', 'icon', 'sort_order',
            'section', 'type', 'question', 'option_1', 'option_2', 'option_3', 'option_4',
            'answer_index', 'answer_text',
        ];
    }

    public static function bulkSamples(): array
    {
        return [
            ['1', 'gujarati', 'ગુજરાતી Worksheet 01', 'ધોરણ 1 પ્રેક્ટિસ', 2, '10 મિનિટ', '📖', 0, 'MCQ', 'mcq', 'ગુજરાતી ભાષામાં સ્વર કેટલા છે?', '10', '13', '16', '20', 1, ''],
            ['1', 'gujarati', 'ગુજરાતી Worksheet 01', 'ધોરણ 1 પ્રેક્ટિસ', 2, '10 મિનિટ', '📖', 0, 'MCQ', 'mcq', '‘કમળ’ શબ્દમાં કેટલા અક્ષર છે?', '2', '3', '4', '5', 1, ''],
            ['1', 'math', 'ગણિત Worksheet 01', 'ધોરણ 1 ગણિત', 2, '10 મિનિટ', '🔢', 1, 'Fill', 'fill', '2 + 3 = ?', '', '', '', '', 0, '5'],
            ['1', 'math', 'ગણિત Worksheet 01', 'ધોરણ 1 ગણિત', 2, '10 મિનિટ', '🔢', 1, 'True/False', 'true_false', '5 પછી 6 આવે છે.', 'સાચું', 'ખોટું', '', '', 0, ''],
        ];
    }
}
