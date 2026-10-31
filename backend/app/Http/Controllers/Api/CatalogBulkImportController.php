<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\BulkImport;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CatalogBulkImportController extends Controller
{
    public function templateXlsx(string $resource): StreamedResponse
    {
        $config = BulkImport::get($resource);
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle($config['sheet']);
        $sheet->fromArray(array_merge([$config['columns']], $config['samples']));

        foreach (range(0, count($config['columns']) - 1) as $index) {
            $sheet->getColumnDimensionByColumn($index + 1)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $config['filename'].'.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function templateCsv(string $resource): StreamedResponse
    {
        $config = BulkImport::get($resource);
        $rows = array_merge([$config['columns']], $config['samples']);

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $config['filename'].'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request, string $resource)
    {
        $config = BulkImport::get($resource);
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimetypes:text/plain,text/csv,text/tsv,application/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream',
            ],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $rows = in_array($extension, ['xlsx', 'xls'], true)
            ? $this->rowsFromExcel($file->getRealPath(), $config['aliases'])
            : $this->rowsFromCsv($file->getRealPath(), $config['aliases']);

        if ($rows === []) {
            return response()->json(['message' => 'No data rows found in the file.'], 422);
        }

        $created = 0;
        $skipped = 0;
        $errors = [];
        $mapper = $config['map'];

        foreach ($rows as $index => $row) {
            $line = $index + 2;
            $result = $mapper($row, $line);

            if (! empty($result['skip'])) {
                $skipped++;
                continue;
            }
            if (! empty($result['error'])) {
                $errors[] = $result['error'];
                $skipped++;
                continue;
            }

            $config['model']::query()->create($result['payload']);
            $created++;
        }

        return response()->json([
            'message' => "Imported {$created} {$config['label']}.",
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
        ]);
    }

    private function rowsFromCsv(string $path, array $aliases): array
    {
        $handle = fopen($path, 'r');
        if (! $handle) {
            return [];
        }

        $header = null;
        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if ($data === [null] || $data === false) {
                continue;
            }
            if ($header === null) {
                $header = $this->normalizeHeader($data, $aliases);
                continue;
            }
            $rows[] = $this->mapRow($header, $data);
        }
        fclose($handle);

        return $rows;
    }

    private function rowsFromExcel(string $path, array $aliases): array
    {
        $sheet = IOFactory::load($path)->getActiveSheet();
        $matrix = $sheet->toArray(null, true, true, false);
        if ($matrix === []) {
            return [];
        }

        $header = $this->normalizeHeader(array_shift($matrix), $aliases);
        $rows = [];
        foreach ($matrix as $data) {
            if (! is_array($data)) {
                continue;
            }
            $rows[] = $this->mapRow($header, $data);
        }

        return $rows;
    }

    private function normalizeHeader(array $header, array $aliases): array
    {
        return array_map(function ($value) use ($aliases) {
            $key = strtolower(trim((string) $value));
            $key = str_replace([' ', '-'], '_', $key);

            return $aliases[$key] ?? $key;
        }, $header);
    }

    private function mapRow(array $header, array $data): array
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
}
