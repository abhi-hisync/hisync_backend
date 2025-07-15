<?php

namespace Database\Seeders;

use App\Models\FaqCategory;
use Illuminate\Database\Seeder;

class FaqCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'General',
                'description' => 'General questions and basic information',
                'icon' => 'HelpCircle',
                'color' => '#3B82F6',
                'status' => 'active',
                'sort_order' => 1,
                'meta_title' => 'General FAQ',
                'meta_description' => 'General frequently asked questions and basic information',
            ],
            [
                'name' => 'Products',
                'description' => 'Questions about our products and services',
                'icon' => 'Package',
                'color' => '#8B5CF6',
                'status' => 'active',
                'sort_order' => 2,
                'meta_title' => 'Product FAQ',
                'meta_description' => 'Frequently asked questions about our products and services',
            ],
            [
                'name' => 'Services',
                'description' => 'Service-related questions and support',
                'icon' => 'Settings',
                'color' => '#10B981',
                'status' => 'active',
                'sort_order' => 3,
                'meta_title' => 'Services FAQ',
                'meta_description' => 'Service-related questions and support information',
            ],
            [
                'name' => 'Billing',
                'description' => 'Billing, payment, and subscription questions',
                'icon' => 'CreditCard',
                'color' => '#F59E0B',
                'status' => 'active',
                'sort_order' => 4,
                'meta_title' => 'Billing FAQ',
                'meta_description' => 'Billing, payment, and subscription related questions',
            ],
            [
                'name' => 'Technical Support',
                'description' => 'Technical issues and troubleshooting',
                'icon' => 'Wrench',
                'color' => '#EF4444',
                'status' => 'active',
                'sort_order' => 5,
                'meta_title' => 'Technical Support FAQ',
                'meta_description' => 'Technical support and troubleshooting questions',
            ],
            [
                'name' => 'Account Management',
                'description' => 'Account settings and profile management',
                'icon' => 'User',
                'color' => '#6366F1',
                'status' => 'active',
                'sort_order' => 6,
                'meta_title' => 'Account Management FAQ',
                'meta_description' => 'Account settings and profile management questions',
            ],
        ];

        foreach ($categories as $category) {
            FaqCategory::firstOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
