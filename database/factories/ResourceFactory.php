<?php

namespace Database\Factories;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Resource>
 */
class ResourceFactory extends Factory
{
    protected $model = Resource::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->sentence(rand(4, 8));
        $categories = [
            'Guides & Tutorials',
            'Best Practices',
            'Case Studies',
            'Industry Insights',
            'Technical Deep Dives',
            'Product Updates',
            'Security & Compliance',
            'Integration Guides',
            'Performance Optimization',
            'Enterprise Solutions'
        ];

        $tags = [
            'synchronization', 'data-management', 'cloud', 'enterprise', 'security',
            'api', 'integration', 'performance', 'scalability', 'best-practices',
            'automation', 'workflow', 'real-time', 'backup', 'compliance',
            'monitoring', 'analytics', 'optimization', 'architecture', 'devops'
        ];

        $content = $this->generateRichContent();
        $excerpt = $this->faker->paragraph(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => $excerpt,
            'content' => $content,
            'category' => $this->faker->randomElement($categories),
            'tags' => $this->faker->randomElements($tags, rand(3, 6)),
            'author_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'meta_title' => $title,
            'meta_description' => Str::limit($excerpt, 155),
            'meta_keywords' => implode(', ', $this->faker->randomElements($tags, 5)),
            'featured_image' => 'resources/featured-' . $this->faker->numberBetween(1, 10) . '.jpg',
            'gallery_images' => $this->faker->boolean(30) ? [
                'resources/gallery-' . $this->faker->numberBetween(1, 5) . '.jpg',
                'resources/gallery-' . $this->faker->numberBetween(6, 10) . '.jpg',
            ] : null,
            'is_featured' => $this->faker->boolean(20),
            'is_trending' => $this->faker->boolean(15),
            'is_published' => $this->faker->boolean(85),
            'published_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'status' => $this->faker->randomElement(['draft', 'review', 'published']),
            'view_count' => $this->faker->numberBetween(50, 5000),
            'share_count' => $this->faker->numberBetween(5, 200),
            'like_count' => $this->faker->numberBetween(10, 500),
            'read_time' => $this->faker->numberBetween(3, 15),
            'seo_score' => $this->faker->numberBetween(60, 100),
        ];
    }

    /**
     * Generate rich HTML content for the resource.
     */
    private function generateRichContent(): string
    {
        $sections = [
            '<h2>Introduction</h2>',
            '<p>' . $this->faker->paragraph(4) . '</p>',
            '<p>' . $this->faker->paragraph(3) . '</p>',

            '<h2>Key Benefits</h2>',
            '<ul>',
            '<li>' . $this->faker->sentence() . '</li>',
            '<li>' . $this->faker->sentence() . '</li>',
            '<li>' . $this->faker->sentence() . '</li>',
            '<li>' . $this->faker->sentence() . '</li>',
            '</ul>',

            '<h2>Implementation Guide</h2>',
            '<p>' . $this->faker->paragraph(5) . '</p>',

            '<h3>Step 1: Planning</h3>',
            '<p>' . $this->faker->paragraph(3) . '</p>',

            '<h3>Step 2: Configuration</h3>',
            '<p>' . $this->faker->paragraph(4) . '</p>',
            '<pre><code>// Example configuration
{
  "sync": {
    "enabled": true,
    "interval": "5m",
    "retry_attempts": 3
  }
}</code></pre>',

            '<h3>Step 3: Testing</h3>',
            '<p>' . $this->faker->paragraph(3) . '</p>',

            '<h2>Best Practices</h2>',
            '<ol>',
            '<li><strong>Security First:</strong> ' . $this->faker->sentence() . '</li>',
            '<li><strong>Performance:</strong> ' . $this->faker->sentence() . '</li>',
            '<li><strong>Monitoring:</strong> ' . $this->faker->sentence() . '</li>',
            '<li><strong>Documentation:</strong> ' . $this->faker->sentence() . '</li>',
            '</ol>',

            '<blockquote>',
            '<p>' . $this->faker->paragraph(2) . '</p>',
            '</blockquote>',

            '<h2>Common Challenges</h2>',
            '<p>' . $this->faker->paragraph(4) . '</p>',

            '<h2>Conclusion</h2>',
            '<p>' . $this->faker->paragraph(3) . '</p>',
            '<p>' . $this->faker->paragraph(2) . '</p>',
        ];

        return implode("\n", $sections);
    }

    /**
     * Indicate that the resource is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'is_trending' => $this->faker->boolean(50),
        ]);
    }

    /**
     * Indicate that the resource is trending.
     */
    public function trending(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_trending' => true,
            'view_count' => $this->faker->numberBetween(1000, 10000),
            'share_count' => $this->faker->numberBetween(100, 1000),
        ]);
    }

    /**
     * Indicate that the resource is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
            'status' => 'published',
            'published_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
        ]);
    }

    /**
     * Indicate that the resource is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => false,
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Create a resource with specific category.
     */
    public function category(string $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => $category,
        ]);
    }
}
