<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_escrow_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_ledger_id')->constrained('payment_ledgers')->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->decimal('split_percentage', 5, 2)->default(88.00);
            $table->enum('status', ['held', 'disbursed', 'refunded'])->default('held');
            $table->timestamp('disbursed_at')->nullable();
            $table->string('disbursed_to')->nullable();
            $table->timestamps();

            $table->index('project_id');
            $table->index('status');
        });

        Schema::create('company_corporate_profit_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_ledger_id')->constrained('payment_ledgers')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->decimal('split_percentage', 5, 2)->default(12.00);
            $table->enum('fiscal_quarter', ['Q1', 'Q2', 'Q3', 'Q4']);
            $table->year('fiscal_year');
            $table->enum('status', ['received', 'booked', 'withdrawn'])->default('received');
            $table->timestamps();

            $table->index(['fiscal_year', 'fiscal_quarter'], 'corp_profit_fiscal_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_corporate_profit_ledgers');
        Schema::dropIfExists('project_escrow_ledgers');
    }
};
