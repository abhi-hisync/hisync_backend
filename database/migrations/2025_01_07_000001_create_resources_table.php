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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('category');
            $table->json('tags')->nullable();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');

            // SEO fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();

            // Media fields
            $table->string('featured_image')->nullable();
            $table->json('gallery_images')->nullable();

            // Status fields
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->enum('status', ['draft', 'review', 'published', 'archived'])->default('draft');

            // Analytics fields
            $table->integer('view_count')->default(0);
            $table->integer('share_count')->default(0);
            $table->integer('like_count')->default(0);
            $table->integer('read_time')->nullable(); // in minutes
            $table->integer('seo_score')->default(0);

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['is_published', 'published_at']);
            $table->index(['category']);
            $table->index(['is_featured']);
            $table->index(['is_trending']);
            $table->index(['status']);
            $table->index(['view_count']);
            $table->index(['author_id']);

            // Note: Full-text search indexes are not supported in SQLite
            // For production MySQL/PostgreSQL, uncomment the following:
            // $table->fullText(['title', 'excerpt', 'content']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
