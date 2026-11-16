<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Worksheet2Attempt;
use App\Models\Worksheet2AttemptAnswer;
use App\Models\Worksheet2Question;
use App\Models\Worksheet2Sheet;
use App\Support\Worksheet2;
use App\Support\Worksheet2Scoring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class Worksheet2Controller extends Controller
{
    public function meta()
    {
        return [
            'standards' => Worksheet2::standards(),
            'subjects' => Worksheet2::subjects(),
            'question_types' => Worksheet2::questionTypes(),
        ];
    }

    public function index(Request $request)
    {
        $query = Worksheet2Sheet::query()
            ->withCount('questions')
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($request->filled('grade')) {
            $query->where('grade', (string) $request->input('grade'));
        }
        if ($request->filled('subject')) {
            $query->where('subject', (string) $request->input('subject'));
        }

        return $query->get();
    }

    public function show(int $id)
    {
        $sheet = Worksheet2Sheet::query()
            ->with('questions')
            ->withCount('questions')
            ->findOrFail($id);

        return [
            'id' => $sheet->id,
            'grade' => $sheet->grade,
            'subject' => $sheet->subject,
            'title' => $sheet->title,
            'description' => $sheet->description,
            'marks' => $sheet->marks,
            'time_label' => $sheet->time_label,
            'icon' => $sheet->icon,
            'sort_order' => $sheet->sort_order,
            'question_count' => $sheet->question_count,
            'questions' => $sheet->questions->map(
                fn (Worksheet2Question $question) => Worksheet2Scoring::publicQuestion($question)
            )->values(),
        ];
    }

    public function submit(Request $request, int $id)
    {
        $sheet = Worksheet2Sheet::query()->with('questions')->findOrFail($id);
        $validated = $request->validate([
            'student_name' => ['required', 'string', 'max:120'],
            'device_id' => ['required', 'string', 'max:64'],
            'grade' => ['nullable', 'string', 'max:20'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.answer_index' => ['nullable', 'integer'],
            'answers.*.answer_text' => ['nullable', 'string', 'max:500'],
            'answers.*.answer_meta' => ['nullable', 'array'],
        ]);

        $studentName = trim($validated['student_name']);
        $studentKey = mb_strtolower(preg_replace('/\s+/u', ' ', $studentName) ?? $studentName);
        $deviceId = trim($validated['device_id']);

        $existing = Worksheet2Attempt::query()
            ->where('sheet_id', $sheet->id)
            ->where(function ($query) use ($deviceId, $studentKey) {
                $query->where('device_id', $deviceId)
                    ->orWhere('student_key', $studentKey);
            })
            ->latest('id')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'આ worksheet તમે પહેલેથી submit કરી ચૂક્યા છો. ફક્ત એક વાર જ કરી શકાય.',
                'already_submitted' => true,
                'attempt_id' => $existing->id,
                'student_name' => $existing->student_name,
                'score' => $existing->score,
                'total' => $existing->total,
                'percent' => $existing->percent,
            ], 409);
        }

        $byId = $sheet->questions->keyBy('id');
        $answerRows = [];
        $score = 0;

        foreach ($validated['answers'] as $row) {
            $question = $byId->get((int) $row['question_id']);
            if (! $question) {
                continue;
            }
            $payload = [
                'answer_index' => $row['answer_index'] ?? null,
                'answer_text' => $row['answer_text'] ?? null,
                'answer_meta' => $row['answer_meta'] ?? null,
            ];
            $ok = Worksheet2Scoring::isCorrect($question, $payload);
            if ($ok) {
                $score++;
            }
            $answerRows[] = [
                'question_id' => $question->id,
                'answer_index' => $payload['answer_index'],
                'answer_text' => $payload['answer_text'],
                'answer_meta' => $payload['answer_meta'],
                'is_correct' => $ok,
            ];
        }

        $total = $sheet->questions->count();
        $percent = $total > 0 ? (int) round(($score / $total) * 100) : 0;

        $attempt = DB::transaction(function () use ($sheet, $validated, $studentName, $studentKey, $deviceId, $score, $total, $percent, $answerRows) {
            $attempt = Worksheet2Attempt::query()->create([
                'sheet_id' => $sheet->id,
                'student_name' => $studentName,
                'device_id' => $deviceId,
                'student_key' => $studentKey,
                'grade' => $validated['grade'] ?? $sheet->grade,
                'score' => $score,
                'total' => $total,
                'percent' => $percent,
                'meta' => [
                    'subject' => $sheet->subject,
                    'title' => $sheet->title,
                ],
            ]);

            foreach ($answerRows as $row) {
                Worksheet2AttemptAnswer::query()->create([
                    'attempt_id' => $attempt->id,
                    ...$row,
                ]);
            }

            return $attempt->load(['answers.question', 'sheet']);
        });

        return [
            'attempt_id' => $attempt->id,
            'student_name' => $attempt->student_name,
            'score' => $attempt->score,
            'total' => $attempt->total,
            'percent' => $attempt->percent,
            'message' => $percent >= 80
                ? '👏 ખૂબ સરસ!'
                : ($percent >= 50 ? '🙂 સારું પ્રયત્ન!' : '💪 ફરી પ્રેક્ટિસ કરો!'),
            'answers' => $attempt->answers->map(fn (Worksheet2AttemptAnswer $answer) => [
                'question_id' => $answer->question_id,
                'is_correct' => $answer->is_correct,
                'question' => $answer->question?->question,
            ])->values(),
        ];
    }

    public function adminAttempts(Request $request)
    {
        $query = Worksheet2Attempt::query()
            ->with(['sheet:id,grade,subject,title'])
            ->latest();

        if ($request->filled('sheet_id')) {
            $query->where('sheet_id', (int) $request->input('sheet_id'));
        }
        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $query->where(function ($builder) use ($q) {
                $builder->where('student_name', 'like', "%{$q}%")
                    ->orWhere('grade', 'like', "%{$q}%");
            });
        }

        return $query->limit(200)->get();
    }

    public function adminAttemptShow(int $id)
    {
        return Worksheet2Attempt::query()
            ->with(['sheet', 'answers.question'])
            ->findOrFail($id);
    }

    public function adminIndex()
    {
        return Worksheet2Sheet::query()
            ->withCount('questions')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function adminShow(int $id)
    {
        return Worksheet2Sheet::query()
            ->with('questions')
            ->withCount('questions')
            ->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $this->validatedSheet($request);

        return DB::transaction(function () use ($data) {
            $sheet = Worksheet2Sheet::query()->create($data['sheet']);
            $this->syncQuestions($sheet, $data['questions']);

            return $sheet->load('questions')->loadCount('questions');
        });
    }

    public function update(Request $request, int $id)
    {
        $sheet = Worksheet2Sheet::query()->findOrFail($id);
        $data = $this->validatedSheet($request);

        return DB::transaction(function () use ($sheet, $data) {
            $sheet->update($data['sheet']);
            $this->syncQuestions($sheet, $data['questions']);

            return $sheet->fresh()->load('questions')->loadCount('questions');
        });
    }

    public function destroy(int $id)
    {
        Worksheet2Sheet::query()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function templateCsv(): StreamedResponse
    {
        $rows = array_merge([Worksheet2::bulkColumns()], Worksheet2::bulkSamples());

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, 'worksheet2-sample.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function templateXlsx(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Worksheet2');
        $sheet->fromArray(array_merge([Worksheet2::bulkColumns()], Worksheet2::bulkSamples()));
        foreach (range(1, count(Worksheet2::bulkColumns())) as $index) {
            $sheet->getColumnDimensionByColumn($index)->setAutoSize(true);
        }
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'worksheet2-sample.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        // Browsers often send HTML samples (.xls) as text/html — trust extension, not MIME.
        if (! in_array($extension, ['csv', 'txt', 'tsv', 'xls', 'xlsx'], true)) {
            return response()->json([
                'message' => 'Upload a CSV or Excel file (.csv, .xls, .xlsx).',
                'errors' => ['file' => ['Upload a CSV or Excel file (.csv, .xls, .xlsx).']],
            ], 422);
        }

        $path = $file->getRealPath();
        $raw = @file_get_contents($path) ?: '';

        try {
            if ($extension === 'xls' && str_contains(strtolower($raw), '<table')) {
                $matrix = $this->matrixFromHtml($raw);
            } elseif (in_array($extension, ['xlsx', 'xls'], true)) {
                $sheet = IOFactory::load($path)->getActiveSheet();
                $highestRow = max(1, (int) $sheet->getHighestDataRow());
                $highestColumn = $sheet->getHighestDataColumn();
                $matrix = $sheet->rangeToArray('A1:'.$highestColumn.$highestRow, null, true, true, false);
            } else {
                $matrix = $this->matrixFromCsv($path);
            }
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Could not read the spreadsheet. Download a fresh Excel sample, keep only filled rows, and upload again.',
                'errors' => ['file' => ['Could not read the spreadsheet.']],
            ], 422);
        }

        if ($matrix === [] || count($matrix) < 2) {
            return response()->json(['message' => 'No data rows found in the file.'], 422);
        }

        $header = $this->normalizeBulkHeader(array_shift($matrix));
        $groups = [];
        $errors = [];

        foreach ($matrix as $index => $cells) {
            $line = $index + 2;
            if (! is_array($cells)) {
                continue;
            }
            $row = $this->mapBulkRow($header, $cells);
            $grade = trim((string) ($row['grade'] ?? ''));
            $subject = trim((string) ($row['subject'] ?? ''));
            $title = trim((string) ($row['title'] ?? ''));
            $question = trim((string) ($row['question'] ?? ''));

            if ($grade === '' && $subject === '' && $title === '' && $question === '') {
                continue;
            }
            if ($grade === '' || $subject === '' || $title === '' || $question === '') {
                $errors[] = "Row {$line}: grade, subject, title and question are required.";
                continue;
            }
            if (! in_array($subject, Worksheet2::subjectIds(), true)) {
                $errors[] = "Row {$line}: unknown subject \"{$subject}\".";
                continue;
            }

            $type = strtolower(trim((string) ($row['type'] ?? 'mcq'))) ?: 'mcq';
            if (! in_array($type, Worksheet2::questionTypeIds(), true)) {
                $errors[] = "Row {$line}: unknown type \"{$type}\".";
                continue;
            }

            $options = array_values(array_filter([
                trim((string) ($row['option_1'] ?? '')),
                trim((string) ($row['option_2'] ?? '')),
                trim((string) ($row['option_3'] ?? '')),
                trim((string) ($row['option_4'] ?? '')),
            ], fn ($value) => $value !== ''));

            $answerText = trim((string) ($row['answer_text'] ?? ''));
            $answerIndex = is_numeric($row['answer_index'] ?? null) ? (int) $row['answer_index'] : 0;

            if (in_array($type, ['mcq', 'true_false'], true)) {
                if ($type === 'true_false' && $options === []) {
                    $options = ['સાચું', 'ખોટું'];
                }
                if (count($options) < 2) {
                    $errors[] = "Row {$line}: MCQ/true_false needs at least 2 options.";
                    continue;
                }
                if (! array_key_exists($answerIndex, $options)) {
                    $errors[] = "Row {$line}: answer_index must match an option (0-based).";
                    continue;
                }
            }
            if (in_array($type, ['fill', 'short', 'sequence'], true) && $answerText === '') {
                $errors[] = "Row {$line}: answer_text is required for fill/short/sequence.";
                continue;
            }

            $key = $grade.'|'.$subject.'|'.$title;
            if (! isset($groups[$key])) {
                $groups[$key] = [
                    'sheet' => [
                        'grade' => $grade,
                        'subject' => $subject,
                        'title' => $title,
                        'description' => trim((string) ($row['description'] ?? '')) ?: null,
                        'marks' => is_numeric($row['marks'] ?? null) ? (int) $row['marks'] : null,
                        'time_label' => trim((string) ($row['time_label'] ?? '')) ?: '20 મિનિટ',
                        'icon' => trim((string) ($row['icon'] ?? '')) ?: '📝',
                        'sort_order' => is_numeric($row['sort_order'] ?? null) ? (int) $row['sort_order'] : 0,
                    ],
                    'questions' => [],
                ];
            }

            $groups[$key]['questions'][] = [
                'type' => $type,
                'section' => trim((string) ($row['section'] ?? '')) ?: null,
                'question' => $question,
                'options' => $options,
                'answer_index' => $answerIndex,
                'answer_text' => $answerText !== '' ? $answerText : null,
                'meta' => null,
                'sort_order' => count($groups[$key]['questions']),
            ];
        }

        if ($groups === []) {
            return response()->json([
                'message' => 'No valid worksheet rows found.',
                'created' => 0,
                'skipped' => 0,
                'errors' => $errors,
            ], 422);
        }

        $created = 0;
        DB::transaction(function () use (&$created, $groups) {
            foreach ($groups as $group) {
                $questions = $group['questions'];
                $sheetPayload = $group['sheet'];
                $sheetPayload['marks'] = $sheetPayload['marks'] ?? count($questions);
                $sheet = Worksheet2Sheet::query()->create($sheetPayload);
                $this->syncQuestions($sheet, $questions);
                $created++;
            }
        });

        return response()->json([
            'message' => "Imported {$created} worksheet".($created === 1 ? '' : 's').'.',
            'created' => $created,
            'skipped' => count($errors),
            'errors' => $errors,
        ]);
    }

    private function matrixFromCsv(string $path): array
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            return [];
        }
        $matrix = [];
        while (($data = fgetcsv($handle)) !== false) {
            if ($data === [null] || $data === false) {
                continue;
            }
            $matrix[] = $data;
        }
        fclose($handle);

        return $matrix;
    }

    private function matrixFromHtml(string $html): array
    {
        if (! preg_match_all('/<tr\b[^>]*>(.*?)<\/tr>/is', $html, $trMatches)) {
            return [];
        }
        $matrix = [];
        foreach ($trMatches[1] as $trHtml) {
            if (! preg_match_all('/<(?:th|td)\b[^>]*>(.*?)<\/(?:th|td)>/is', $trHtml, $cellMatches)) {
                continue;
            }
            $row = array_map(static function ($cell) {
                $text = html_entity_decode(strip_tags($cell), ENT_QUOTES | ENT_HTML5, 'UTF-8');

                return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
            }, $cellMatches[1]);
            if ($row !== [] && array_filter($row, fn ($value) => $value !== '')) {
                $matrix[] = $row;
            }
        }

        return $matrix;
    }

    private function normalizeBulkHeader(array $header): array
    {
        $aliases = [
            'std' => 'grade',
            'standard' => 'grade',
            'class' => 'grade',
            'worksheet_title' => 'title',
            'name' => 'title',
            'desc' => 'description',
            'time' => 'time_label',
            'q' => 'question',
            'prompt' => 'question',
            'option1' => 'option_1',
            'option2' => 'option_2',
            'option3' => 'option_3',
            'option4' => 'option_4',
            'answer' => 'answer_index',
            'correct' => 'answer_index',
            'correct_option' => 'answer_index',
            'ans' => 'answer_text',
            'order' => 'sort_order',
        ];

        return array_map(function ($value) use ($aliases) {
            $key = strtolower(trim((string) $value));
            $key = str_replace([' ', '-'], '_', $key);

            return $aliases[$key] ?? $key;
        }, $header);
    }

    private function mapBulkRow(array $header, array $data): array
    {
        $row = [];
        foreach ($header as $index => $key) {
            if ($key === '') {
                continue;
            }
            $row[$key] = $data[$index] ?? null;
        }

        return $row;
    }

    private function validatedSheet(Request $request): array
    {
        $validated = $request->validate([
            'grade' => ['required', 'string', 'max:20'],
            'subject' => ['required', 'string', Rule::in(Worksheet2::subjectIds())],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'marks' => ['nullable', 'integer', 'min:1', 'max:200'],
            'time_label' => ['nullable', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:16'],
            'sort_order' => ['nullable', 'integer'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['nullable', 'string', Rule::in(Worksheet2::questionTypeIds())],
            'questions.*.section' => ['nullable', 'string', 'max:150'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.options' => ['nullable', 'array', 'max:12'],
            'questions.*.options.*' => ['nullable', 'string', 'max:500'],
            'questions.*.answer_index' => ['nullable', 'integer', 'min:0', 'max:11'],
            'questions.*.answer_text' => ['nullable', 'string', 'max:500'],
            'questions.*.meta' => ['nullable', 'array'],
            'questions.*.sort_order' => ['nullable', 'integer'],
        ]);

        $questions = [];
        foreach ($validated['questions'] as $index => $row) {
            $type = $row['type'] ?? 'mcq';
            $options = array_values(array_filter(
                array_map(fn ($option) => trim((string) $option), $row['options'] ?? []),
                fn ($option) => $option !== ''
            ));
            $answerText = trim((string) ($row['answer_text'] ?? ''));
            $answerIndex = array_key_exists('answer_index', $row) ? (int) $row['answer_index'] : null;
            $line = $index + 1;

            if (in_array($type, ['mcq', 'true_false'], true)) {
                if ($type === 'true_false' && $options === []) {
                    $options = ['સાચું', 'ખોટું'];
                }
                if (count($options) < 2) {
                    abort(422, "Question {$line}: needs at least 2 options.");
                }
                if ($answerIndex === null || ! array_key_exists($answerIndex, $options)) {
                    abort(422, "Question {$line}: pick a correct option.");
                }
            }

            if (in_array($type, ['fill', 'short', 'sequence'], true) && $answerText === '') {
                abort(422, "Question {$line}: answer text is required.");
            }

            if ($type === 'clock') {
                $hour = (int) ($row['meta']['hour'] ?? -1);
                $minute = (int) ($row['meta']['minute'] ?? -1);
                if ($hour < 1 || $hour > 12 || $minute < 0 || $minute > 59) {
                    abort(422, "Question {$line}: clock needs hour (1-12) and minute (0-59).");
                }
                $row['meta'] = ['hour' => $hour, 'minute' => $minute];
                $options = [];
            }

            if ($type === 'match') {
                $left = array_values(array_filter(array_map(
                    'strval',
                    $row['meta']['left'] ?? []
                )));
                $map = $row['meta']['answers'] ?? [];
                if (count($left) < 2 || count($options) < 2) {
                    abort(422, "Question {$line}: match needs left items and right options.");
                }
                if (! is_array($map) || $map === []) {
                    abort(422, "Question {$line}: match answers map is required.");
                }
                $row['meta'] = ['left' => $left, 'answers' => $map];
            }

            $questions[] = [
                'type' => $type,
                'section' => trim((string) ($row['section'] ?? '')) ?: null,
                'question' => trim((string) $row['question']),
                'options' => $options,
                'answer_index' => $answerIndex ?? 0,
                'answer_text' => $answerText !== '' ? $answerText : null,
                'meta' => $row['meta'] ?? null,
                'sort_order' => $row['sort_order'] ?? $index,
            ];
        }

        return [
            'sheet' => [
                'grade' => (string) $validated['grade'],
                'subject' => $validated['subject'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'marks' => $validated['marks'] ?? count($questions),
                'time_label' => $validated['time_label'] ?? '20 મિનિટ',
                'icon' => $validated['icon'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
            ],
            'questions' => $questions,
        ];
    }

    private function syncQuestions(Worksheet2Sheet $sheet, array $questions): void
    {
        $sheet->questions()->delete();
        foreach ($questions as $row) {
            Worksheet2Question::query()->create([
                'sheet_id' => $sheet->id,
                ...$row,
            ]);
        }
    }
}
