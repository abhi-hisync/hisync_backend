<?php

namespace Database\Seeders;

use App\Models\ResourceCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ResourceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create main technology categories
        $techCategories = [
            [
                'name' => 'Web Development',
                'slug' => 'web-development',
                'description' => 'Everything related to web development including frontend, backend, and full-stack development.',
                'color' => '#3B82F6',
                'icon' => 'fas fa-code',
                'is_featured' => true,
                'sort_order' => 1,
                'subcategories' => [
                    [
                        'name' => 'Frontend Development',
                        'slug' => 'frontend-development',
                        'description' => 'Client-side web development technologies and frameworks.',
                        'color' => '#10B981',
                        'icon' => 'fas fa-laptop-code',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Backend Development',
                        'slug' => 'backend-development',
                        'description' => 'Server-side development, APIs, databases, and architecture.',
                        'color' => '#F59E0B',
                        'icon' => 'fas fa-server',
                        'sort_order' => 2,
                    ],
                    [
                        'name' => 'Full Stack Development',
                        'slug' => 'full-stack-development',
                        'description' => 'End-to-end web development covering both frontend and backend.',
                        'color' => '#8B5CF6',
                        'icon' => 'fas fa-layer-group',
                        'sort_order' => 3,
                    ],
                ]
            ],
            [
                'name' => 'Mobile Development',
                'slug' => 'mobile-development',
                'description' => 'Native and cross-platform mobile app development.',
                'color' => '#EC4899',
                'icon' => 'fas fa-mobile-alt',
                'is_featured' => true,
                'sort_order' => 2,
                'subcategories' => [
                    [
                        'name' => 'iOS Development',
                        'slug' => 'ios-development',
                        'description' => 'Native iOS app development with Swift and Objective-C.',
                        'color' => '#000000',
                        'icon' => 'fab fa-apple',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Android Development',
                        'slug' => 'android-development',
                        'description' => 'Native Android app development with Kotlin and Java.',
                        'color' => '#3DDC84',
                        'icon' => 'fab fa-android',
                        'sort_order' => 2,
                    ],
                    [
                        'name' => 'Cross-Platform Development',
                        'slug' => 'cross-platform-development',
                        'description' => 'Multi-platform development with React Native, Flutter, etc.',
                        'color' => '#02569B',
                        'icon' => 'fas fa-mobile',
                        'sort_order' => 3,
                    ],
                ]
            ],
            [
                'name' => 'Data Science',
                'slug' => 'data-science',
                'description' => 'Data analysis, machine learning, and artificial intelligence.',
                'color' => '#DC2626',
                'icon' => 'fas fa-chart-bar',
                'is_featured' => true,
                'sort_order' => 3,
                'subcategories' => [
                    [
                        'name' => 'Machine Learning',
                        'slug' => 'machine-learning',
                        'description' => 'ML algorithms, models, and frameworks.',
                        'color' => '#7C3AED',
                        'icon' => 'fas fa-robot',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Data Analysis',
                        'slug' => 'data-analysis',
                        'description' => 'Data processing, visualization, and statistical analysis.',
                        'color' => '#059669',
                        'icon' => 'fas fa-chart-pie',
                        'sort_order' => 2,
                    ],
                    [
                        'name' => 'Big Data',
                        'slug' => 'big-data',
                        'description' => 'Large-scale data processing and distributed systems.',
                        'color' => '#EA580C',
                        'icon' => 'fas fa-database',
                        'sort_order' => 3,
                    ],
                ]
            ],
            [
                'name' => 'DevOps & Cloud',
                'slug' => 'devops-cloud',
                'description' => 'Cloud computing, infrastructure, deployment, and automation.',
                'color' => '#0891B2',
                'icon' => 'fas fa-cloud',
                'is_featured' => true,
                'sort_order' => 4,
                'subcategories' => [
                    [
                        'name' => 'Cloud Platforms',
                        'slug' => 'cloud-platforms',
                        'description' => 'AWS, Azure, Google Cloud, and other cloud services.',
                        'color' => '#F59E0B',
                        'icon' => 'fas fa-cloud-upload-alt',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Containerization',
                        'slug' => 'containerization',
                        'description' => 'Docker, Kubernetes, and container orchestration.',
                        'color' => '#2563EB',
                        'icon' => 'fab fa-docker',
                        'sort_order' => 2,
                    ],
                    [
                        'name' => 'CI/CD',
                        'slug' => 'ci-cd',
                        'description' => 'Continuous integration and deployment pipelines.',
                        'color' => '#16A34A',
                        'icon' => 'fas fa-sync-alt',
                        'sort_order' => 3,
                    ],
                ]
            ],
            [
                'name' => 'Cybersecurity',
                'slug' => 'cybersecurity',
                'description' => 'Information security, ethical hacking, and privacy protection.',
                'color' => '#DC2626',
                'icon' => 'fas fa-shield-alt',
                'sort_order' => 5,
                'subcategories' => [
                    [
                        'name' => 'Ethical Hacking',
                        'slug' => 'ethical-hacking',
                        'description' => 'Penetration testing and vulnerability assessment.',
                        'color' => '#000000',
                        'icon' => 'fas fa-user-ninja',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Network Security',
                        'slug' => 'network-security',
                        'description' => 'Securing networks and communication protocols.',
                        'color' => '#7C2D12',
                        'icon' => 'fas fa-network-wired',
                        'sort_order' => 2,
                    ],
                ]
            ],
        ];

        // Create business/soft skills categories
        $businessCategories = [
            [
                'name' => 'Business & Management',
                'slug' => 'business-management',
                'description' => 'Business strategy, leadership, and management skills.',
                'color' => '#059669',
                'icon' => 'fas fa-briefcase',
                'sort_order' => 6,
                'subcategories' => [
                    [
                        'name' => 'Project Management',
                        'slug' => 'project-management',
                        'description' => 'Agile, Scrum, and project planning methodologies.',
                        'color' => '#7C3AED',
                        'icon' => 'fas fa-tasks',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'Leadership',
                        'slug' => 'leadership',
                        'description' => 'Team leadership and management skills.',
                        'color' => '#DC2626',
                        'icon' => 'fas fa-users',
                        'sort_order' => 2,
                    ],
                ]
            ],
            [
                'name' => 'Design & UX',
                'slug' => 'design-ux',
                'description' => 'User experience, interface design, and creative skills.',
                'color' => '#EC4899',
                'icon' => 'fas fa-paint-brush',
                'sort_order' => 7,
                'subcategories' => [
                    [
                        'name' => 'UI Design',
                        'slug' => 'ui-design',
                        'description' => 'User interface design principles and tools.',
                        'color' => '#8B5CF6',
                        'icon' => 'fas fa-pencil-ruler',
                        'sort_order' => 1,
                    ],
                    [
                        'name' => 'UX Research',
                        'slug' => 'ux-research',
                        'description' => 'User research and usability testing.',
                        'color' => '#06B6D4',
                        'icon' => 'fas fa-search',
                        'sort_order' => 2,
                    ],
                ]
            ],
        ];

        // Merge all categories
        $allCategories = array_merge($techCategories, $businessCategories);

        // Create categories with their subcategories
        foreach ($allCategories as $categoryData) {
            $subcategories = $categoryData['subcategories'] ?? [];
            unset($categoryData['subcategories']);

            $category = ResourceCategory::create($categoryData);

            // Create subcategories
            foreach ($subcategories as $subcategoryData) {
                $subcategoryData['parent_id'] = $category->id;
                ResourceCategory::create($subcategoryData);
            }
        }

        // Update resource counts (this would be done automatically when resources are assigned)
        $this->command->info('Resource categories created successfully!');
    }
}
