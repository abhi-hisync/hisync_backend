<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FaqRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check(); // Only authenticated users can manage FAQs
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $faqId = $this->route('faq') ? $this->route('faq')->id : null;

        return [
            'question' => ['required', 'string', 'min:10', 'max:500'],
            'answer' => ['required', 'string', 'min:20', 'max:5000'],
            'category_id' => ['required', 'exists:faq_categories,id'],
            'status' => ['required', 'in:active,inactive'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_featured' => ['boolean'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:50'],
            'is_helpful_tracking' => ['boolean'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('faqs', 'slug')->ignore($faqId)
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'question.required' => 'Question is required.',
            'question.min' => 'Question must be at least 10 characters long.',
            'question.max' => 'Question cannot exceed 500 characters.',
            'answer.required' => 'Answer is required.',
            'answer.min' => 'Answer must be at least 20 characters long.',
            'answer.max' => 'Answer cannot exceed 5000 characters.',
            'category_id.required' => 'Please select a valid category.',
            'category_id.exists' => 'The selected category is invalid.',
            'status.required' => 'Status is required.',
            'status.in' => 'Please select a valid status.',
            'tags.max' => 'You can add maximum 10 tags.',
            'tags.*.max' => 'Each tag cannot exceed 50 characters.',
            'slug.unique' => 'This slug is already taken.',
            'slug.regex' => 'Slug can only contain lowercase letters, numbers, and hyphens.',
            'meta_description.max' => 'Meta description cannot exceed 300 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'question' => trim($this->question),
            'answer' => trim($this->answer),
            'is_featured' => $this->boolean('is_featured'),
            'is_helpful_tracking' => $this->boolean('is_helpful_tracking', true),
            'sort_order' => $this->sort_order ?: 0,
        ]);
    }

    /**
     * Get the validated data with additional fields.
     */
    public function getValidatedDataWithMetadata(): array
    {
        $validated = $this->validated();

        // Add user tracking
        if ($this->isMethod('POST')) {
            $validated['created_by'] = auth()->id();
        } else {
            $validated['updated_by'] = auth()->id();
        }

        return $validated;
    }
}
