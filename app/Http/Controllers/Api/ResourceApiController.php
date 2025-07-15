<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;

class ResourceApiController extends Controller
{
    /**
     * Get all published resources with filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Resource::published()
                ->with('author:id,name,email')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category', 'tags',
                    'author_id', 'featured_image', 'is_featured', 'is_trending',
                    'published_at', 'read_time', 'view_count', 'share_count',
                    'like_count', 'seo_score'
                ]);

            // Apply filters
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            if ($request->filled('category')) {
                $query->byCategory($request->category);
            }

            if ($request->filled('tag')) {
                $query->whereJsonContains('tags', $request->tag);
            }

            if ($request->boolean('featured')) {
                $query->featured();
            }

            if ($request->boolean('trending')) {
                $query->trending();
            }

            // Apply sorting
            $sortBy = $request->get('sort', 'latest');
            switch ($sortBy) {
                case 'popular':
                    $query->popular();
                    break;
                case 'trending':
                    $query->orderBy('share_count', 'desc');
                    break;
                case 'oldest':
                    $query->orderBy('published_at', 'asc');
                    break;
                case 'latest':
                default:
                    $query->recent();
                    break;
            }

            // Get paginated results
            $perPage = min($request->get('per_page', 12), 50); // Max 50 per page
            $resources = $query->paginate($perPage);

            // Get additional data
            $categories = Resource::getCategoriesWithCount();
            $featuredResources = Resource::published()
                ->featured()
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count'
                ])
                ->limit(3)
                ->get();

            $trendingResources = Resource::published()
                ->trending()
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count', 'share_count'
                ])
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'resources' => $resources->items(),
                    'pagination' => [
                        'current_page' => $resources->currentPage(),
                        'last_page' => $resources->lastPage(),
                        'per_page' => $resources->perPage(),
                        'total' => $resources->total(),
                        'from' => $resources->firstItem(),
                        'to' => $resources->lastItem(),
                    ],
                    'categories' => $categories,
                    'featured_resources' => $featuredResources,
                    'trending_resources' => $trendingResources,
                    'total_count' => $resources->total(),
                ],
                'meta' => [
                    'filters_applied' => [
                        'search' => $request->search,
                        'category' => $request->category,
                        'tag' => $request->tag,
                        'featured' => $request->boolean('featured'),
                        'trending' => $request->boolean('trending'),
                        'sort' => $sortBy,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch resources',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get a specific resource by slug.
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $resource = Resource::published()
                ->with([
                    'author:id,name,email',
                ])
                ->where('slug', $slug)
                ->firstOrFail();

            // Increment view count (with rate limiting per IP)
            $cacheKey = 'resource_view_' . $resource->id . '_' . request()->ip();
            if (!Cache::has($cacheKey)) {
                $resource->incrementViewCount();
                Cache::put($cacheKey, true, now()->addHour());
            }

            // Get related resources
            $relatedResources = Resource::published()
                ->where('id', '!=', $resource->id)
                ->where('category_id', $resource->category_id)
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category_id',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count'
                ])
                ->orderBy('view_count', 'desc')
                ->limit(4)
                ->get();

            // Get next/previous resources
            $nextResource = Resource::published()
                ->where('published_at', '>', $resource->published_at)
                ->orderBy('published_at', 'asc')
                ->select('id', 'title', 'slug')
                ->first();

            $previousResource = Resource::published()
                ->where('published_at', '<', $resource->published_at)
                ->orderBy('published_at', 'desc')
                ->select('id', 'title', 'slug')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'resource' => $resource,
                    'related_resources' => $relatedResources,
                    'next_resource' => $nextResource,
                    'previous_resource' => $previousResource,
                ],
                'meta' => [
                    'canonical_url' => $resource->full_url,
                    'schema_org' => $this->generateSchemaOrg($resource),
                ]
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found',
                'error' => 'The requested resource does not exist or is not published.'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch resource',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get resources by category.
     */
    public function byCategory(string $category, Request $request): JsonResponse
    {
        try {
            $query = Resource::published()
                ->byCategory($category)
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category', 'tags',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count', 'share_count'
                ]);

            // Apply additional filters
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            $sortBy = $request->get('sort', 'latest');
            switch ($sortBy) {
                case 'popular':
                    $query->popular();
                    break;
                case 'latest':
                default:
                    $query->recent();
                    break;
            }

            $perPage = min($request->get('per_page', 12), 50);
            $resources = $query->paginate($perPage);

            // Get category stats
            $categoryStats = [
                'total_resources' => Resource::published()->byCategory($category)->count(),
                'total_views' => Resource::published()->byCategory($category)->sum('view_count'),
                'avg_read_time' => Resource::published()->byCategory($category)->avg('read_time'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'resources' => $resources->items(),
                    'pagination' => [
                        'current_page' => $resources->currentPage(),
                        'last_page' => $resources->lastPage(),
                        'per_page' => $resources->perPage(),
                        'total' => $resources->total(),
                    ],
                    'category' => $category,
                    'category_stats' => $categoryStats,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category resources',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get featured resources.
     */
    public function featured(): JsonResponse
    {
        try {
            $resources = Resource::published()
                ->featured()
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category', 'tags',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count', 'share_count'
                ])
                ->recent()
                ->limit(6)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'resources' => $resources,
                    'total_count' => $resources->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured resources',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get trending resources.
     */
    public function trending(): JsonResponse
    {
        try {
            $resources = Resource::published()
                ->trending()
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category', 'tags',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count', 'share_count'
                ])
                ->orderBy('share_count', 'desc')
                ->limit(8)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'resources' => $resources,
                    'total_count' => $resources->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trending resources',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Search resources.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'category' => 'nullable|string',
            'per_page' => 'integer|min:1|max:50'
        ]);

        try {
            $query = Resource::published()
                ->search($request->q)
                ->with('author:id,name')
                ->select([
                    'id', 'title', 'slug', 'excerpt', 'category', 'tags',
                    'author_id', 'featured_image', 'published_at',
                    'read_time', 'view_count'
                ]);

            if ($request->filled('category')) {
                $query->byCategory($request->category);
            }

            $perPage = $request->get('per_page', 12);
            $resources = $query->recent()->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'resources' => $resources->items(),
                    'pagination' => [
                        'current_page' => $resources->currentPage(),
                        'last_page' => $resources->lastPage(),
                        'per_page' => $resources->perPage(),
                        'total' => $resources->total(),
                    ],
                    'search_query' => $request->q,
                    'category_filter' => $request->category,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get all categories with resource counts.
     */
    public function categories(): JsonResponse
    {
        try {
            $categories = Resource::getCategoriesWithCount();

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'total_categories' => $categories->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Get popular tags.
     */
    public function tags(): JsonResponse
    {
        try {
            $tags = Resource::getPopularTags(30);

            return response()->json([
                'success' => true,
                'data' => [
                    'tags' => $tags,
                    'total_tags' => count($tags),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tags',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Increment share count for a resource.
     */
    public function share(string $slug): JsonResponse
    {
        try {
            $resource = Resource::published()
                ->where('slug', $slug)
                ->firstOrFail();

            $resource->incrementShareCount();

            return response()->json([
                'success' => true,
                'message' => 'Share count updated',
                'share_count' => $resource->fresh()->share_count
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update share count',
                'error' => app()->environment('local') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Generate Schema.org structured data for a resource.
     */
    private function generateSchemaOrg(Resource $resource): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $resource->title,
            'description' => $resource->excerpt,
            'image' => $resource->featured_image_url,
            'author' => [
                '@type' => 'Person',
                'name' => $resource->author->name,
                'email' => $resource->author->email,
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name'),
                'url' => config('app.url'),
            ],
            'datePublished' => $resource->published_at->toISOString(),
            'dateModified' => $resource->updated_at->toISOString(),
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $resource->full_url,
            ],
            'keywords' => implode(', ', $resource->tags ?? []),
            'articleSection' => $resource->category,
            'wordCount' => str_word_count(strip_tags($resource->content)),
            'timeRequired' => 'PT' . ($resource->read_time ?? 5) . 'M',
        ];
    }
}
