<?php

use App\Http\Controllers\Api\ContactInquiryController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\ResourceApiController;
use App\Http\Controllers\Api\ResourceCategoryApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public API routes
Route::prefix('v1')->group(function () {
    // Contact form submission (public)
    Route::post('contact', [ContactInquiryController::class, 'store'])
        ->middleware(['throttle:5,1']); // 5 requests per minute

    // FAQ public endpoints
    Route::get('faqs', [FaqController::class, 'index'])
        ->middleware(['throttle:60,1']); // 60 requests per minute
    Route::get('faqs/{slug}', [FaqController::class, 'show'])
        ->middleware(['throttle:60,1']);
    Route::post('faqs/{slug}/helpful', [FaqController::class, 'markHelpful'])
        ->middleware(['throttle:10,1']); // 10 helpfulness votes per minute

    // // Resource Categories public endpoints
    // Route::get('resource-categories', [ResourceCategoryApiController::class, 'index'])
    //     ->middleware(['throttle:100,1']); // 100 requests per minute
    // Route::get('resource-categories/hierarchy', [ResourceCategoryApiController::class, 'hierarchy'])
    //     ->middleware(['throttle:60,1']);
    // Route::get('resource-categories/flat-list', [ResourceCategoryApiController::class, 'flatList'])
    //     ->middleware(['throttle:60,1']);
    // Route::get('resource-categories/popular', [ResourceCategoryApiController::class, 'popular'])
    //     ->middleware(['throttle:60,1']);
    // Route::get('resource-categories/featured', [ResourceCategoryApiController::class, 'featured'])
    //     ->middleware(['throttle:60,1']);
    // Route::get('resource-categories/stats', [ResourceCategoryApiController::class, 'stats'])
    //     ->middleware(['throttle:30,1']);
    // Route::get('resource-categories/search', [ResourceCategoryApiController::class, 'search'])
    //     ->middleware(['throttle:30,1']);
    // Route::get('resource-categories/analytics', [ResourceCategoryApiController::class, 'analytics'])
    //     ->middleware(['throttle:30,1']);
    // Route::get('resource-categories/{slug}', [ResourceCategoryApiController::class, 'show'])
    //     ->middleware(['throttle:100,1']);
    // Route::get('resource-categories/{slug}/breadcrumb', [ResourceCategoryApiController::class, 'breadcrumb'])
    //     ->middleware(['throttle:60,1']);
    // Route::get('resource-categories/{slug}/related', [ResourceCategoryApiController::class, 'related'])
    //     ->middleware(['throttle:60,1']);

    // Resources public endpoints
    Route::get('resources', [ResourceApiController::class, 'index'])
        ->middleware(['throttle:100,1']); // 100 requests per minute
    Route::get('resources/featured', [ResourceApiController::class, 'featured'])
        ->middleware(['throttle:60,1']);
    Route::get('resources/trending', [ResourceApiController::class, 'trending'])
        ->middleware(['throttle:60,1']);
    Route::get('resources/categories', [ResourceApiController::class, 'categories'])
        ->middleware(['throttle:30,1']);
    Route::get('resources/tags', [ResourceApiController::class, 'tags'])
        ->middleware(['throttle:30,1']);
    Route::get('resources/search', [ResourceApiController::class, 'search'])
        ->middleware(['throttle:30,1']);
    Route::get('resources/category/{category}', [ResourceApiController::class, 'byCategory'])
        ->middleware(['throttle:60,1']);
    Route::get('resources/{slug}', [ResourceApiController::class, 'show'])
        ->middleware(['throttle:100,1']);
    Route::post('resources/{slug}/share', [ResourceApiController::class, 'share'])
        ->middleware(['throttle:20,1']); // 20 share actions per minute

    // Resource Categories public endpoints
    Route::get('resource-categories', [ResourceCategoryApiController::class, 'index'])
        ->middleware(['throttle:100,1']);
    Route::get('resource-categories/hierarchy', [ResourceCategoryApiController::class, 'hierarchy'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/flat', [ResourceCategoryApiController::class, 'flatList'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/popular', [ResourceCategoryApiController::class, 'popular'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/featured', [ResourceCategoryApiController::class, 'featured'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/stats', [ResourceCategoryApiController::class, 'stats'])
        ->middleware(['throttle:30,1']);
    Route::get('resource-categories/search', [ResourceCategoryApiController::class, 'search'])
        ->middleware(['throttle:30,1']);
    Route::get('resource-categories/{slug}', [ResourceCategoryApiController::class, 'show'])
        ->middleware(['throttle:100,1']);
    Route::get('resource-categories/{slug}/breadcrumb', [ResourceCategoryApiController::class, 'breadcrumb'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/{slug}/related', [ResourceCategoryApiController::class, 'related'])
        ->middleware(['throttle:60,1']);
    Route::get('resource-categories/analytics/public', [ResourceCategoryApiController::class, 'analytics'])
        ->middleware(['throttle:30,1']);

    // Admin routes (requires authentication)
    Route::middleware(['auth:sanctum'])->group(function () {
        // Contact inquiries management
        Route::get('contact-inquiries', [ContactInquiryController::class, 'index']);
        Route::get('contact-inquiries/stats', [ContactInquiryController::class, 'stats']);

        // FAQ management
        Route::get('faqs/stats', [FaqController::class, 'stats']);
        Route::apiResource('faqs', FaqController::class)->except(['index', 'show']);

        // Resource Categories management
        Route::apiResource('resource-categories', ResourceCategoryApiController::class)->except(['index', 'show']);

        // Resources management
        Route::get('resources/analytics', [ResourceApiController::class, 'analytics']);
        Route::apiResource('resources', ResourceApiController::class)->except(['index', 'show']);

        // Resource Categories management
        Route::get('resource-categories/analytics', [ResourceCategoryApiController::class, 'analytics']);
        Route::apiResource('resource-categories', ResourceCategoryApiController::class);
    });
});
