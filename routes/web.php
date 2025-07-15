<?php

use App\Http\Controllers\ContactInquiryController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\FaqCategoryController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\ResourceCategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Contact Inquiries Management
    Route::resource('contact-inquiries', ContactInquiryController::class)
        ->only(['index', 'show', 'update', 'destroy'])
        ->names([
            'index' => 'contact-inquiries.index',
            'show' => 'contact-inquiries.show',
            'update' => 'contact-inquiries.update',
            'destroy' => 'contact-inquiries.destroy',
        ]);

    // FAQ Categories Management
    Route::resource('faq-categories', FaqCategoryController::class);
    Route::patch('faq-categories/{faqCategory}/toggle-status', [FaqCategoryController::class, 'toggleStatus'])->name('faq-categories.toggle-status');
    Route::post('faq-categories/bulk-action', [FaqCategoryController::class, 'bulkAction'])->name('faq-categories.bulk-action');
    Route::post('faq-categories/reorder', [FaqCategoryController::class, 'reorder'])->name('faq-categories.reorder');

    // FAQ Management
    Route::resource('faqs', FaqController::class);
    Route::patch('faqs/{faq}/toggle-status', [FaqController::class, 'toggleStatus'])->name('faqs.toggle-status');
    Route::patch('faqs/{faq}/toggle-featured', [FaqController::class, 'toggleFeatured'])->name('faqs.toggle-featured');
    Route::post('faqs/bulk-action', [FaqController::class, 'bulkAction'])->name('faqs.bulk-action');

    // Resources Management
    Route::resource('resources', ResourceController::class);
    Route::post('resources/bulk-action', [ResourceController::class, 'bulkAction'])->name('resources.bulk-action');
    Route::post('resources/{resource}/seo-score', [ResourceController::class, 'generateSeoScore'])->name('resources.seo-score');
    Route::get('resources-analytics', [ResourceController::class, 'analytics'])->name('resources.analytics');

    // Resource Categories Management
    Route::resource('resource-categories', ResourceCategoryController::class);
    Route::post('resource-categories/bulk-action', [ResourceCategoryController::class, 'bulkAction'])->name('resource-categories.bulk-action');
    Route::post('resource-categories/reorder', [ResourceCategoryController::class, 'reorder'])->name('resource-categories.reorder');
    Route::get('resource-categories-hierarchy', [ResourceCategoryController::class, 'hierarchy'])->name('resource-categories.hierarchy');
    Route::get('resource-categories-flat', [ResourceCategoryController::class, 'flatList'])->name('resource-categories.flat');
    Route::get('resource-categories-analytics', [ResourceCategoryController::class, 'analytics'])->name('resource-categories.analytics');
    Route::get('resource-categories-export', [ResourceCategoryController::class, 'export'])->name('resource-categories.export');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
