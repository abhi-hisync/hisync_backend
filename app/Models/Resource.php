<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class Resource extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'category_id',
        'tags',
        'author_id',
        'featured_image',
        'gallery_images',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_featured',
        'is_trending',
        'is_published',
        'published_at',
        'read_time',
        'view_count',
        'share_count',
        'like_count',
        'status',
        'seo_score'
    ];

    protected $casts = [
        'tags' => 'array',
        'gallery_images' => 'array',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'view_count' => 'integer',
        'share_count' => 'integer',
        'like_count' => 'integer',
        'read_time' => 'integer',
        'seo_score' => 'integer'
    ];

    protected $attributes = [
        'gallery_images' => '[]',
        'tags' => '[]',
        'view_count' => 0,
        'share_count' => 0,
        'like_count' => 0,
        'read_time' => 1,
        'seo_score' => 0,
        'is_featured' => false,
        'is_trending' => false,
        'is_published' => false,
        'status' => 'draft'
    ];

    protected $dates = [
        'published_at'
    ];

    protected $appends = [
        'reading_time_text',
        'published_date_formatted',
        'full_url'
    ];

    // Relationships
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category()
    {
        return $this->belongsTo(ResourceCategory::class, 'category_id');
    }

    // Accessors
    public function getReadingTimeTextAttribute()
    {
        $minutes = $this->read_time ?: $this->calculateReadTime();
        return $minutes . ' min read';
    }

    public function getPublishedDateFormattedAttribute()
    {
        return $this->published_at ? $this->published_at->format('M d, Y') : null;
    }

    public function getFullUrlAttribute()
    {
        return config('app.frontend_url') . '/resources/' . $this->slug;
    }

    public function getFeaturedImageUrlAttribute()
    {
        if (!$this->featured_image) {
            return null;
        }

        // If it's already a full URL, return as is
        if (Str::startsWith($this->featured_image, ['http://', 'https://'])) {
            return $this->featured_image;
        }

        // Otherwise, construct the full URL
        return config('app.url') . '/storage/' . $this->featured_image;
    }

    public function getGalleryImagesUrlsAttribute()
    {
        if (!$this->gallery_images || !is_array($this->gallery_images)) {
            return [];
        }

        return array_map(function ($image) {
            if (Str::startsWith($image, ['http://', 'https://'])) {
                return $image;
            }
            return config('app.url') . '/storage/' . $image;
        }, $this->gallery_images);
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['slug'] = $this->generateUniqueSlug($this->title);
        } else {
            $this->attributes['slug'] = Str::slug($value);
        }
    }

    public function setTagsAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['tags'] = json_encode(array_map('trim', explode(',', $value)));
        } else {
            $this->attributes['tags'] = json_encode($value);
        }
    }

    // Scopes
    public function scopePublished(Builder $query)
    {
        return $query->where('is_published', true)
                    ->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeTrending(Builder $query)
    {
        return $query->where('is_trending', true);
    }

    public function scopeByCategory(Builder $query, $category)
    {
        if (is_numeric($category)) {
            return $query->where('category_id', $category);
        }

        // Support for legacy category slug/name lookup
        return $query->whereHas('category', function ($q) use ($category) {
            $q->where('slug', $category)->orWhere('name', $category);
        });
    }

    public function scopeSearch(Builder $query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('excerpt', 'like', "%{$search}%")
              ->orWhere('content', 'like', "%{$search}%")
              ->orWhereHas('category', function ($categoryQuery) use ($search) {
                  $categoryQuery->where('name', 'like', "%{$search}%");
              })
              ->orWhereJsonContains('tags', $search);
        });
    }

    public function scopePopular(Builder $query)
    {
        return $query->orderBy('view_count', 'desc');
    }

    public function scopeRecent(Builder $query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    // Methods
    private function generateUniqueSlug($title)
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function calculateReadTime()
    {
        $wordCount = str_word_count(strip_tags($this->content));
        $wordsPerMinute = 200; // Average reading speed
        return max(1, ceil($wordCount / $wordsPerMinute));
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function incrementShareCount()
    {
        $this->increment('share_count');
    }

    public function incrementLikeCount()
    {
        $this->increment('like_count');
    }

    // Static methods
    public static function getCategories()
    {
        // Return active resource categories instead of legacy string categories
        return \App\Models\ResourceCategory::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->pluck('name')
            ->values();
    }

    public static function getCategoriesWithCount()
    {
        // Get categories with resource count using the new category relationship
        return \App\Models\ResourceCategory::withCount(['resources' => function ($query) {
                $query->published();
            }])
            ->orderBy('resources_count', 'desc')
            ->get()
            ->pluck('resources_count', 'name');
    }

    public static function getAllTags()
    {
        $allTags = static::published()
            ->whereNotNull('tags')
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->sort()
            ->values();

        return $allTags;
    }

    public static function getPopularTags($limit = 20)
    {
        $tagCounts = [];

        static::published()
            ->whereNotNull('tags')
            ->get(['tags'])
            ->pluck('tags')
            ->flatten()
            ->each(function ($tag) use (&$tagCounts) {
                $tagCounts[$tag] = ($tagCounts[$tag] ?? 0) + 1;
            });

        arsort($tagCounts);

        return array_slice($tagCounts, 0, $limit, true);
    }

    // SEO Methods
    public function generateSeoScore()
    {
        $score = 0;

        // Title optimization (0-25 points)
        if ($this->title) {
            $titleLength = strlen($this->title);
            if ($titleLength >= 30 && $titleLength <= 60) {
                $score += 25;
            } elseif ($titleLength >= 20 && $titleLength <= 70) {
                $score += 15;
            } elseif ($titleLength > 0) {
                $score += 10;
            }
        }

        // Meta description (0-20 points)
        if ($this->meta_description) {
            $metaLength = strlen($this->meta_description);
            if ($metaLength >= 120 && $metaLength <= 160) {
                $score += 20;
            } elseif ($metaLength >= 100 && $metaLength <= 180) {
                $score += 15;
            } elseif ($metaLength > 0) {
                $score += 10;
            }
        }

        // Content length (0-15 points)
        if ($this->content) {
            $wordCount = str_word_count(strip_tags($this->content));
            if ($wordCount >= 1000) {
                $score += 15;
            } elseif ($wordCount >= 500) {
                $score += 10;
            } elseif ($wordCount >= 300) {
                $score += 5;
            }
        }

        // Featured image (0-10 points)
        if ($this->featured_image) {
            $score += 10;
        }

        // Tags (0-10 points)
        if ($this->tags && count($this->tags) >= 3) {
            $score += 10;
        } elseif ($this->tags && count($this->tags) >= 1) {
            $score += 5;
        }

        // Category (0-5 points)
        if ($this->category_id) {
            $score += 5;
        }

        // Excerpt (0-10 points)
        if ($this->excerpt) {
            $score += 10;
        }

        // Slug optimization (0-5 points)
        if ($this->slug && strlen($this->slug) <= 75) {
            $score += 5;
        }

        $this->update(['seo_score' => $score]);

        return $score;
    }
}
