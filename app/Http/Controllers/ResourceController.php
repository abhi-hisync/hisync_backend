<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\User;
use App\Http\Requests\ResourceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResourceController extends Controller
{
    /**
     * Display the resources dashboard.
     */
    public function index(Request $request): Response
    {
        $query = Resource::with(['author:id,name,email', 'category:id,name,slug,color'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('author') && $request->author !== 'all') {
            $query->where('author_id', $request->author);
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        if ($request->filled('trending')) {
            $query->where('is_trending', $request->boolean('trending'));
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $resources = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Resource::count(),
            'published' => Resource::where('is_published', true)->count(),
            'draft' => Resource::where('status', 'draft')->count(),
            'featured' => Resource::where('is_featured', true)->count(),
            'trending' => Resource::where('is_trending', true)->count(),
            'today' => Resource::whereDate('created_at', today())->count(),
            'this_month' => Resource::whereMonth('created_at', now()->month)->count(),
            'total_views' => Resource::sum('view_count'),
            'avg_seo_score' => round(Resource::avg('seo_score'), 1),
        ];

        // Get filter options
        $filters = [
            'statuses' => [
                ['value' => 'all', 'label' => 'All Statuses'],
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'review', 'label' => 'In Review'],
                ['value' => 'published', 'label' => 'Published'],
                ['value' => 'archived', 'label' => 'Archived'],
            ],
            'categories' => collect([['value' => 'all', 'label' => 'All Categories']])
                ->concat(
                    \App\Models\ResourceCategory::active()
                        ->orderBy('sort_order')
                        ->orderBy('name')
                        ->get()
                        ->map(fn($category) => [
                            'value' => $category->id,
                            'label' => $category->name,
                            'color' => $category->color
                        ])
                ),
            'authors' => collect([['value' => 'all', 'label' => 'All Authors']])
                ->concat(
                    User::select('id', 'name')
                        ->whereIn('id', Resource::distinct()->pluck('author_id'))
                        ->orderBy('name')
                        ->get()
                        ->map(fn($user) => ['value' => $user->id, 'label' => $user->name])
                ),
        ];

        return Inertia::render('Resources/Index', [
            'resources' => $resources,
            'stats' => $stats,
            'filters' => $filters,
            'queryParams' => $request->only(['status', 'category', 'author', 'featured', 'trending', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $authors = User::select('id', 'name', 'email')->orderBy('name')->get();
        $categories = Resource::getCategories();
        $resourceCategories = \App\Models\ResourceCategory::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'parent_id']);
        $popularTags = Resource::getPopularTags(50);

        return Inertia::render('Resources/Create', [
            'authors' => $authors,
            'categories' => $categories,
            'resourceCategories' => $resourceCategories,
            'popularTags' => $popularTags,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ResourceRequest $request)
    {
        $validatedData = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $validatedData['featured_image'] = $request->file('featured_image')
                ->store('resources/featured', 'public');
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            $galleryPaths = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryPaths[] = $image->store('resources/gallery', 'public');
            }
            $validatedData['gallery_images'] = $galleryPaths;
        }

        // Calculate read time if not provided
        if (!isset($validatedData['read_time'])) {
            $wordCount = str_word_count(strip_tags($validatedData['content']));
            $validatedData['read_time'] = max(1, ceil($wordCount / 200));
        }

        $resource = Resource::create($validatedData);

        // Generate SEO score
        $resource->generateSeoScore();

        return redirect()->route('resources.index')
            ->with('success', 'Resource created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Resource $resource): Response
    {
        $resource->load('author:id,name,email');

        // Get related resources
        $relatedResources = Resource::published()
            ->where('id', '!=', $resource->id)
            ->where('category_id', $resource->category_id)
            ->orderBy('view_count', 'desc')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at', 'view_count']);

        return Inertia::render('Resources/Show', [
            'resource' => $resource,
            'relatedResources' => $relatedResources,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Resource $resource): Response
    {
        $resource->load(['author:id,name,email', 'category:id,name']);
        $authors = User::select('id', 'name', 'email')->orderBy('name')->get();
        $categories = Resource::getCategories();
        $resourceCategories = \App\Models\ResourceCategory::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'parent_id']);
        $popularTags = Resource::getPopularTags(50);

        return Inertia::render('Resources/Edit', [
            'resource' => $resource,
            'authors' => $authors,
            'categories' => $categories,
            'resourceCategories' => $resourceCategories,
            'popularTags' => $popularTags,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ResourceRequest $request, Resource $resource)
    {
        $validatedData = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old featured image
            if ($resource->featured_image) {
                Storage::disk('public')->delete($resource->featured_image);
            }
            $validatedData['featured_image'] = $request->file('featured_image')
                ->store('resources/featured', 'public');
        }

        // Handle gallery images upload
        if ($request->hasFile('gallery_images')) {
            // Delete old gallery images
            if ($resource->gallery_images) {
                foreach ($resource->gallery_images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            $galleryPaths = [];
            foreach ($request->file('gallery_images') as $image) {
                $galleryPaths[] = $image->store('resources/gallery', 'public');
            }
            $validatedData['gallery_images'] = $galleryPaths;
        }

        // Calculate read time if content changed
        if ($request->has('content') && $request->content !== $resource->content) {
            $wordCount = str_word_count(strip_tags($validatedData['content']));
            $validatedData['read_time'] = max(1, ceil($wordCount / 200));
        }

        $resource->update($validatedData);

        // Regenerate SEO score
        $resource->generateSeoScore();

        return redirect()->route('resources.index')
            ->with('success', 'Resource updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Resource $resource)
    {
        // Delete associated images
        if ($resource->featured_image) {
            Storage::disk('public')->delete($resource->featured_image);
        }

        if ($resource->gallery_images) {
            foreach ($resource->gallery_images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $resource->delete();

        return redirect()->route('resources.index')
            ->with('success', 'Resource deleted successfully.');
    }

    /**
     * Bulk actions for resources.
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:publish,unpublish,feature,unfeature,trend,untrend,delete',
            'resource_ids' => 'required|array',
            'resource_ids.*' => 'exists:resources,id'
        ]);

        $resources = Resource::whereIn('id', $request->resource_ids);

        switch ($request->action) {
            case 'publish':
                $resources->update([
                    'is_published' => true,
                    'status' => 'published',
                    'published_at' => now()
                ]);
                $message = 'Resources published successfully.';
                break;

            case 'unpublish':
                $resources->update([
                    'is_published' => false,
                    'status' => 'draft'
                ]);
                $message = 'Resources unpublished successfully.';
                break;

            case 'feature':
                $resources->update(['is_featured' => true]);
                $message = 'Resources marked as featured.';
                break;

            case 'unfeature':
                $resources->update(['is_featured' => false]);
                $message = 'Resources removed from featured.';
                break;

            case 'trend':
                $resources->update(['is_trending' => true]);
                $message = 'Resources marked as trending.';
                break;

            case 'untrend':
                $resources->update(['is_trending' => false]);
                $message = 'Resources removed from trending.';
                break;

            case 'delete':
                // Delete associated images for each resource
                foreach ($resources->get() as $resource) {
                    if ($resource->featured_image) {
                        Storage::disk('public')->delete($resource->featured_image);
                    }
                    if ($resource->gallery_images) {
                        foreach ($resource->gallery_images as $image) {
                            Storage::disk('public')->delete($image);
                        }
                    }
                }
                $resources->delete();
                $message = 'Resources deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Generate SEO score for a resource.
     */
    public function generateSeoScore(Resource $resource)
    {
        $score = $resource->generateSeoScore();

        return response()->json([
            'success' => true,
            'seo_score' => $score,
            'message' => 'SEO score updated successfully.'
        ]);
    }

    /**
     * Get analytics data for resources.
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days

        $analytics = [
            'views_trend' => Resource::selectRaw('DATE(created_at) as date, SUM(view_count) as views')
                ->where('created_at', '>=', now()->subDays($period))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'top_resources' => Resource::select('title', 'slug', 'view_count', 'share_count')
                ->published()
                ->orderBy('view_count', 'desc')
                ->limit(10)
                ->get(),

            'category_performance' => Resource::selectRaw('category, COUNT(*) as count, SUM(view_count) as total_views')
                ->published()
                ->groupBy('category')
                ->orderBy('total_views', 'desc')
                ->get(),

            'author_performance' => Resource::selectRaw('author_id, COUNT(*) as resource_count, SUM(view_count) as total_views')
                ->with('author:id,name')
                ->published()
                ->groupBy('author_id')
                ->orderBy('total_views', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($analytics);
    }
}
