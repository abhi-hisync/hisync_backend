<?php

namespace App\Http\Controllers;

use App\Models\FaqCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class FaqCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = FaqCategory::with(['creator', 'updater'])
            ->withCount(['faqs', 'activeFaqs']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');

        if (in_array($sortBy, ['name', 'status', 'created_at', 'sort_order'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->ordered();
        }

        $categories = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total' => FaqCategory::count(),
            'active' => FaqCategory::where('status', 'active')->count(),
            'inactive' => FaqCategory::where('status', 'inactive')->count(),
            'total_faqs' => \App\Models\Faq::count(),
        ];

        return Inertia::render('FaqCategories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'statuses' => ['active', 'inactive'],
        ]);
    }

    public function create()
    {
        return Inertia::render('FaqCategories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:faq_categories,name',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['updated_by'] = Auth::id();

        FaqCategory::create($validated);

        return Redirect::route('faq-categories.index')
            ->with('success', 'FAQ Category created successfully.');
    }

    public function show(FaqCategory $faqCategory)
    {
        $faqCategory->load(['creator', 'updater', 'faqs' => function ($query) {
            $query->with(['creator', 'updater'])->latest();
        }]);

        return Inertia::render('FaqCategories/Show', [
            'category' => $faqCategory,
        ]);
    }

    public function edit(FaqCategory $faqCategory)
    {
        return Inertia::render('FaqCategories/Edit', [
            'category' => $faqCategory,
        ]);
    }

    public function update(Request $request, FaqCategory $faqCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:faq_categories,name,' . $faqCategory->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:7',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $validated['updated_by'] = Auth::id();

        $faqCategory->update($validated);

        return Redirect::route('faq-categories.index')
            ->with('success', 'FAQ Category updated successfully.');
    }

    public function destroy(FaqCategory $faqCategory)
    {
        // Check if category has FAQs
        if ($faqCategory->faqs()->count() > 0) {
            return Redirect::back()
                ->with('error', 'Cannot delete category that contains FAQs. Please move or delete the FAQs first.');
        }

        $faqCategory->delete();

        return Redirect::route('faq-categories.index')
            ->with('success', 'FAQ Category deleted successfully.');
    }

    public function toggleStatus(FaqCategory $faqCategory)
    {
        $faqCategory->update([
            'status' => $faqCategory->status === 'active' ? 'inactive' : 'active',
            'updated_by' => Auth::id(),
        ]);

        return Redirect::back()
            ->with('success', 'Category status updated successfully.');
    }

    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'ids' => 'required|array',
            'ids.*' => 'exists:faq_categories,id',
        ]);

        $categories = FaqCategory::whereIn('id', $validated['ids']);

        switch ($validated['action']) {
            case 'activate':
                $categories->update([
                    'status' => 'active',
                    'updated_by' => Auth::id(),
                ]);
                $message = 'Categories activated successfully.';
                break;

            case 'deactivate':
                $categories->update([
                    'status' => 'inactive',
                    'updated_by' => Auth::id(),
                ]);
                $message = 'Categories deactivated successfully.';
                break;

            case 'delete':
                // Check if any category has FAQs
                $categoriesWithFaqs = $categories->withCount('faqs')
                    ->get()
                    ->filter(fn($cat) => $cat->faqs_count > 0);

                if ($categoriesWithFaqs->count() > 0) {
                    return Redirect::back()
                        ->with('error', 'Cannot delete categories that contain FAQs.');
                }

                $categories->delete();
                $message = 'Categories deleted successfully.';
                break;
        }

        return Redirect::back()->with('success', $message);
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:faq_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['categories'] as $categoryData) {
            FaqCategory::where('id', $categoryData['id'])
                ->update([
                    'sort_order' => $categoryData['sort_order'],
                    'updated_by' => Auth::id(),
                ]);
        }

        return Redirect::back()
            ->with('success', 'Categories reordered successfully.');
    }
}
