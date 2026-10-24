<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index()
    {
        return Grade::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        return Grade::query()->create($data);
    }

    public function show(Grade $grade)
    {
        return $grade->load(['subjects.chapters.questions']);
    }

    public function update(Request $request, Grade $grade)
    {
        $grade->update($this->validated($request));

        return $grade->fresh();
    }

    public function destroy(Grade $grade)
    {
        $grade->delete();

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'group' => ['required', 'string', 'max:20'],
            'sort_order' => ['nullable', 'integer'],
        ]);
        $data['sort_order'] = $data['sort_order'] ?? 0;

        return $data;
    }
}
