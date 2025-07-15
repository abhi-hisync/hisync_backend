<?php

namespace Database\Factories;

use App\Models\ResourceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResourceCategory>
 */
class ResourceCategoryFactory extends Factory
{
    protected $model = ResourceCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        $slug = Str::slug($name);

        return [
            'name' => ucwords($name),
            'slug' => $slug,
            'description' => $this->faker->optional(0.7)->paragraph(),
            'color' => $this->faker->hexColor(),
            'icon' => $this->faker->optional(0.5)->randomElement([
                'fas fa-code', 'fas fa-paint-brush', 'fas fa-chart-bar',
                'fas fa-cogs', 'fas fa-mobile-alt', 'fas fa-database',
                'fas fa-cloud', 'fas fa-shield-alt', 'fas fa-robot'
            ]),
            'meta_title' => $this->faker->optional(0.6)->sentence(4),
            'meta_description' => $this->faker->optional(0.6)->text(150),
            'meta_keywords' => $this->faker->optional(0.5)->words(5, true),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'sort_order' => $this->faker->numberBetween(0, 100),
            'resource_count' => 0, // Will be updated when resources are assigned
        ];
    }

    /**
     * Indicate that the category should be featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the category should be inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the category should be a root category.
     */
    public function root(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
        ]);
    }

    /**
     * Indicate that the category should be a subcategory.
     */
    public function subcategory(?int $parentId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parentId ?? ResourceCategory::factory()->root(),
        ]);
    }

    /**
     * Create a category with specific technology focus.
     */
    public function technology(): static
    {
        $techCategories = [
            'Web Development', 'Mobile Development', 'Data Science',
            'Machine Learning', 'DevOps', 'Cybersecurity',
            'Cloud Computing', 'Blockchain', 'Game Development'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($techCategories),
            'color' => $this->faker->randomElement(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']),
            'icon' => $this->faker->randomElement([
                'fas fa-code', 'fas fa-mobile-alt', 'fas fa-chart-bar',
                'fas fa-robot', 'fas fa-cogs', 'fas fa-shield-alt'
            ]),
        ]);
    }

    /**
     * Create a category with business focus.
     */
    public function business(): static
    {
        $businessCategories = [
            'Marketing', 'Sales', 'Finance', 'HR & Recruitment',
            'Project Management', 'Leadership', 'Entrepreneurship',
            'Customer Service', 'Operations'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($businessCategories),
            'color' => $this->faker->randomElement(['#059669', '#DC2626', '#7C3AED', '#DB2777', '#EA580C']),
            'icon' => $this->faker->randomElement([
                'fas fa-briefcase', 'fas fa-chart-line', 'fas fa-users',
                'fas fa-handshake', 'fas fa-bullhorn', 'fas fa-dollar-sign'
            ]),
        ]);
    }

    /**
     * Create a category with design focus.
     */
    public function design(): static
    {
        $designCategories = [
            'UI/UX Design', 'Graphic Design', 'Web Design',
            'Brand Design', 'Product Design', 'Motion Graphics',
            'Print Design', 'Design Systems'
        ];

        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement($designCategories),
            'color' => $this->faker->randomElement(['#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16']),
            'icon' => $this->faker->randomElement([
                'fas fa-paint-brush', 'fas fa-palette', 'fas fa-pencil-ruler',
                'fas fa-vector-square', 'fas fa-swatchbook', 'fas fa-eye'
            ]),
        ]);
    }
}
