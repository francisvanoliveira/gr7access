<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'sistema@gr7.dev'],
            [
                'name' => 'Sistema Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('D3v#sys26##'),
                'level' => 3,
                'active' => true,
            ]
        );
    }
}
