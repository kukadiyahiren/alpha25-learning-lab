<?php

namespace Database\Seeders;

use App\Models\Worksheet2Sheet;
use Illuminate\Database\Seeder;

class Worksheet2Seeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'grade' => '1',
                'subject' => 'gujarati',
                'title' => 'ગુજરાતી Worksheet 01',
                'description' => 'ધોરણ 1 ગુજરાતી માટે પ્રેક્ટિસ Worksheet',
                'marks' => 2,
                'time_label' => '10 મિનિટ',
                'icon' => '📖',
                'questions' => [
                    ['type' => 'mcq', 'section' => 'યોગ્ય વિકલ્પ', 'question' => 'ગુજરાતી ભાષામાં સ્વર કેટલા છે?', 'options' => ['10', '13', '16', '20'], 'answer_index' => 1],
                    ['type' => 'mcq', 'section' => 'યોગ્ય વિકલ્પ', 'question' => '‘કમળ’ શબ્દમાં કેટલા અક્ષર છે?', 'options' => ['2', '3', '4', '5'], 'answer_index' => 1],
                ],
            ],
            [
                'grade' => '1',
                'subject' => 'math',
                'title' => 'ગણિત Worksheet 01',
                'description' => 'ધોરણ 1 ગણિત માટે પ્રેક્ટિસ Worksheet',
                'marks' => 2,
                'time_label' => '10 મિનિટ',
                'icon' => '🔢',
                'questions' => [
                    ['type' => 'fill', 'section' => 'ખાલી જગ્યા', 'question' => '2 + 3 = ?', 'options' => [], 'answer_index' => 0, 'answer_text' => '5'],
                    ['type' => 'true_false', 'section' => 'સાચું-ખોટું', 'question' => '5 પછી 6 આવે છે.', 'options' => ['સાચું', 'ખોટું'], 'answer_index' => 0],
                ],
            ],
            [
                'grade' => '3',
                'subject' => 'math',
                'title' => 'ધોરણ-૩ ગણિત | સત્ર પ્રેક્ટિસ વર્કશીટ-૧',
                'description' => 'Satra-style multi-section maths practice (fill, T/F, MCQ, short, sequence, clock, match)',
                'marks' => 30,
                'time_label' => '40 મિનિટ',
                'icon' => '🧮',
                'questions' => [
                    ['type' => 'fill', 'section' => '૧. ખાલી જગ્યા પૂરો', 'question' => '૨૦ માં ઉમેરતા ૪૦ મળે. (ખાલી જગ્યા)', 'options' => [], 'answer_index' => 0, 'answer_text' => '20'],
                    ['type' => 'fill', 'section' => '૧. ખાલી જગ્યા પૂરો', 'question' => '૧૦૦ કરતાં ૫૦ ઓછા એટલે ____.', 'options' => [], 'answer_index' => 0, 'answer_text' => '50'],
                    ['type' => 'fill', 'section' => '૧. ખાલી જગ્યા પૂરો', 'question' => '૪૫ + ૫૪ = ____.', 'options' => [], 'answer_index' => 0, 'answer_text' => '99'],
                    ['type' => 'fill', 'section' => '૧. ખાલી જગ્યા પૂરો', 'question' => '૧૧૦ - ____ = ૮૦.', 'options' => [], 'answer_index' => 0, 'answer_text' => '30'],
                    ['type' => 'true_false', 'section' => '૨. સાચાં કે ખોટાં', 'question' => '૧ કિ.ગ્રા. ખાંડ અને ૧ કિ.ગ્રા. મમરા માટે સમાન કદના ડબ્બા જોઈએ.', 'options' => ['સાચું', 'ખોટું'], 'answer_index' => 1],
                    ['type' => 'mcq', 'section' => '૩. યોગ્ય વિકલ્પ', 'question' => '૩૫ - ____ = ૨૦', 'options' => ['૩૩', '૧૫', '૫૫'], 'answer_index' => 1],
                    ['type' => 'mcq', 'section' => '૩. યોગ્ય વિકલ્પ', 'question' => 'નીચેનામાંથી કઈ ગણતરી ખોટી છે?', 'options' => ['૫૦ + ૨૦ = ૭૦', '૭૦ – ૨૦ = ૫૦', '૨૦ + ૭૦ = ૫૦'], 'answer_index' => 2],
                    ['type' => 'mcq', 'section' => '૩. યોગ્ય વિકલ્પ', 'question' => '૨૦૦ + ____ = ૬૦૦', 'options' => ['૨૦૦', '૩૦૦', '૪૦૦'], 'answer_index' => 2],
                    ['type' => 'short', 'section' => '૪. પ્રશ્નોના જવાબ લખો', 'question' => 'મે મહિનાની તરત પહેલાનો મહિનો કયો?', 'options' => [], 'answer_index' => 0, 'answer_text' => 'એપ્રિલ'],
                    ['type' => 'short', 'section' => '૪. પ્રશ્નોના જવાબ લખો', 'question' => 'લંબચોરસને કેટલી બાજુ હોય?', 'options' => [], 'answer_index' => 0, 'answer_text' => '4'],
                    ['type' => 'short', 'section' => '૪. પ્રશ્નોના જવાબ લખો', 'question' => '૫૨ + ૧૨ કેટલા થાય?', 'options' => [], 'answer_index' => 0, 'answer_text' => '64'],
                    ['type' => 'sequence', 'section' => '૫. ખૂટતી સંખ્યા લખો', 'question' => '૨૮૦, ____, ૨૪૦ (વચ્ચેની સંખ્યા)', 'options' => [], 'answer_index' => 0, 'answer_text' => '260'],
                    ['type' => 'sequence', 'section' => '૫. ખૂટતી સંખ્યા લખો', 'question' => '૧૧૦, ____, ૧૨૬', 'options' => [], 'answer_index' => 0, 'answer_text' => '118'],
                    ['type' => 'fill', 'section' => '૬. સરવાળા / બાદબાકી', 'question' => '૫૬ + ૪૩ = ____', 'options' => [], 'answer_index' => 0, 'answer_text' => '99'],
                    ['type' => 'fill', 'section' => '૬. સરવાળા / બાદબાકી', 'question' => '૪૩૦ + ૧૨૫ = ____', 'options' => [], 'answer_index' => 0, 'answer_text' => '555'],
                    ['type' => 'fill', 'section' => '૯. વ્યવહારિક દાખલા', 'question' => 'જંગલમાં ૬૨૫ ઝાડ હતા, ૧૩૬ પડી ગયા તો કેટલા બાકી?', 'options' => [], 'answer_index' => 0, 'answer_text' => '489'],
                    ['type' => 'clock', 'section' => '૮. સમય / ઘડિયાળ', 'question' => 'ઘડિયાળ પર 3:00 બતાવો', 'options' => [], 'answer_index' => 0, 'meta' => ['hour' => 3, 'minute' => 0]],
                    [
                        'type' => 'match',
                        'section' => '૧૦. જોડકા જોડો',
                        'question' => 'નીચેના જોડકા જોડો',
                        'options' => ['60 મિનિટ', '100 સે.મી.', '12 મહિના'],
                        'answer_index' => 0,
                        'meta' => [
                            'left' => ['1 કલાક', '1 મીટર', '1 વર્ષ'],
                            'answers' => [
                                '1 કલાક' => '60 મિનિટ',
                                '1 મીટર' => '100 સે.મી.',
                                '1 વર્ષ' => '12 મહિના',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($samples as $index => $sample) {
            if (Worksheet2Sheet::query()->where('title', $sample['title'])->where('grade', $sample['grade'])->exists()) {
                continue;
            }

            $questions = $sample['questions'];
            unset($sample['questions']);
            $sheet = Worksheet2Sheet::query()->create([
                ...$sample,
                'sort_order' => $index,
            ]);
            foreach ($questions as $qIndex => $question) {
                $sheet->questions()->create([
                    'type' => $question['type'] ?? 'mcq',
                    'section' => $question['section'] ?? null,
                    'question' => $question['question'],
                    'options' => $question['options'] ?? [],
                    'answer_index' => $question['answer_index'] ?? 0,
                    'answer_text' => $question['answer_text'] ?? null,
                    'meta' => $question['meta'] ?? null,
                    'sort_order' => $qIndex,
                ]);
            }
        }
    }
}
