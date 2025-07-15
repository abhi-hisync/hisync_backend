<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
        'category',
        'category_id',
        'status',
        'sort_order',
        'is_featured',
        'tags',
        'view_count',
        'is_helpful_tracking',
        'helpful_count',
        'not_helpful_count',
        'created_by',
        'updated_by',
        'meta_description',
        'slug'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_featured' => 'boolean',
        'is_helpful_tracking' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_created_at',
        'status_badge_color',
        'category_badge_color',
        'helpfulness_ratio'
    ];

    // Relationships
    public function category(): BelongsTo
    {
        return $this->belongsTo(FaqCategory::class, 'category_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    // Accessors
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at ? $this->created_at->format('M d, Y H:i') : 'N/A';
    }

    public function getStatusBadgeColorAttribute()
    {
        return match($this->status) {
            'active' => 'bg-green-100 text-green-800 border-green-200',
            'inactive' => 'bg-gray-100 text-gray-800 border-gray-200',
            default => 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }

    public function getCategoryBadgeColorAttribute()
    {
        return match($this->category) {
            'general' => 'bg-blue-100 text-blue-800 border-blue-200',
            'product' => 'bg-purple-100 text-purple-800 border-purple-200',
            'billing' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'technical' => 'bg-red-100 text-red-800 border-red-200',
            'account' => 'bg-indigo-100 text-indigo-800 border-indigo-200',
            default => 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }

    public function getHelpfulnessRatioAttribute()
    {
        $total = $this->helpful_count + $this->not_helpful_count;
        if ($total === 0) return 0;
        return round(($this->helpful_count / $total) * 100, 1);
    }

    // Methods
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    public function markAsHelpful()
    {
        if ($this->is_helpful_tracking) {
            $this->increment('helpful_count');
        }
    }

    public function markAsNotHelpful()
    {
        if ($this->is_helpful_tracking) {
            $this->increment('not_helpful_count');
        }
    }

    // Auto-generate slug
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($faq) {
            if (empty($faq->slug)) {
                $faq->slug = Str::slug($faq->question);

                // Ensure unique slug
                $count = static::where('slug', 'like', $faq->slug . '%')->count();
                if ($count > 0) {
                    $faq->slug = $faq->slug . '-' . ($count + 1);
                }
            }
        });

        static::updating(function ($faq) {
            if ($faq->isDirty('question') && empty($faq->slug)) {
                $faq->slug = Str::slug($faq->question);

                // Ensure unique slug
                $count = static::where('slug', 'like', $faq->slug . '%')
                    ->where('id', '!=', $faq->id)
                    ->count();
                if ($count > 0) {
                    $faq->slug = $faq->slug . '-' . ($count + 1);
                }
            }
        });
    }
}
