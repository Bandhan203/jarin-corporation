<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->decimal('total_katha', 8, 2);
            $table->unsignedInteger('total_shares');
            $table->decimal('base_sqft_rate', 12, 2);
            $table->decimal('management_fee_percentage', 5, 2)->default(12.00);
            $table->decimal('funding_percentage', 5, 2)->default(0);
            $table->enum('status', ['crowdfunding', 'construction', 'completed', 'handover'])->default('crowdfunding');
            $table->string('phase_label')->nullable();
            $table->string('hero_image')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
