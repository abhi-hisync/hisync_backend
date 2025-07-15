<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ResourceCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'featured_image',
        'parent_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_active',
        'is_featured',
        'sort_order',
        'resource_count'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
        'resource_count' => 'integer'
    ];

    protected $attributes = [
        'color' => '#3B82F6',
        'is_active' => true,
        'is_featured' => false,
        'sort_order' => 0,
        'resource_count' => 0
    ];

    protected $appends = [
        'full_url',
        'featured_image_url',
        'hierarchy_level',
        'breadcrumb'
    ];

    // Relationships
    public function resources()
    {
        return $this->hasMany(Resource::class, 'category_id');
    }

    public function activeResources()
    {
        return $this->hasMany(Resource::class, 'category_id')
                    ->where('is_published', true)
                    ->where('published_at', '<=', now());
    }

    public function parent()
    {
        return $this->belongsTo(ResourceCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ResourceCategory::class, 'parent_id')
                    ->orderBy('sort_order')
                    ->orderBy('name');
    }

    public function activeChildren()
    {
        return $this->hasMany(ResourceCategory::class, 'parent_id')
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->orderBy('name');
    }

    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    // Accessors
    public function getFullUrlAttribute()
    {
        return config('app.frontend_url') . '/resources/category/' . $this->slug;
    }

    public function getFeaturedImageUrlAttribute()
    {
        if (!$this->featured_image) {
            return null;
        }

        if (Str::startsWith($this->featured_image, ['http://', 'https://'])) {
            return $this->featured_image;
        }

        return config('app.url') . '/storage/' . $this->featured_image;
    }

    public function getHierarchyLevelAttribute()
    {
        $level = 0;
        $parent = $this->parent;

        while ($parent) {
            $level++;
            $parent = $parent->parent;
        }

        return $level;
    }

    public function getBreadcrumbAttribute()
    {
        $breadcrumb = collect([$this]);
        $parent = $this->parent;

        while ($parent) {
            $breadcrumb->prepend($parent);
            $parent = $parent->parent;
        }

        return $breadcrumb->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'url' => $category->full_url
            ];
        });
    }

    // Mutators
    public function setSlugAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['slug'] = $this->generateUniqueSlug($this->name);
        } else {
            $this->attributes['slug'] = Str::slug($value);
        }
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        if (empty($this->attributes['slug'])) {
            $this->attributes['slug'] = $this->generateUniqueSlug($value);
        }
    }

    // Scopes
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeTopLevel(Builder $query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeWithChildren(Builder $query)
    {
        return $query->with(['children' => function ($q) {
            $q->active()->orderBy('sort_order')->orderBy('name');
        }]);
    }

    public function scopeOrdered(Builder $query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeSearch(Builder $query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // Methods
    private function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function updateResourceCount()
    {
        $count = $this->activeResources()->count();

        // Add counts from children categories
        foreach ($this->activeChildren as $child) {
            $count += $child->resource_count;
        }

        $this->update(['resource_count' => $count]);

        // Update parent counts recursively
        if ($this->parent) {
            $this->parent->updateResourceCount();
        }

        return $count;
    }

    public function canDelete()
    {
        return $this->resources()->count() === 0 && $this->children()->count() === 0;
    }

    public function getAncestors()
    {
        $ancestors = collect();
        $parent = $this->parent;

        while ($parent) {
            $ancestors->prepend($parent);
            $parent = $parent->parent;
        }

        return $ancestors;
    }

    public function getDescendants()
    {
        $descendants = collect();

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->getDescendants());
        }

        return $descendants;
    }

    public function isAncestorOf(ResourceCategory $category)
    {
        return $category->getAncestors()->contains('id', $this->id);
    }

    public function isDescendantOf(ResourceCategory $category)
    {
        return $this->getAncestors()->contains('id', $category->id);
    }

    // Static methods
    public static function getHierarchy()
    {
        return static::active()
            ->topLevel()
            ->with(['allChildren' => function ($query) {
                $query->active()->ordered();
            }])
            ->ordered()
            ->get();
    }

    public static function getFlatList()
    {
        return static::active()
            ->with('parent')
            ->ordered()
            ->get()
            ->map(function ($category) {
                $prefix = str_repeat('— ', $category->hierarchy_level);
                return [
                    'id' => $category->id,
                    'name' => $prefix . $category->name,
                    'slug' => $category->slug,
                    'level' => $category->hierarchy_level
                ];
            });
    }

    public static function getPopular($limit = 10)
    {
        return static::active()
            ->where('resource_count', '>', 0)
            ->orderBy('resource_count', 'desc')
            ->limit($limit)
            ->get();
    }

    public static function getFeaturedWithResources()
    {
        return static::active()
            ->featured()
            ->with(['activeResources' => function ($query) {
                $query->limit(6)->orderBy('published_at', 'desc');
            }])
            ->orderBy('sort_order')
            ->get();
    }

    // Boot method for model events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->sort_order)) {
                $category->sort_order = static::max('sort_order') + 1;
            }
        });

        static::saved(function ($category) {
            // Update resource counts when category is saved
            $category->updateResourceCount();
        });

        static::deleting(function ($category) {
            // Move children to parent when deleting
            if ($category->children()->count() > 0) {
                $category->children()->update(['parent_id' => $category->parent_id]);
            }

            // Update resources to remove category reference
            $category->resources()->update(['category_id' => null]);
        });
    }
}
