<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nid_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nid_number', 20);
            $table->string('full_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->decimal('ocr_confidence_score', 5, 2)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('nid_front_path')->nullable();
            $table->string('nid_back_path')->nullable();
            $table->json('ocr_metadata')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('nid_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nid_verifications');
    }
};
