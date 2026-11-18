<?php

namespace App\Models;

use App\Support\Media;
use Illuminate\Database\Eloquent\Model;

class AudioStory extends Model
{
    public const SECTION_LEARNING = 'learning';

    public const SECTION_STORY = 'story';

    protected $guarded = ['id'];

    protected $appends = ['audio_url'];

    public function getAudioUrlAttribute(): ?string
    {
        return Media::url($this->audio_path);
    }

    public static function sections(): array
    {
        return [
            self::SECTION_LEARNING => 'Learning',
            self::SECTION_STORY => 'Story',
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
            'learning' => self::SECTION_LEARNING,
            'learn' => self::SECTION_LEARNING,
            'lesson' => self::SECTION_LEARNING,
            'education' => self::SECTION_LEARNING,
            'story' => self::SECTION_STORY,
            'stories' => self::SECTION_STORY,
            'katha' => self::SECTION_STORY,
        ];

        return $aliases[$value] ?? self::SECTION_STORY;
    }
}
