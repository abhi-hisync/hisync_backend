<?php

namespace Database\Factories;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Faq>
 */
class FaqFactory extends Factory
{
    protected $model = Faq::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'General', 'Products', 'Services', 'Billing', 'Technical Support',
            'Account Management', 'Shipping', 'Returns', 'Privacy', 'Security'
        ];

        $questions = [
            'How do I create an account?',
            'What payment methods do you accept?',
            'How can I track my order?',
            'What is your return policy?',
            'How do I reset my password?',
            'Do you offer international shipping?',
            'How can I contact customer support?',
            'What are your business hours?',
            'How do I cancel my subscription?',
            'Is my personal information secure?',
            'How long does shipping take?',
            'Can I modify my order after placing it?',
            'Do you offer bulk discounts?',
            'How do I update my billing information?',
            'What if I receive a damaged product?',
            'How do I apply a promo code?',
            'Can I save items for later?',
            'What browsers do you support?',
            'How do I delete my account?',
            'Do you have a mobile app?'
        ];

        $question = $this->faker->randomElement($questions);

        // Generate unique slug
        $baseSlug = Str::slug($question);
        $slug = $baseSlug;
        $counter = 1;

        // Check for existing slug in a more efficient way
        while (Faq::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Add random suffix to ensure uniqueness during factory creation
        $slug = $slug . '-' . $this->faker->unique()->numberBetween(1000, 9999);

        $tags = $this->faker->randomElements([
            'account', 'payment', 'shipping', 'order', 'support', 'billing',
            'security', 'product', 'service', 'policy', 'technical', 'mobile'
        ], $this->faker->numberBetween(1, 4));

        return [
            'question' => $question,
            'answer' => $this->faker->paragraphs($this->faker->numberBetween(2, 5), true),
            'category' => $this->faker->randomElement($categories),
            'slug' => $slug,
            'status' => $this->faker->randomElement(['active', 'inactive']),
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'tags' => json_encode($tags),
            'meta_description' => $this->faker->sentence(15),
            'view_count' => $this->faker->numberBetween(0, 1000),
            'helpful_count' => $this->faker->numberBetween(0, 50),
            'not_helpful_count' => $this->faker->numberBetween(0, 10),
            'created_by' => User::factory(),
            'updated_by' => null,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ];
    }

    /**
     * Indicate that the FAQ is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }

    /**
     * Indicate that the FAQ is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the FAQ is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the FAQ is not featured.
     */
    public function notFeatured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => false,
        ]);
    }

    /**
     * Set a specific category for the FAQ.
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }

    /**
     * Create FAQ with high engagement.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(500, 2000),
            'helpful_count' => $this->faker->numberBetween(50, 200),
            'not_helpful_count' => $this->faker->numberBetween(5, 20),
            'is_featured' => true,
        ]);
    }

    /**
     * Create FAQ with low engagement.
     */
    public function unpopular(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(0, 50),
            'helpful_count' => $this->faker->numberBetween(0, 5),
            'not_helpful_count' => $this->faker->numberBetween(0, 2),
            'is_featured' => false,
        ]);
    }
}
