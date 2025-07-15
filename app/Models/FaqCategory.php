<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class FaqCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'status',
        'sort_order',
        'meta_title',
        'meta_description',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'formatted_created_at',
        'status_badge_color',
        'faqs_count'
    ];

    // Relationships
    public function faqs(): HasMany
    {
        return $this->hasMany(Faq::class, 'category_id');
    }

    public function activeFaqs(): HasMany
    {
        return $this->hasMany(Faq::class, 'category_id')->where('status', 'active');
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

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
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

    public function getFaqsCountAttribute()
    {
        return $this->faqs()->count();
    }

    // Auto-generate slug
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);

                // Ensure unique slug
                $count = static::where('slug', 'like', $category->slug . '%')->count();
                if ($count > 0) {
                    $category->slug = $category->slug . '-' . ($count + 1);
                }
            }

            if (empty($category->sort_order)) {
                $category->sort_order = static::max('sort_order') + 1;
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = Str::slug($category->name);

                // Ensure unique slug
                $count = static::where('slug', 'like', $category->slug . '%')
                    ->where('id', '!=', $category->id)
                    ->count();
                if ($count > 0) {
                    $category->slug = $category->slug . '-' . ($count + 1);
                }
            }
        });
    }
}
