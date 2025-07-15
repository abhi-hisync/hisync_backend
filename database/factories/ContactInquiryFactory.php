<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactInquiry>
 */
class ContactInquiryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $services = [
            'ERP Implementation',
            'Process Automation',
            'Business Consulting',
            'Digital Transformation',
            'System Integration',
            'Training & Support',
            'Custom Development',
            'Other'
        ];

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'company' => $this->faker->optional(0.8)->company(),
            'phone' => $this->faker->optional(0.6)->phoneNumber(),
            'service' => $this->faker->optional(0.9)->randomElement($services),
            'message' => $this->faker->paragraphs(rand(1, 3), true),
            'status' => $this->faker->randomElement(['new', 'in_progress', 'resolved', 'closed']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'source' => 'website',
            'metadata' => [
                'ip_address' => $this->faker->ipv4(),
                'user_agent' => $this->faker->userAgent(),
                'referer' => $this->faker->optional(0.7)->url(),
                'submitted_at' => now()->toISOString(),
            ],
            'responded_at' => $this->faker->optional(0.3)->dateTimeBetween('-30 days', 'now'),
            'notes' => $this->faker->optional(0.4)->sentence(),
            'created_at' => $this->faker->dateTimeBetween('-90 days', 'now'),
        ];
    }
}
