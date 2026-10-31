<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Catalog;
use App\Support\Media;
use Illuminate\Http\Request;

class UploadChunkController extends Controller
{
    public function store(Request $request, string $resource)
    {
        Catalog::get($resource);

        $data = $request->validate([
            'upload_id' => ['required', 'string', 'max:80'],
            'chunk_index' => ['required', 'integer', 'min:0', 'max:500'],
            'chunk_total' => ['required', 'integer', 'min:1', 'max:500'],
            'filename' => ['required', 'string', 'max:255'],
            'chunk' => ['required', 'file', 'max:5120'],
        ]);

        Media::storeChunk($data['upload_id'], (int) $data['chunk_index'], $request->file('chunk'));

        return [
            'ok' => true,
            'upload_id' => $data['upload_id'],
            'chunk_index' => (int) $data['chunk_index'],
            'chunk_total' => (int) $data['chunk_total'],
        ];
    }
}
