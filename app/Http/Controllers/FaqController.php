<?php

namespace App\Http\Controllers;

use App\Http\Requests\FaqRequest;
use App\Models\Faq;
use App\Models\FaqCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class FaqController extends Controller
{
    /**
     * Display a listing of FAQs.
     */
    public function index(Request $request): Response
    {
        $query = Faq::with(['creator', 'updater', 'category']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('answer', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($categoryQuery) use ($search) {
                      $categoryQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('featured') && $request->featured !== 'all') {
            $query->where('is_featured', $request->featured === 'yes');
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['question', 'status', 'view_count', 'helpful_count', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        } elseif ($sortBy === 'category') {
            $query->join('faq_categories', 'faqs.category_id', '=', 'faq_categories.id')
                  ->orderBy('faq_categories.name', $sortOrder)
                  ->select('faqs.*');
        }

        $faqs = $query->paginate(10)->withQueryString();

        // Get filter options
        $categories = FaqCategory::active()->ordered()->get(['id', 'name', 'color']);
        $statuses = ['active', 'inactive'];

        // Get statistics
        $stats = [
            'total' => Faq::count(),
            'active' => Faq::where('status', 'active')->count(),
            'inactive' => Faq::where('status', 'inactive')->count(),
            'featured' => Faq::where('is_featured', true)->count(),
            'total_views' => Faq::sum('view_count'),
            'total_helpful' => Faq::sum('helpful_count'),
        ];

        return Inertia::render('Faqs/Index', [
            'faqs' => $faqs,
            'filters' => $request->only(['search', 'category', 'status', 'featured', 'sort_by', 'sort_order']),
            'categories' => $categories,
            'statuses' => $statuses,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new FAQ.
     */
    public function create(): Response
    {
        // Get FAQ categories
        $categories = FaqCategory::active()->ordered()->get(['id', 'name', 'color']);

        return Inertia::render('Faqs/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created FAQ.
     */
    public function store(FaqRequest $request): RedirectResponse
    {
        try {
            $faq = Faq::create($request->getValidatedDataWithMetadata());

            return redirect()->route('faqs.index')
                ->with('message', [
                    'type' => 'success',
                    'text' => 'FAQ created successfully!'
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to create FAQ. Please try again.'
                ]);
        }
    }

    /**
     * Display the specified FAQ.
     */
    public function show(Faq $faq): Response
    {
        $faq->load(['creator', 'updater']);

        return Inertia::render('Faqs/Show', [
            'faq' => $faq,
        ]);
    }

    /**
     * Show the form for editing the specified FAQ.
     */
    public function edit(Faq $faq): Response
    {
        // Get FAQ categories
        $categories = FaqCategory::active()->ordered()->get(['id', 'name', 'color']);

        return Inertia::render('Faqs/Edit', [
            'faq' => $faq,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified FAQ.
     */
    public function update(FaqRequest $request, Faq $faq): RedirectResponse
    {
        try {
            $faq->update($request->getValidatedDataWithMetadata());

            return redirect()->route('faqs.index')
                ->with('message', [
                    'type' => 'success',
                    'text' => 'FAQ updated successfully!'
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to update FAQ. Please try again.'
                ]);
        }
    }

    /**
     * Remove the specified FAQ.
     */
    public function destroy(Faq $faq): RedirectResponse
    {
        try {
            $faq->delete();

            return redirect()->route('faqs.index')
                ->with('message', [
                    'type' => 'success',
                    'text' => 'FAQ deleted successfully!'
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to delete FAQ. Please try again.'
                ]);
        }
    }

    /**
     * Toggle FAQ status (active/inactive).
     */
    public function toggleStatus(Faq $faq): RedirectResponse
    {
        try {
            $faq->update([
                'status' => $faq->status === 'active' ? 'inactive' : 'active',
                'updated_by' => Auth::id(),
            ]);

            return redirect()->back()
                ->with('message', [
                    'type' => 'success',
                    'text' => 'FAQ status updated successfully!'
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to update FAQ status. Please try again.'
                ]);
        }
    }

    /**
     * Toggle FAQ featured status.
     */
    public function toggleFeatured(Faq $faq): RedirectResponse
    {
        try {
            $faq->update([
                'is_featured' => !$faq->is_featured,
                'updated_by' => Auth::id(),
            ]);

            return redirect()->back()
                ->with('message', [
                    'type' => 'success',
                    'text' => 'FAQ featured status updated successfully!'
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to update featured status. Please try again.'
                ]);
        }
    }

    /**
     * Bulk actions for FAQs.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'action' => 'required|in:delete,activate,deactivate,feature,unfeature',
            'ids' => 'required|array|min:1',
            'ids.*' => 'exists:faqs,id',
        ]);

        try {
            $faqs = Faq::whereIn('id', $request->ids);
            $count = $faqs->count();

            switch ($request->action) {
                case 'delete':
                    $faqs->delete();
                    $message = "Deleted {$count} FAQ(s) successfully!";
                    break;

                case 'activate':
                    $faqs->update(['status' => 'active', 'updated_by' => Auth::id()]);
                    $message = "Activated {$count} FAQ(s) successfully!";
                    break;

                case 'deactivate':
                    $faqs->update(['status' => 'inactive', 'updated_by' => Auth::id()]);
                    $message = "Deactivated {$count} FAQ(s) successfully!";
                    break;

                case 'feature':
                    $faqs->update(['is_featured' => true, 'updated_by' => Auth::id()]);
                    $message = "Featured {$count} FAQ(s) successfully!";
                    break;

                case 'unfeature':
                    $faqs->update(['is_featured' => false, 'updated_by' => Auth::id()]);
                    $message = "Unfeatured {$count} FAQ(s) successfully!";
                    break;
            }

            return redirect()->back()
                ->with('message', [
                    'type' => 'success',
                    'text' => $message
                ]);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('message', [
                    'type' => 'error',
                    'text' => 'Failed to perform bulk action. Please try again.'
                ]);
        }
    }
}
