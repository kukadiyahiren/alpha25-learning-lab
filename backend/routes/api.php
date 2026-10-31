<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogBulkImportController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\PublicContentController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::get('/classes', [PublicContentController::class, 'classes']);
Route::get('/audio', [PublicContentController::class, 'audio']);
Route::get('/ebooks', [PublicContentController::class, 'ebooks']);
Route::get('/ebooks/{id}', [PublicContentController::class, 'ebook'])->whereNumber('id');
Route::get('/ebooks/{id}/file', [PublicContentController::class, 'ebookFile'])->whereNumber('id');
Route::get('/worksheets', [PublicContentController::class, 'worksheets']);
Route::get('/gk', [PublicContentController::class, 'gk']);
Route::get('/spoken-english', [PublicContentController::class, 'spokenEnglish']);
Route::get('/phonics', [PublicContentController::class, 'phonics']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/admin/stats', [StatsController::class, 'index']);

    Route::apiResource('admin/grades', GradeController::class);
    Route::apiResource('admin/subjects', SubjectController::class);
    Route::apiResource('admin/chapters', ChapterController::class);
    Route::apiResource('admin/questions', QuestionController::class);

    Route::get('/admin/{resource}/import-template.xlsx', [CatalogBulkImportController::class, 'templateXlsx'])
        ->whereIn('resource', ['audio', 'worksheets', 'gk', 'spoken-english', 'phonics']);
    Route::get('/admin/{resource}/import-template.csv', [CatalogBulkImportController::class, 'templateCsv'])
        ->whereIn('resource', ['audio', 'worksheets', 'gk', 'spoken-english', 'phonics']);
    Route::post('/admin/{resource}/import', [CatalogBulkImportController::class, 'import'])
        ->whereIn('resource', ['audio', 'worksheets', 'gk', 'spoken-english', 'phonics']);

    Route::get('/admin/{resource}', [CatalogController::class, 'index']);
    Route::post('/admin/{resource}', [CatalogController::class, 'store']);
    Route::post('/admin/{resource}/{id}', [CatalogController::class, 'update']);
    Route::delete('/admin/{resource}/{id}', [CatalogController::class, 'destroy']);
});
