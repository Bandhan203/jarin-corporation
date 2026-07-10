<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('inventory_units')->nullOnDelete();
            $table->string('invoice_number')->unique();
            $table->unsignedSmallInteger('installment_number');
            $table->decimal('amount_bdt', 14, 2);
            $table->decimal('amount_escrow', 14, 2)->nullable();
            $table->decimal('amount_fee', 14, 2)->nullable();
            $table->enum('status', ['unpaid', 'paid', 'overdue', 'defaulted'])->default('unpaid');
            $table->string('payment_gateway')->nullable();
            $table->string('gateway_transaction_id')->nullable()->unique();
            $table->string('gateway_reference')->nullable();
            $table->json('gateway_raw_response')->nullable();
            $table->unsignedTinyInteger('overdue_streak')->default(0);
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['project_id', 'status']);
            $table->index(['due_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_ledgers');
    }
};
