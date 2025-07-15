<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ResourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller/middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $resourceId = $this->route('resource') ? $this->route('resource')->id : null;

        return [
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('resources', 'slug')->ignore($resourceId)
            ],
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string|min:100',
            'category_id' => 'required|exists:resource_categories,id',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
            'author_id' => 'required|exists:users,id',

            // SEO fields
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',

            // Media fields
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'gallery_images' => 'nullable|array|max:5',
            'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',

            // Status fields
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,review,published,archived',

            // Analytics fields (usually not editable via form)
            'read_time' => 'nullable|integer|min:1|max:60',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The resource title is required.',
            'title.max' => 'The title cannot be longer than 255 characters.',
            'slug.unique' => 'This URL slug is already taken. Please choose a different one.',
            'slug.regex' => 'The URL slug can only contain lowercase letters, numbers, and hyphens.',
            'excerpt.required' => 'Please provide a brief excerpt for this resource.',
            'excerpt.max' => 'The excerpt cannot be longer than 500 characters.',
            'content.required' => 'The resource content is required.',
            'content.min' => 'The content must be at least 100 characters long.',
            'category_id.required' => 'Please select a category for this resource.',
            'category_id.exists' => 'The selected category does not exist.',
            'tags.max' => 'You can add a maximum of 10 tags.',
            'tags.*.max' => 'Each tag cannot be longer than 50 characters.',
            'author_id.required' => 'Please select an author for this resource.',
            'author_id.exists' => 'The selected author does not exist.',
            'meta_title.max' => 'The meta title cannot be longer than 60 characters.',
            'meta_description.max' => 'The meta description cannot be longer than 160 characters.',
            'featured_image.image' => 'The featured image must be a valid image file.',
            'featured_image.mimes' => 'The featured image must be a JPEG, PNG, JPG, GIF, or WebP file.',
            'featured_image.max' => 'The featured image cannot be larger than 2MB.',
            'gallery_images.max' => 'You can upload a maximum of 5 gallery images.',
            'gallery_images.*.image' => 'All gallery files must be valid images.',
            'gallery_images.*.mimes' => 'Gallery images must be JPEG, PNG, JPG, GIF, or WebP files.',
            'gallery_images.*.max' => 'Each gallery image cannot be larger than 2MB.',
            'published_at.date' => 'Please provide a valid publication date.',
            'status.in' => 'Please select a valid status.',
            'read_time.integer' => 'Read time must be a number.',
            'read_time.min' => 'Read time must be at least 1 minute.',
            'read_time.max' => 'Read time cannot be more than 60 minutes.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'meta_title' => 'SEO title',
            'meta_description' => 'SEO description',
            'meta_keywords' => 'SEO keywords',
            'is_featured' => 'featured status',
            'is_trending' => 'trending status',
            'is_published' => 'published status',
            'published_at' => 'publication date',
            'author_id' => 'author',
            'category_id' => 'category',
            'read_time' => 'estimated read time',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert string booleans to actual booleans
        if ($this->has('is_featured')) {
            $this->merge([
                'is_featured' => filter_var($this->is_featured, FILTER_VALIDATE_BOOLEAN)
            ]);
        }

        if ($this->has('is_trending')) {
            $this->merge([
                'is_trending' => filter_var($this->is_trending, FILTER_VALIDATE_BOOLEAN)
            ]);
        }

        if ($this->has('is_published')) {
            $this->merge([
                'is_published' => filter_var($this->is_published, FILTER_VALIDATE_BOOLEAN)
            ]);
        }

        // Auto-generate slug if not provided
        if (!$this->has('slug') || empty($this->slug)) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->title)
            ]);
        }

        // Auto-generate meta fields if not provided
        if (!$this->has('meta_title') || empty($this->meta_title)) {
            $this->merge([
                'meta_title' => $this->title
            ]);
        }

        if (!$this->has('meta_description') || empty($this->meta_description)) {
            $this->merge([
                'meta_description' => \Illuminate\Support\Str::limit($this->excerpt, 155)
            ]);
        }

        // Set published_at to now if publishing and no date provided
        if ($this->is_published && (!$this->has('published_at') || empty($this->published_at))) {
            $this->merge([
                'published_at' => now()
            ]);
        }

        // Auto-set status based on is_published
        if ($this->is_published && $this->status === 'draft') {
            $this->merge([
                'status' => 'published'
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Custom validation: If published, must have published_at date
            if ($this->is_published && !$this->published_at) {
                $validator->errors()->add('published_at', 'Publication date is required when resource is published.');
            }

            // Custom validation: Featured resources should be published
            if ($this->is_featured && !$this->is_published) {
                $validator->errors()->add('is_featured', 'Featured resources must be published.');
            }

            // Custom validation: Trending resources should be published
            if ($this->is_trending && !$this->is_published) {
                $validator->errors()->add('is_trending', 'Trending resources must be published.');
            }
        });
    }
}
