<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FaqRequest;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class FaqController extends Controller
{
    /**
     * Display a listing of FAQs (Public endpoint).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $cacheKey = 'faqs_list_' . md5($request->getQueryString() ?? '');

            $faqs = Cache::remember($cacheKey, 600, function () use ($request) {
                $query = Faq::active()->ordered();

                // Filter by category
                if ($request->filled('category') && $request->category !== 'all') {
                    $query->byCategory($request->category);
                }

                // Filter by featured
                if ($request->boolean('featured')) {
                    $query->featured();
                }

                // Search in question and answer
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->where(function ($q) use ($search) {
                        $q->where('question', 'like', "%{$search}%")
                          ->orWhere('answer', 'like', "%{$search}%")
                          ->orWhereJsonContains('tags', $search);
                    });
                }

                // Limit results for API
                $limit = min($request->get('limit', 50), 100);

                return $query->select([
                    'id', 'question', 'answer', 'category', 'is_featured',
                    'tags', 'view_count', 'helpful_count', 'not_helpful_count',
                    'slug', 'created_at'
                ])->limit($limit)->get();
            });

            // Group by category for better organization
            $groupedFaqs = $faqs->groupBy('category');

            // Get categories with counts
            $categories = Faq::active()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => [
                    'faqs' => $faqs,
                    'grouped_faqs' => $groupedFaqs,
                    'categories' => $categories,
                    'total_count' => $faqs->count()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch FAQs', [
                'error' => $e->getMessage(),
                'request_params' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch FAQs'
            ], 500);
        }
    }

    /**
     * Show specific FAQ by slug (Public endpoint).
     */
    public function show(string $slug): JsonResponse
    {
        try {
            $faq = Cache::remember("faq_{$slug}", 600, function () use ($slug) {
                return Faq::active()
                    ->where('slug', $slug)
                    ->select([
                        'id', 'question', 'answer', 'category', 'is_featured',
                        'tags', 'view_count', 'helpful_count', 'not_helpful_count',
                        'slug', 'meta_description', 'created_at'
                    ])
                    ->first();
            });

            if (!$faq) {
                return response()->json([
                    'success' => false,
                    'message' => 'FAQ not found'
                ], 404);
            }

            // Increment view count
            $faq->incrementViewCount();

            return response()->json([
                'success' => true,
                'data' => $faq
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch FAQ', [
                'error' => $e->getMessage(),
                'slug' => $slug
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch FAQ'
            ], 500);
        }
    }

    /**
     * Mark FAQ as helpful (Public endpoint).
     */
    public function markHelpful(Request $request, string $slug): JsonResponse
    {
        try {
            $faq = Faq::active()->where('slug', $slug)->first();

            if (!$faq) {
                return response()->json([
                    'success' => false,
                    'message' => 'FAQ not found'
                ], 404);
            }

            $isHelpful = $request->boolean('helpful');

            if ($isHelpful) {
                $faq->markAsHelpful();
            } else {
                $faq->markAsNotHelpful();
            }

            // Clear cache
            Cache::forget("faq_{$slug}");
            Cache::forget('faqs_list_');

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!',
                'data' => [
                    'helpful_count' => $faq->fresh()->helpful_count,
                    'not_helpful_count' => $faq->fresh()->not_helpful_count,
                    'helpfulness_ratio' => $faq->fresh()->helpfulness_ratio
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark FAQ as helpful', [
                'error' => $e->getMessage(),
                'slug' => $slug,
                'helpful' => $request->get('helpful')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to record feedback'
            ], 500);
        }
    }

    /**
     * Get FAQ statistics (Admin endpoint).
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = Cache::remember('faq_stats', 300, function () {
                return [
                    'total' => Faq::count(),
                    'active' => Faq::where('status', 'active')->count(),
                    'inactive' => Faq::where('status', 'inactive')->count(),
                    'featured' => Faq::where('is_featured', true)->count(),
                    'total_views' => Faq::sum('view_count'),
                    'total_helpful' => Faq::sum('helpful_count'),
                    'total_not_helpful' => Faq::sum('not_helpful_count'),
                    'categories' => Faq::selectRaw('category, COUNT(*) as count')
                        ->groupBy('category')
                        ->pluck('count', 'category')
                        ->toArray(),
                    'most_viewed' => Faq::orderBy('view_count', 'desc')
                        ->limit(5)
                        ->select('id', 'question', 'view_count')
                        ->get(),
                    'most_helpful' => Faq::orderBy('helpful_count', 'desc')
                        ->limit(5)
                        ->select('id', 'question', 'helpful_count')
                        ->get()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch FAQ stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Store a newly created FAQ (Admin endpoint).
     */
    public function store(FaqRequest $request): JsonResponse
    {
        try {
            $faq = Faq::create($request->getValidatedDataWithMetadata());

            // Clear relevant caches
            $this->clearFaqCaches();

            Log::info('FAQ created', [
                'id' => $faq->id,
                'question' => $faq->question,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'FAQ created successfully',
                'data' => $faq->load('creator')
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create FAQ', [
                'error' => $e->getMessage(),
                'request_data' => $request->except(['_token']),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create FAQ'
            ], 500);
        }
    }

    /**
     * Update the specified FAQ (Admin endpoint).
     */
    public function update(FaqRequest $request, Faq $faq): JsonResponse
    {
        try {
            $faq->update($request->getValidatedDataWithMetadata());

            // Clear relevant caches
            $this->clearFaqCaches();
            Cache::forget("faq_{$faq->slug}");

            Log::info('FAQ updated', [
                'id' => $faq->id,
                'question' => $faq->question,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'FAQ updated successfully',
                'data' => $faq->fresh()->load('creator', 'updater')
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update FAQ', [
                'error' => $e->getMessage(),
                'faq_id' => $faq->id,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update FAQ'
            ], 500);
        }
    }

    /**
     * Remove the specified FAQ (Admin endpoint).
     */
    public function destroy(Faq $faq): JsonResponse
    {
        try {
            $faq->delete();

            // Clear relevant caches
            $this->clearFaqCaches();
            Cache::forget("faq_{$faq->slug}");

            Log::info('FAQ deleted', [
                'id' => $faq->id,
                'question' => $faq->question,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'FAQ deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete FAQ', [
                'error' => $e->getMessage(),
                'faq_id' => $faq->id,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete FAQ'
            ], 500);
        }
    }

    /**
     * Clear FAQ-related caches.
     */
    private function clearFaqCaches(): void
    {
        Cache::forget('faq_stats');

        // Clear all FAQ list caches (they have dynamic keys)
        $cacheKeys = Cache::getRedis()->keys('*faqs_list_*');
        if (!empty($cacheKeys)) {
            Cache::getRedis()->del($cacheKeys);
        }
    }
}
