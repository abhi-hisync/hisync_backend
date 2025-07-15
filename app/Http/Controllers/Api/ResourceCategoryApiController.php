<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResourceCategory;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResourceCategoryApiController extends Controller
{
    /**
     * Display a listing of active categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ResourceCategory::active()
            ->with(['children' => function ($q) {
                $q->active()->orderBy('sort_order')->orderBy('name');
            }])
            ->withCount('activeResources');

        // Filter by parent
        if ($request->filled('parent_only') && $request->boolean('parent_only')) {
            $query->whereNull('parent_id');
        }

        // Filter featured
        if ($request->filled('featured') && $request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Search
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');

        if ($sortBy === 'sort_order') {
            $query->orderBy('sort_order')->orderBy('name');
        } elseif ($sortBy === 'resource_count') {
            $query->orderBy('resource_count', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $categories = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $categories->items(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'last_page' => $categories->lastPage(),
            ]
        ]);
    }

    /**
     * Display the specified category with its resources.
     */
    public function show(string $slug, Request $request): JsonResponse
    {
        $category = ResourceCategory::active()
            ->where('slug', $slug)
            ->with(['parent', 'children' => function ($q) {
                $q->active()->orderBy('sort_order')->orderBy('name');
            }])
            ->withCount('activeResources')
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }

        // Get resources in this category
        $resourceQuery = $category->activeResources()
            ->with('author:id,name,email')
            ->orderBy('published_at', 'desc');

        // Apply resource filters
        if ($request->filled('featured') && $request->boolean('featured')) {
            $resourceQuery->where('is_featured', true);
        }

        if ($request->filled('trending') && $request->boolean('trending')) {
            $resourceQuery->where('is_trending', true);
        }

        if ($request->filled('search')) {
            $resourceQuery->search($request->search);
        }

        $perPage = min($request->get('per_page', 12), 50);
        $resources = $resourceQuery->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category,
                'resources' => $resources->items(),
                'meta' => [
                    'current_page' => $resources->currentPage(),
                    'per_page' => $resources->perPage(),
                    'total' => $resources->total(),
                    'last_page' => $resources->lastPage(),
                ]
            ]
        ]);
    }

    /**
     * Get category hierarchy for navigation.
     */
    public function hierarchy(): JsonResponse
    {
        $categories = ResourceCategory::getHierarchy();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get flat list of categories.
     */
    public function flatList(): JsonResponse
    {
        $categories = ResourceCategory::getFlatList();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get popular categories.
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = min($request->get('limit', 10), 50);
        $categories = ResourceCategory::getPopular($limit);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get featured categories with their latest resources.
     */
    public function featured(): JsonResponse
    {
        $categories = ResourceCategory::getFeaturedWithResources();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get category statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_categories' => ResourceCategory::active()->count(),
            'root_categories' => ResourceCategory::active()->whereNull('parent_id')->count(),
            'featured_categories' => ResourceCategory::active()->where('is_featured', true)->count(),
            'categories_with_resources' => ResourceCategory::active()->where('resource_count', '>', 0)->count(),
            'total_resources_categorized' => ResourceCategory::active()->sum('resource_count'),
            'popular_categories' => ResourceCategory::getPopular(5),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Search categories.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100'
        ]);

        $categories = ResourceCategory::active()
            ->search($request->q)
            ->withCount('activeResources')
            ->orderBy('resource_count', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
            'query' => $request->q
        ]);
    }

    /**
     * Get breadcrumb for a category.
     */
    public function breadcrumb(string $slug): JsonResponse
    {
        $category = ResourceCategory::active()
            ->where('slug', $slug)
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $category->breadcrumb
        ]);
    }

    /**
     * Get related categories.
     */
    public function related(string $slug, Request $request): JsonResponse
    {
        $category = ResourceCategory::active()
            ->where('slug', $slug)
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found.'
            ], 404);
        }

        $limit = min($request->get('limit', 6), 20);
        $related = collect();

        // Get sibling categories (same parent)
        if ($category->parent_id) {
            $siblings = ResourceCategory::active()
                ->where('parent_id', $category->parent_id)
                ->where('id', '!=', $category->id)
                ->withCount('activeResources')
                ->orderBy('resource_count', 'desc')
                ->limit($limit)
                ->get();

            $related = $related->merge($siblings);
        }

        // If we need more, get popular categories
        if ($related->count() < $limit) {
            $remaining = $limit - $related->count();
            $popular = ResourceCategory::getPopular($remaining * 2)
                ->reject(function ($cat) use ($category, $related) {
                    return $cat->id === $category->id || $related->contains('id', $cat->id);
                })
                ->take($remaining);

            $related = $related->merge($popular);
        }

        return response()->json([
            'success' => true,
            'data' => $related->take($limit)->values()
        ]);
    }

    /**
     * Get category analytics (public version).
     */
    public function analytics(Request $request): JsonResponse
    {
        $analytics = [
            'top_categories' => ResourceCategory::active()
                ->where('resource_count', '>', 0)
                ->orderBy('resource_count', 'desc')
                ->limit(10)
                ->get(['name', 'slug', 'resource_count']),

            'featured_stats' => [
                'total' => ResourceCategory::active()->where('is_featured', true)->count(),
                'with_resources' => ResourceCategory::active()
                    ->where('is_featured', true)
                    ->where('resource_count', '>', 0)
                    ->count(),
            ],

            'hierarchy_stats' => [
                'root_categories' => ResourceCategory::active()->whereNull('parent_id')->count(),
                'subcategories' => ResourceCategory::active()->whereNotNull('parent_id')->count(),
                'max_depth' => ResourceCategory::active()->max('hierarchy_level') ?? 0,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }
}
