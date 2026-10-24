<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        return Question::query()
            ->when($request->filled('chapter_id'), fn ($q) => $q->where('chapter_id', $request->integer('chapter_id')))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request)
    {
        return Question::query()->create($this->validated($request));
    }

    public function show(Question $question)
    {
        return $question;
    }

    public function update(Request $request, Question $question)
    {
        $question->update($this->validated($request));

        return $question->fresh();
    }

    public function destroy(Question $question)
    {
        $question->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'chapter_id' => ['required', 'integer', 'exists:chapters,id'],
            'type' => ['required', 'in:fill_blank,one_line,short,true_false,match,mcq'],
            'prompt' => ['required', 'string'],
            'answer' => ['nullable', 'string'],
            'options' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }
}
