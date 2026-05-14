<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
        });

        // Generate slugs for existing clients
        $clients = DB::table('clients')->get();
        foreach ($clients as $client) {
            DB::table('clients')
                ->where('id', $client->id)
                ->update(['slug' => Str::slug($client->name) . '-' . $client->id]); // Adding ID to ensure uniqueness for existing
        }

        // Now make it not nullable if needed, but nullable is fine for now
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
