<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dynamic_cms_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group');
            $table->string('key')->unique();
            $table->enum('type', ['text', 'rich_text', 'image', 'metric'])->default('text');
            $table->text('value');
            $table->string('updated_by')->nullable();
            $table->timestamps();

            $table->index('group');
        });

        Schema::create('platform_cost_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->decimal('value', 14, 2);
            $table->boolean('lock_when_running')->default(false);
            $table->timestamps();
        });

        Schema::create('land_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id')->unique();
            $table->string('landowner_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('location');
            $table->decimal('katha', 8, 2);
            $table->enum('status', ['pending', 'lawyer_assigned', 'approved', 'rejected'])->default('pending');
            $table->date('submitted_at');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('contractor')->nullable()->after('hero_image');
            $table->string('completion_target')->nullable()->after('contractor');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['contractor', 'completion_target']);
        });
        Schema::dropIfExists('land_submissions');
        Schema::dropIfExists('platform_cost_settings');
        Schema::dropIfExists('dynamic_cms_settings');
    }
};
