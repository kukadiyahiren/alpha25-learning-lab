<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::query()->count() === 0) {
            User::query()->create([
                'name' => 'Admin',
                'email' => env('ADMIN_EMAIL', 'admin@alpha25.local'),
                'password' => env('ADMIN_PASSWORD', 'Admin@12345'),
            ]);
        }

        $this->call(ContentSeeder::class);
    }
}
