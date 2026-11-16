<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GkQuestion extends Model
{
    public const SECTION_GENERAL = 'general';

    public const SECTION_COMPETITIVE = 'competitive';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
        ];
    }

    public static function sections(): array
    {
        return [
            self::SECTION_GENERAL => 'General Knowledge',
            self::SECTION_COMPETITIVE => 'Competitive Exam',
        ];
    }

    public static function sectionIds(): array
    {
        return array_keys(self::sections());
    }

    public static function normalizeSection(?string $raw): string
    {
        $value = strtolower(trim((string) $raw));
        $aliases = [
            'general' => self::SECTION_GENERAL,
            'gk' => self::SECTION_GENERAL,
            'general_knowledge' => self::SECTION_GENERAL,
            'general-knowledge' => self::SECTION_GENERAL,
            'generalknowledge' => self::SECTION_GENERAL,
            'competitive' => self::SECTION_COMPETITIVE,
            'competitive_exam' => self::SECTION_COMPETITIVE,
            'competitive-exam' => self::SECTION_COMPETITIVE,
            'competitiveexam' => self::SECTION_COMPETITIVE,
            'exam' => self::SECTION_COMPETITIVE,
            'cet' => self::SECTION_COMPETITIVE,
        ];

        return $aliases[$value] ?? self::SECTION_GENERAL;
    }
}
