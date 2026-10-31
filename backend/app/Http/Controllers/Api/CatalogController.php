<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Catalog;
use App\Support\Media;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function index(string $resource)
    {
        $config = Catalog::get($resource);

        return $config['model']::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function store(Request $request, string $resource)
    {
        $config = Catalog::get($resource);
        $validated = $request->validate($this->rules($config));
        $payload = $this->payload($request, $config, $validated);

        return $config['model']::query()->create($payload);
    }

    public function update(Request $request, string $resource, int $id)
    {
        $config = Catalog::get($resource);
        $model = $config['model']::query()->findOrFail($id);
        $validated = $request->validate($this->rules($config));
        $payload = $this->payload($request, $config, $validated, $model);
        $model->update($payload);

        return $model->fresh();
    }

    public function destroy(string $resource, int $id)
    {
        $config = Catalog::get($resource);
        $model = $config['model']::query()->findOrFail($id);

        foreach ($config['files'] as $meta) {
            Media::delete($model->{$meta['column']});
        }

        $model->delete();

        return response()->noContent();
    }

    private function rules(array $config): array
    {
        $rules = $config['rules'];
        foreach ($config['files'] as $input => $meta) {
            $rules[$input] = $meta['rules'];
        }

        return $rules;
    }

    private function payload(Request $request, array $config, array $validated, $existing = null): array
    {
        $payload = collect($validated)->except(array_keys($config['files']))->all();
        $payload['sort_order'] = $payload['sort_order'] ?? 0;

        if ($request->boolean('options_present') || array_key_exists('options', $payload) || $request->has('options')) {
            $options = collect($request->input('options', $payload['options'] ?? []))
                ->map(fn ($option) => trim((string) $option))
                ->filter(fn ($option) => $option !== '')
                ->values()
                ->all();
            $payload['options'] = $options === [] ? null : $options;
        }

        foreach ($config['files'] as $input => $meta) {
            if ($request->hasFile($input)) {
                if ($existing) {
                    Media::delete($existing->{$meta['column']});
                }
                $payload[$meta['column']] = Media::store($request->file($input), $meta['folder']);
            }
        }

        return $payload;
    }
}
