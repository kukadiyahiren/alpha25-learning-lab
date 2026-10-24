<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    public function index(Request $request)
    {
        return Chapter::query()
            ->when($request->filled('subject_id'), fn ($q) => $q->where('subject_id', $request->integer('subject_id')))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request)
    {
        return Chapter::query()->create($this->validated($request));
    }

    public function show(Chapter $chapter)
    {
        return $chapter->load('questions');
    }

    public function update(Request $request, Chapter $chapter)
    {
        $chapter->update($this->validated($request));

        return $chapter->fresh();
    }

    public function destroy(Chapter $chapter)
    {
        $chapter->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }
}
