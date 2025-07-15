<?php

namespace App\Http\Controllers;

use App\Models\ResourceCategory;
use App\Http\Requests\ResourceCategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ResourceCategoryController extends Controller
{
    /**
     * Display a listing of the resource categories.
     */
    public function index(Request $request): Response
    {
        $query = ResourceCategory::with(['parent:id,name', 'children'])
            ->withCount(['resources', 'activeResources']);

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->filled('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        if ($request->filled('parent') && $request->parent !== 'all') {
            if ($request->parent === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $request->parent);
            }
        }

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');

        if ($sortBy === 'sort_order') {
            $query->orderBy('sort_order')->orderBy('name');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $categories = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => ResourceCategory::count(),
            'active' => ResourceCategory::where('is_active', true)->count(),
            'inactive' => ResourceCategory::where('is_active', false)->count(),
            'featured' => ResourceCategory::where('is_featured', true)->count(),
            'with_resources' => ResourceCategory::where('resource_count', '>', 0)->count(),
            'root_categories' => ResourceCategory::whereNull('parent_id')->count(),
            'total_resources' => ResourceCategory::sum('resource_count'),
        ];

        // Get filter options
        $filters = [
            'statuses' => [
                ['value' => 'all', 'label' => 'All Statuses'],
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
            'parents' => collect([
                ['value' => 'all', 'label' => 'All Categories'],
                ['value' => 'root', 'label' => 'Root Categories Only']
            ])->concat(
                ResourceCategory::select('id', 'name')
                    ->whereNull('parent_id')
                    ->orderBy('name')
                    ->get()
                    ->map(fn($cat) => ['value' => $cat->id, 'label' => $cat->name])
            ),
        ];

        return Inertia::render('ResourceCategories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $filters,
            'queryParams' => $request->only(['status', 'featured', 'parent', 'search', 'sort_by', 'sort_order'])
        ]);
    }

    /**
     * Show the form for creating a new resource category.
     */
    public function create(): Response
    {
        $parentCategories = ResourceCategory::active()
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ResourceCategories/Create', [
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Store a newly created resource category in storage.
     */
    public function store(ResourceCategoryRequest $request)
    {
        $validatedData = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $validatedData['featured_image'] = $request->file('featured_image')
                ->store('categories/featured', 'public');
        }

        // Generate slug if not provided
        if (empty($validatedData['slug'])) {
            $validatedData['slug'] = Str::slug($validatedData['name']);
        }

        $category = ResourceCategory::create($validatedData);

        return redirect()->route('resource-categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource category.
     */
    public function show(ResourceCategory $resourceCategory): Response
    {
        $resourceCategory->load([
            'parent',
            'children.activeResources',
            'activeResources' => function ($query) {
                $query->with('author:id,name,email')
                      ->orderBy('published_at', 'desc')
                      ->limit(10);
            }
        ]);

        // Get category statistics
        $stats = [
            'total_resources' => $resourceCategory->resource_count,
            'published_resources' => $resourceCategory->activeResources()->count(),
            'draft_resources' => $resourceCategory->resources()->where('status', 'draft')->count(),
            'total_views' => $resourceCategory->activeResources()->sum('view_count'),
            'avg_seo_score' => round($resourceCategory->activeResources()->avg('seo_score'), 1),
            'children_count' => $resourceCategory->children()->count(),
        ];

        return Inertia::render('ResourceCategories/Show', [
            'category' => $resourceCategory,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified resource category.
     */
    public function edit(ResourceCategory $resourceCategory): Response
    {
        $resourceCategory->load('parent');

        $parentCategories = ResourceCategory::active()
            ->where('id', '!=', $resourceCategory->id)
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ResourceCategories/Edit', [
            'category' => $resourceCategory,
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Update the specified resource category in storage.
     */
    public function update(ResourceCategoryRequest $request, ResourceCategory $resourceCategory)
    {
        $validatedData = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old featured image
            if ($resourceCategory->featured_image) {
                Storage::disk('public')->delete($resourceCategory->featured_image);
            }
            $validatedData['featured_image'] = $request->file('featured_image')
                ->store('categories/featured', 'public');
        }

        // Prevent circular reference
        if (isset($validatedData['parent_id']) && $validatedData['parent_id']) {
            $proposedParent = ResourceCategory::find($validatedData['parent_id']);
            if ($proposedParent && $proposedParent->isDescendantOf($resourceCategory)) {
                return redirect()->back()
                    ->withErrors(['parent_id' => 'Cannot set a descendant category as parent.']);
            }
        }

        $resourceCategory->update($validatedData);

        return redirect()->route('resource-categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource category from storage.
     */
    public function destroy(ResourceCategory $resourceCategory)
    {
        if (!$resourceCategory->canDelete()) {
            return redirect()->back()
                ->withErrors(['category' => 'Cannot delete category with resources or subcategories.']);
        }

        // Delete featured image
        if ($resourceCategory->featured_image) {
            Storage::disk('public')->delete($resourceCategory->featured_image);
        }

        $resourceCategory->delete();

        return redirect()->route('resource-categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Get category hierarchy for select dropdowns.
     */
    public function hierarchy()
    {
        $hierarchy = ResourceCategory::getHierarchy();

        return response()->json($hierarchy);
    }

    /**
     * Get flat list of categories for select dropdowns.
     */
    public function flatList()
    {
        $categories = ResourceCategory::getFlatList();

        return response()->json($categories);
    }

    /**
     * Bulk actions for categories.
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,feature,unfeature,delete',
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:resource_categories,id'
        ]);

        $categories = ResourceCategory::whereIn('id', $request->category_ids);

        switch ($request->action) {
            case 'activate':
                $categories->update(['is_active' => true]);
                $message = 'Categories activated successfully.';
                break;

            case 'deactivate':
                $categories->update(['is_active' => false]);
                $message = 'Categories deactivated successfully.';
                break;

            case 'feature':
                $categories->update(['is_featured' => true]);
                $message = 'Categories marked as featured.';
                break;

            case 'unfeature':
                $categories->update(['is_featured' => false]);
                $message = 'Categories removed from featured.';
                break;

            case 'delete':
                // Check if any category can't be deleted
                $categoriesData = $categories->get();
                foreach ($categoriesData as $category) {
                    if (!$category->canDelete()) {
                        return redirect()->back()
                            ->withErrors(['categories' => 'Some categories cannot be deleted because they have resources or subcategories.']);
                    }
                }

                // Delete featured images
                foreach ($categoriesData as $category) {
                    if ($category->featured_image) {
                        Storage::disk('public')->delete($category->featured_image);
                    }
                }

                $categories->delete();
                $message = 'Categories deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Reorder categories.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:resource_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($request->categories as $categoryData) {
            ResourceCategory::where('id', $categoryData['id'])
                ->update(['sort_order' => $categoryData['sort_order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Categories reordered successfully.'
        ]);
    }

    /**
     * Get analytics data for categories.
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days

        $analytics = [
            'top_categories' => ResourceCategory::select('name', 'slug', 'resource_count')
                ->where('resource_count', '>', 0)
                ->orderBy('resource_count', 'desc')
                ->limit(10)
                ->get(),

            'category_growth' => ResourceCategory::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays($period))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),

            'featured_performance' => ResourceCategory::select('name', 'resource_count')
                ->where('is_featured', true)
                ->orderBy('resource_count', 'desc')
                ->get(),

            'hierarchy_distribution' => ResourceCategory::selectRaw('
                    CASE
                        WHEN parent_id IS NULL THEN "Root Categories"
                        ELSE "Subcategories"
                    END as type,
                    COUNT(*) as count
                ')
                ->groupBy('type')
                ->get(),
        ];

        return response()->json($analytics);
    }

    /**
     * Export categories data.
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'csv'); // csv, json, xlsx

        $categories = ResourceCategory::with(['parent', 'children'])
            ->withCount('resources')
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'parent' => $category->parent?->name,
                    'children_count' => $category->children->count(),
                    'resource_count' => $category->resources_count,
                    'is_active' => $category->is_active ? 'Yes' : 'No',
                    'is_featured' => $category->is_featured ? 'Yes' : 'No',
                    'created_at' => $category->created_at->format('Y-m-d H:i:s'),
                ];
            });

        if ($format === 'json') {
            return response()->json($categories);
        }

        // For CSV and other formats, you might want to use a package like Laravel Excel
        // For now, returning JSON
        return response()->json($categories);
    }
}
