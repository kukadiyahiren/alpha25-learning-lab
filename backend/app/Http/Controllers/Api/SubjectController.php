<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        return Subject::query()
            ->when($request->filled('grade_id'), fn ($q) => $q->where('grade_id', $request->integer('grade_id')))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request)
    {
        return Subject::query()->create($this->validated($request));
    }

    public function show(Subject $subject)
    {
        return $subject->load(['chapters.questions']);
    }

    public function update(Request $request, Subject $subject)
    {
        $subject->update($this->validated($request));

        return $subject->fresh();
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'grade_id' => ['required', 'integer', 'exists:grades,id'],
            'name' => ['required', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }
}
