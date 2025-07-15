<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactInquiryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Allow all users to submit contact forms
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'service' => ['nullable', 'string', 'in:ERP Implementation,Process Automation,Business Consulting,Digital Transformation,System Integration,Training & Support,Custom Development,Other'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'name.regex' => 'Name should only contain letters and spaces.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'phone.regex' => 'Please provide a valid phone number.',
            'message.required' => 'Message is required.',
            'message.min' => 'Message must be at least 10 characters long.',
            'message.max' => 'Message cannot exceed 5000 characters.',
            'service.in' => 'Please select a valid service option.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim($this->name),
            'email' => strtolower(trim($this->email)),
            'company' => $this->company ? trim($this->company) : null,
            'phone' => $this->phone ? preg_replace('/[^+0-9\s\-\(\)]/', '', trim($this->phone)) : null,
            'message' => trim($this->message),
        ]);
    }

    /**
     * Get the validated data along with additional metadata.
     */
    public function getValidatedDataWithMetadata(): array
    {
        $validated = $this->validated();

        // Add metadata
        $validated['metadata'] = [
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'referer' => $this->headers->get('referer'),
            'submitted_at' => now()->toISOString(),
        ];

        $validated['source'] = 'website';

        return $validated;
    }
}
