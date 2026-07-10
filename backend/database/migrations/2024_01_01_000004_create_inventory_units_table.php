<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('unit_number', 10);
            $table->unsignedTinyInteger('floor_number');
            $table->decimal('size_sft', 10, 2);
            $table->decimal('premium_charge', 14, 2)->default(0);
            $table->decimal('total_price', 14, 2);
            $table->string('orientation')->nullable();
            $table->enum('status', ['available', 'reserved', 'sold'])->default('available');
            $table->foreignId('reserved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['project_id', 'unit_number']);
            $table->index(['project_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_units');
    }
};
