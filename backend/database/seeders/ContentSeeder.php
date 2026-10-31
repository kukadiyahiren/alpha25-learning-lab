<?php

namespace Database\Seeders;

use App\Models\AudioStory;
use App\Models\Chapter;
use App\Models\Ebook;
use App\Models\GkQuestion;
use App\Models\Grade;
use App\Models\PhonicsLesson;
use App\Models\Question;
use App\Models\SpokenEnglishLesson;
use App\Models\Subject;
use App\Models\Worksheet;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        if (Grade::query()->exists()) {
            return;
        }

        $subjects = [
            '1-2' => ['ગુજરાતી', 'ગણિત', 'પર્યાવરણ', 'English', 'હિન્દી', 'Computer'],
            '3-5' => ['ગુજરાતી', 'ગણિત', 'પર્યાવરણ', 'English', 'હિન્દી', 'Computer', 'GK', 'Drawing'],
            '6-8' => ['ગણિત', 'વિજ્ઞાન', 'સામાજિક વિજ્ઞાન', 'ગુજરાતી', 'English', 'હિન્દી', 'Computer'],
        ];

        foreach (range(1, 8) as $index => $gradeNumber) {
            $group = $gradeNumber <= 2 ? '1-2' : ($gradeNumber <= 5 ? '3-5' : '6-8');
            $grade = Grade::query()->create([
                'name' => (string) $gradeNumber,
                'group' => $group,
                'sort_order' => $index + 1,
            ]);

            foreach ($subjects[$group] as $subjectIndex => $name) {
                $subject = Subject::query()->create([
                    'grade_id' => $grade->id,
                    'name' => $name,
                    'sort_order' => $subjectIndex + 1,
                ]);

                if ($gradeNumber === 1 && $subjectIndex === 0) {
                    $this->seedSampleChapter($subject);
                }
            }

            Worksheet::query()->create([
                'grade' => (string) $gradeNumber,
                'title' => "ધોરણ {$gradeNumber} practice",
                'description' => 'ગુજરાતી • ગણિત • English • GK • અન્ય વિષયો',
                'sort_order' => $gradeNumber,
            ]);
        }

        AudioStory::query()->create([
            'language' => 'Gujarati',
            'title' => 'નાની ચકલીની હિંમત',
            'body' => 'એક નાની ચકલી વૃક્ષ પર રહેતી હતી. તે દરરોજ વહેલી સવારે ઊડતી હતી. એક દિવસ ભારે પવન આવ્યો. ચકલી ગભરાઈ નહીં અને માળું મજબૂત કર્યું.',
            'sort_order' => 1,
        ]);
        AudioStory::query()->create([
            'language' => 'Hindi',
            'title' => 'मेहनती खरगोश',
            'body' => 'यह हिंदी कहानी का नमूना है. मेहनत से हर काम पूरा होता है.',
            'sort_order' => 2,
        ]);
        AudioStory::query()->create([
            'language' => 'English',
            'title' => 'The Helpful Little Star',
            'body' => 'A little star helped the night sky shine. Kindness made everyone brighter.',
            'sort_order' => 3,
        ]);

        Ebook::query()->create([
            'title' => 'Alpha 25 starter book',
            'description' => 'Upload a PDF from the admin panel. Cover image and download button will show here.',
            'sort_order' => 1,
        ]);

        $gk = [
            'Gujarat' => [
                ['ગુજરાતની રાજધાની કઈ છે?', 'ગાંધીનગર', ['અમદાવાદ', 'ગાંધીનગર', 'સુરત', 'રાજકોટ']],
                ['ગુજરાતનું રાજ્ય પ્રાણી કયું છે?', 'એશિયાઈ સિંહ', ['એશિયાઈ સિંહ', 'વાઘ', 'હાથી', 'ચિત્તો']],
                ['ગુજરાતનો દરિયાકિનારો કયા સમુદ્ર સાથે જોડાયેલો છે?', 'અરબી સમુદ્ર', ['બંગાળની ખાડી', 'અરબી સમુદ્ર', 'હિંદ મહાસાગર', 'કાળો સમુદ્ર']],
            ],
            'India' => [
                ['ભારતની રાજધાની કઈ છે?', 'નવી દિલ્હી', ['મુંબઈ', 'નવી દિલ્હી', 'કોલકાતા', 'ચેન્નઈ']],
                ['ભારતનું રાષ્ટ્રીય પ્રાણી કયું છે?', 'વાઘ', ['સિંહ', 'વાઘ', 'હાથી', 'મોર']],
                ['ભારતનું રાષ્ટ્રીય ફૂલ કયું છે?', 'કમળ', ['ગુલાબ', 'કમળ', 'સૂર્યમુખી', 'જાસૂદ']],
            ],
            'World' => [
                ['પૃથ્વીનો ઉપગ્રહ કયો છે?', 'ચંદ્ર', ['સૂર્ય', 'મંગળ', 'ચંદ્ર', 'શુક્ર']],
                ['વિશ્વનો સૌથી મોટો મહાસાગર કયો છે?', 'પ્રશાંત મહાસાગર', ['અટલાન્ટિક', 'હિંદ મહાસાગર', 'પ્રશાંત મહાસાગર', 'આર્કટિક']],
                ['સૂર્ય શું છે?', 'તારો', ['ગ્રહ', 'તારો', 'ઉપગ્રહ', 'ધૂમકેતુ']],
            ],
        ];
        $order = 1;
        foreach ($gk as $category => $rows) {
            foreach ($rows as [$question, $answer, $options]) {
                GkQuestion::query()->create([
                    'category' => $category,
                    'question' => $question,
                    'answer' => $answer,
                    'options' => $options,
                    'sort_order' => $order++,
                ]);
            }
        }

        $spoken = [
            ['Day 1', 'Greetings', 'Good morning. How are you? I am fine, thank you.'],
            ['Day 2', 'Introduction', 'My name is Rajnish. I am happy to meet you.'],
            ['Day 3', 'Classroom', 'Please open your book. Listen carefully. Repeat after me.'],
        ];
        foreach ($spoken as $index => [$day, $topic, $script]) {
            SpokenEnglishLesson::query()->create([
                'day_label' => $day,
                'topic' => $topic,
                'script' => $script,
                'sort_order' => $index + 1,
            ]);
        }

        $phonics = [
            ['Day 1', 'A a', 'apple'],
            ['Day 2', 'B b', 'ball'],
            ['Day 3', 'C c', 'cat'],
            ['Day 4', 'D d', 'dog'],
            ['Day 5', 'E e', 'egg'],
        ];
        foreach ($phonics as $index => [$day, $letter, $word]) {
            PhonicsLesson::query()->create([
                'day_label' => $day,
                'letter' => $letter,
                'word' => $word,
                'sort_order' => $index + 1,
            ]);
        }
    }

    private function seedSampleChapter(Subject $subject): void
    {
        $chapter = Chapter::query()->create([
            'subject_id' => $subject->id,
            'title' => 'પાઠ 1',
            'body' => 'આ પાઠમાં વિષયનો સરળ પરિચય, ઉદાહરણ અને practice છે.',
            'sort_order' => 1,
        ]);

        $questions = [
            ['fill_blank', 'આ પ્રશ્ન છે: 2 + 2 = ____', '4', null],
            ['one_line', 'આપણે નિયમિત અભ્યાસ શા માટે કરવો જોઈએ?', 'જ્ઞાન અને કુશળતા વધારવા માટે નિયમિત અભ્યાસ કરવો જોઈએ.', null],
            ['match', 'જોડકાં જોડો.', null, [
                ['left' => 'સૂર્ય', 'right' => 'પ્રકાશ'],
                ['left' => 'પાણી', 'right' => 'જીવન માટે જરૂરી'],
            ]],
            ['true_false', 'પાણી જીવન માટે જરૂરી છે.', 'ખરું', null],
            ['short', 'શિક્ષણનો એક લાભ લખો.', 'શિક્ષણથી જ્ઞાન અને સમજ વધે છે.', null],
            ['mcq', 'ગુજરાતની રાજધાની કઈ છે?', 'ગાંધીનગર', ['અમદાવાદ', 'ગાંધીનગર', 'રાજકોટ']],
        ];

        foreach ($questions as $index => [$type, $prompt, $answer, $options]) {
            Question::query()->create([
                'chapter_id' => $chapter->id,
                'type' => $type,
                'prompt' => $prompt,
                'answer' => $answer,
                'options' => $options,
                'sort_order' => $index + 1,
            ]);
        }
    }
}
