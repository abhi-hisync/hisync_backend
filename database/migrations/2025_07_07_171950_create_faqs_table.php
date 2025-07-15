<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category')->default('general'); // general, product, billing, technical, etc.
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0); // For ordering FAQs
            $table->boolean('is_featured')->default(false); // For highlighting important FAQs
            $table->json('tags')->nullable(); // For better categorization
            $table->integer('view_count')->default(0); // Track how many times viewed
            $table->boolean('is_helpful_tracking')->default(true); // Enable helpful tracking
            $table->integer('helpful_count')->default(0); // How many found it helpful
            $table->integer('not_helpful_count')->default(0); // How many didn't find it helpful
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('meta_description')->nullable(); // For SEO
            $table->string('slug')->unique(); // URL friendly slug
            $table->timestamps();

            // Indexes for performance
            $table->index(['status', 'sort_order']);
            $table->index(['category', 'status']);
            $table->index('is_featured');
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
