<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactInquiryRequest;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class ContactInquiryController extends Controller
{
    /**
     * Store a newly created contact inquiry.
     */
    public function store(ContactInquiryRequest $request): JsonResponse
    {
        try {
            // Rate limiting: 5 submissions per minute per IP
            $key = 'contact-form:' . $request->ip();

            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);

                return response()->json([
                    'success' => false,
                    'message' => 'Too many contact form submissions. Please try again later.',
                    'retry_after' => $seconds
                ], 429);
            }

            RateLimiter::hit($key, 60); // 1 minute window

            // Check for duplicate submissions (same email and message in last 10 minutes)
            $duplicateCheck = ContactInquiry::where('email', $request->email)
                ->where('message', $request->message)
                ->where('created_at', '>=', now()->subMinutes(10))
                ->exists();

            if ($duplicateCheck) {
                return response()->json([
                    'success' => false,
                    'message' => 'A similar inquiry was recently submitted. Please wait before submitting again.'
                ], 409);
            }

            // Create the contact inquiry
            $contactInquiry = ContactInquiry::create($request->getValidatedDataWithMetadata());

            // Log the submission for monitoring
            Log::info('Contact form submitted', [
                'id' => $contactInquiry->id,
                'email' => $contactInquiry->email,
                'service' => $contactInquiry->service,
                'ip' => $request->ip()
            ]);

            // TODO: Send email notification to admin
            // TODO: Send auto-reply to user
            // TODO: Integrate with CRM if needed

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your inquiry! We will get back to you within 24 hours.',
                'data' => [
                    'inquiry_id' => $contactInquiry->id,
                    'reference_number' => 'HIS-' . str_pad($contactInquiry->id, 6, '0', STR_PAD_LEFT),
                    'status' => $contactInquiry->status,
                    'submitted_at' => $contactInquiry->created_at->toISOString()
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Contact form submission failed', [
                'error' => $e->getMessage(),
                'request_data' => $request->except(['_token']),
                'ip' => $request->ip()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get contact inquiry statistics (for admin dashboard).
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total' => ContactInquiry::count(),
                'new' => ContactInquiry::where('status', 'new')->count(),
                'in_progress' => ContactInquiry::where('status', 'in_progress')->count(),
                'resolved' => ContactInquiry::where('status', 'resolved')->count(),
                'today' => ContactInquiry::whereDate('created_at', today())->count(),
                'this_week' => ContactInquiry::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'this_month' => ContactInquiry::whereMonth('created_at', now()->month)->count(),
                'avg_response_time' => $this->getAverageResponseTime(),
                'top_services' => $this->getTopServices()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch contact inquiry stats', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
        }
    }

    /**
     * Get paginated list of contact inquiries (for admin).
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ContactInquiry::with('assignedTo:id,name,email')
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('priority')) {
                $query->where('priority', $request->priority);
            }

            if ($request->filled('service')) {
                $query->where('service', $request->service);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }

            $inquiries = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $inquiries
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch contact inquiries', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inquiries'
            ], 500);
        }
    }

    /**
     * Get average response time in hours.
     */
    private function getAverageResponseTime(): float
    {
        $inquiries = ContactInquiry::whereNotNull('responded_at')->get();

        if ($inquiries->isEmpty()) {
            return 0;
        }

        $totalHours = $inquiries->sum(function ($inquiry) {
            return $inquiry->created_at->diffInHours($inquiry->responded_at);
        });

        return round($totalHours / $inquiries->count(), 2);
    }

    /**
     * Get top 5 requested services.
     */
    private function getTopServices(): array
    {
        return ContactInquiry::whereNotNull('service')
            ->selectRaw('service, COUNT(*) as count')
            ->groupBy('service')
            ->orderByDesc('count')
            ->limit(5)
            ->pluck('count', 'service')
            ->toArray();
    }
}
