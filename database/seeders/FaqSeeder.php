<?php

namespace Database\Seeders;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create an admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create specific FAQ entries with real content
        $specificFaqs = [
            [
                'question' => 'How do I create an account?',
                'answer' => 'To create an account, click on the "Sign Up" button in the top right corner of our website. Fill in your email address, create a secure password, and provide your basic information. You\'ll receive a confirmation email to verify your account. Once verified, you can start using all our features immediately.',
                'category' => 'Account Management',
                'is_featured' => true,
                'tags' => json_encode(['account', 'signup', 'registration', 'getting-started']),
                'meta_description' => 'Learn how to create an account and get started with our platform',
                'view_count' => 1250,
                'helpful_count' => 87,
                'not_helpful_count' => 3,
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept all major credit cards including Visa, MasterCard, American Express, and Discover. We also support PayPal, Apple Pay, Google Pay, and bank transfers. For enterprise customers, we offer net payment terms and can accommodate purchase orders. All payments are processed securely through our encrypted payment gateway.',
                'category' => 'Billing',
                'is_featured' => true,
                'tags' => json_encode(['payment', 'billing', 'credit-card', 'paypal']),
                'meta_description' => 'Complete list of accepted payment methods and billing options',
                'view_count' => 890,
                'helpful_count' => 65,
                'not_helpful_count' => 2,
            ],
            [
                'question' => 'How can I track my order?',
                'answer' => 'Once your order is shipped, you\'ll receive an email with a tracking number and a link to track your package. You can also log into your account and go to "My Orders" to see the status of all your orders. We provide real-time updates including when your order is processed, shipped, out for delivery, and delivered.',
                'category' => 'Shipping',
                'is_featured' => true,
                'tags' => json_encode(['tracking', 'shipping', 'order', 'delivery']),
                'meta_description' => 'Learn how to track your order and get delivery updates',
                'view_count' => 756,
                'helpful_count' => 42,
                'not_helpful_count' => 1,
            ],
            [
                'question' => 'What is your return policy?',
                'answer' => 'We offer a 30-day return policy for most items. Products must be in original condition with all packaging and tags. To initiate a return, log into your account, go to "My Orders," and click "Return Item" next to the product you want to return. We\'ll provide a prepaid return label, and once we receive the item, we\'ll process your refund within 5-7 business days.',
                'category' => 'Returns',
                'is_featured' => false,
                'tags' => json_encode(['returns', 'refund', 'policy', 'exchange']),
                'meta_description' => 'Complete guide to our return policy and refund process',
                'view_count' => 623,
                'helpful_count' => 38,
                'not_helpful_count' => 5,
            ],
            [
                'question' => 'How do I reset my password?',
                'answer' => 'If you\'ve forgotten your password, go to the login page and click "Forgot Password." Enter your email address, and we\'ll send you a secure link to reset your password. The link is valid for 24 hours. Follow the instructions in the email to create a new password. Make sure to choose a strong password with at least 8 characters including letters, numbers, and symbols.',
                'category' => 'Account Management',
                'is_featured' => false,
                'tags' => json_encode(['password', 'reset', 'security', 'login']),
                'meta_description' => 'Step-by-step guide to reset your forgotten password',
                'view_count' => 445,
                'helpful_count' => 29,
                'not_helpful_count' => 2,
            ],
            [
                'question' => 'Do you offer international shipping?',
                'answer' => 'Yes, we ship to over 150 countries worldwide. International shipping costs and delivery times vary by destination. During checkout, enter your address to see available shipping options and costs. Please note that international customers are responsible for any customs duties, taxes, or fees imposed by their country. Delivery times typically range from 7-21 business days depending on the destination.',
                'category' => 'Shipping',
                'is_featured' => false,
                'tags' => json_encode(['international', 'shipping', 'worldwide', 'customs']),
                'meta_description' => 'Information about international shipping options and policies',
                'view_count' => 334,
                'helpful_count' => 22,
                'not_helpful_count' => 3,
            ],
            [
                'question' => 'How can I contact customer support?',
                'answer' => 'Our customer support team is available 24/7 to help you. You can reach us through live chat on our website, email us at support@example.com, or call our toll-free number 1-800-123-4567. For non-urgent matters, you can also submit a support ticket through your account dashboard. We typically respond to emails and tickets within 2-4 hours during business days.',
                'category' => 'Technical Support',
                'is_featured' => true,
                'tags' => json_encode(['support', 'contact', 'help', 'customer-service']),
                'meta_description' => 'Multiple ways to contact our customer support team',
                'view_count' => 912,
                'helpful_count' => 71,
                'not_helpful_count' => 1,
            ],
            [
                'question' => 'Is my personal information secure?',
                'answer' => 'Yes, we take data security very seriously. All personal information is encrypted using industry-standard SSL encryption. We comply with GDPR, CCPA, and other privacy regulations. Your payment information is processed through PCI DSS compliant systems and is never stored on our servers. We regularly undergo security audits and never sell or share your personal information with third parties without your explicit consent.',
                'category' => 'Privacy',
                'is_featured' => true,
                'tags' => json_encode(['security', 'privacy', 'data-protection', 'encryption']),
                'meta_description' => 'Learn about our security measures and privacy protection',
                'view_count' => 567,
                'helpful_count' => 45,
                'not_helpful_count' => 2,
            ],
        ];

        // Create specific FAQs
        foreach ($specificFaqs as $faqData) {
            $faqData['slug'] = \Illuminate\Support\Str::slug($faqData['question']);
            $faqData['status'] = 'active';
            $faqData['created_by'] = $adminUser->id;
            $faqData['created_at'] = now()->subDays(rand(1, 30));

            Faq::create($faqData);
        }

        // Create additional random FAQs using factory
        Faq::factory()
            ->count(15)
            ->active()
            ->for($adminUser, 'creator')
            ->create();

        // Create some featured FAQs
        Faq::factory()
            ->count(5)
            ->active()
            ->featured()
            ->popular()
            ->for($adminUser, 'creator')
            ->create();

        // Create some inactive FAQs
        Faq::factory()
            ->count(3)
            ->inactive()
            ->for($adminUser, 'creator')
            ->create();

        $this->command->info('FAQs seeded successfully!');
        $this->command->info('Total FAQs created: ' . Faq::count());
        $this->command->info('Active FAQs: ' . Faq::where('status', 'active')->count());
        $this->command->info('Featured FAQs: ' . Faq::where('is_featured', true)->count());
    }
}
