<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    /**
     * Display the contact inquiries dashboard.
     */
    public function index(Request $request): Response
    {
        $query = ContactInquiry::with('assignedTo:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
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

        $inquiries = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => ContactInquiry::count(),
            'new' => ContactInquiry::where('status', 'new')->count(),
            'in_progress' => ContactInquiry::where('status', 'in_progress')->count(),
            'resolved' => ContactInquiry::where('status', 'resolved')->count(),
            'today' => ContactInquiry::whereDate('created_at', today())->count(),
        ];

        // Get filter options
        $filters = [
            'statuses' => [
                ['value' => 'all', 'label' => 'All Statuses'],
                ['value' => 'new', 'label' => 'New'],
                ['value' => 'in_progress', 'label' => 'In Progress'],
                ['value' => 'resolved', 'label' => 'Resolved'],
                ['value' => 'closed', 'label' => 'Closed'],
            ],
            'priorities' => [
                ['value' => 'all', 'label' => 'All Priorities'],
                ['value' => 'low', 'label' => 'Low'],
                ['value' => 'medium', 'label' => 'Medium'],
                ['value' => 'high', 'label' => 'High'],
                ['value' => 'urgent', 'label' => 'Urgent'],
            ]
        ];

        return Inertia::render('ContactInquiries/Index', [
            'inquiries' => $inquiries,
            'stats' => $stats,
            'filters' => $filters,
            'queryParams' => $request->only(['status', 'priority', 'search'])
        ]);
    }

    /**
     * Show the details of a specific contact inquiry.
     */
    public function show(ContactInquiry $contactInquiry): Response
    {
        $contactInquiry->load('assignedTo:id,name,email');

        // Get available users for assignment
        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('ContactInquiries/Show', [
            'inquiry' => $contactInquiry,
            'users' => $users
        ]);
    }

    /**
     * Update the status or assignment of a contact inquiry.
     */
    public function update(Request $request, ContactInquiry $contactInquiry)
    {
        $request->validate([
            'status' => 'sometimes|in:new,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'notes' => 'sometimes|nullable|string|max:5000',
        ]);

        $updateData = $request->only(['status', 'priority', 'assigned_to', 'notes']);

        // Set responded_at timestamp if status is being changed to in_progress for the first time
        if ($request->filled('status') &&
            $request->status === 'in_progress' &&
            $contactInquiry->status === 'new' &&
            !$contactInquiry->responded_at) {
            $updateData['responded_at'] = now();
        }

        $contactInquiry->update($updateData);

        return redirect()->back()->with('success', 'Contact inquiry updated successfully.');
    }

    /**
     * Delete a contact inquiry.
     */
    public function destroy(ContactInquiry $contactInquiry)
    {
        $contactInquiry->delete();

        return redirect()->route('contact-inquiries.index')
            ->with('success', 'Contact inquiry deleted successfully.');
    }
}
