<?php

namespace Database\Seeders;

use App\Models\Resource;
use App\Models\User;
use Illuminate\Database\Seeder;

class ResourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have users to assign as authors
        if (User::count() === 0) {
            User::factory(5)->create();
        }

        // Create featured resources
        Resource::factory()
            ->count(3)
            ->featured()
            ->published()
            ->create();

        // Create trending resources
        Resource::factory()
            ->count(4)
            ->trending()
            ->published()
            ->create();

        // Create regular published resources
        Resource::factory()
            ->count(20)
            ->published()
            ->create();

        // Create some draft resources
        Resource::factory()
            ->count(5)
            ->draft()
            ->create();

        // Create category-specific resources
        $categories = [
            'Guides & Tutorials' => 8,
            'Best Practices' => 6,
            'Case Studies' => 5,
            'Industry Insights' => 4,
            'Technical Deep Dives' => 3,
        ];

        foreach ($categories as $category => $count) {
            Resource::factory()
                ->count($count)
                ->category($category)
                ->published()
                ->create();
        }

        // Update SEO scores for all resources
        Resource::chunk(50, function ($resources) {
            foreach ($resources as $resource) {
                $resource->generateSeoScore();
            }
        });

        $this->command->info('Resources seeded successfully!');
        $this->command->info('Total resources created: ' . Resource::count());
        $this->command->info('Published resources: ' . Resource::where('is_published', true)->count());
        $this->command->info('Featured resources: ' . Resource::where('is_featured', true)->count());
        $this->command->info('Trending resources: ' . Resource::where('is_trending', true)->count());
    }
}
