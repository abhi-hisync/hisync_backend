import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'FAQ Management', href: '/faqs' },
    { title: 'Create FAQ', href: '/faqs/create' },
];

interface FaqCategory {
    id: number;
    name: string;
    color?: string;
}

interface Props {
    categories: FaqCategory[];
}

export default function FaqCreate({ categories }: Props) {
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        answer: '',
        category_id: '',
        status: 'active' as 'active' | 'inactive',
        is_featured: false as boolean,
        tags: [] as string[],
        meta_description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Update tags before submitting
        setData('tags', tags);
        post('/faqs');
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTags = [...tags, tagInput.trim()];
            setTags(newTags);
            setData('tags', newTags);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        setData('tags', newTags);
    };

    const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create FAQ" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create FAQ</h1>
                        <p className="text-gray-600">Add a new frequently asked question</p>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/faqs')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to FAQs
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>FAQ Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="question">Question *</Label>
                                        <Input
                                            id="question"
                                            value={data.question}
                                            onChange={(e) => setData('question', e.target.value)}
                                            placeholder="Enter the frequently asked question..."
                                            className={errors.question ? 'border-red-500' : ''}
                                        />
                                        {errors.question && (
                                            <p className="text-sm text-red-600 mt-1">{errors.question}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="answer">Answer *</Label>
                                        <textarea
                                            id="answer"
                                            value={data.answer}
                                            onChange={(e) => setData('answer', e.target.value)}
                                            placeholder="Provide a comprehensive answer..."
                                            rows={8}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.answer ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {errors.answer && (
                                            <p className="text-sm text-red-600 mt-1">{errors.answer}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <Input
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            placeholder="Brief description for SEO (optional)"
                                            maxLength={160}
                                            className={errors.meta_description ? 'border-red-500' : ''}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.meta_description.length}/160 characters
                                        </p>
                                        {errors.meta_description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.meta_description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Tags</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="tagInput">Add Tags</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="tagInput"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={handleTagInputKeyPress}
                                                placeholder="Enter a tag and press Enter"
                                            />
                                            <Button type="button" onClick={addTag} variant="outline">
                                                Add
                                            </Button>
                                        </div>
                                    </div>

                                    {tags.length > 0 && (
                                        <div>
                                            <Label>Current Tags</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-1 hover:bg-red-100 rounded-full p-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <div className="flex gap-2">
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                {category.color && (
                                                                    <div
                                                                        className="w-3 h-3 rounded-full"
                                                                        style={{ backgroundColor: category.color }}
                                                                    />
                                                                )}
                                                                {category.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get('/faq-categories/create')}
                                                title="Add new category"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.category_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.category_id}</p>
                                        )}
                                        {categories.length === 0 && (
                                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm text-yellow-800">
                                                    No categories available.
                                                    <Link href="/faq-categories/create" className="font-medium underline ml-1">
                                                        Create one first
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={(value) => setData('status', value as 'active' | 'inactive')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="featured"
                                            checked={data.is_featured}
                                            onCheckedChange={(checked) => setData('is_featured', !!checked)}
                                        />
                                        <Label htmlFor="featured">Featured FAQ</Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Creating...' : 'Create FAQ'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.get('/faqs')}
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
