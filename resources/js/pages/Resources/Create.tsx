import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Save,
    Eye,
    Upload,
    X,
    Tag,
    Globe,
    Star,
    TrendingUp,
    FileText,
    Image as ImageIcon,
    AlertCircle
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resources', href: '/resources' },
    { title: 'Create Resource', href: '/resources/create' },
];

interface Author {
    id: number;
    name: string;
    email: string;
}

interface Category {
    id: number;
    name: string;
    color?: string;
    parent_id?: number;
}

interface PageProps extends Record<string, any> {
    authors: Author[];
    categories: string[];
    resourceCategories: Category[];
    popularTags: string[];
}

export default function CreateResource({ authors, categories, resourceCategories, popularTags }: PageProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category_id: '',
        tags: [] as string[],
        author_id: '',
        status: 'draft',
        is_featured: false as boolean,
        is_trending: false as boolean,
        featured_image: null as File | null,
        gallery_images: [] as File[],
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        read_time: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Set the tags before submitting
        setData('tags', selectedTags);

        post('/resources', {
            forceFormData: true,
            onSuccess: () => {
                // Handle success
            },
        });
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleTitleChange = (title: string) => {
        setData('title', title);
        if (!data.slug) {
            setData('slug', generateSlug(title));
        }
        if (!data.meta_title) {
            setData('meta_title', title);
        }
    };

    const addTag = () => {
        if (newTag && !selectedTags.includes(newTag)) {
            setSelectedTags([...selectedTags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const addPopularTag = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('featured_image', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFeaturedImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('gallery_images', [...data.gallery_images, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGalleryPreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeGalleryImage = (index: number) => {
        const newImages = data.gallery_images.filter((_, i) => i !== index);
        const newPreviews = galleryPreviews.filter((_, i) => i !== index);
        setData('gallery_images', newImages);
        setGalleryPreviews(newPreviews);
    };

    const removeFeaturedImage = () => {
        setData('featured_image', null);
        setFeaturedImagePreview(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Resource" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/resources">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Resources
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create New Resource</h1>
                            <p className="text-gray-600">Add a new resource to your knowledge base</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter resource title"
                                    />
                                    {errors.title && (
                                        <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="resource-url-slug"
                                    />
                                    {errors.slug && (
                                        <p className="text-red-600 text-sm mt-1">{errors.slug}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Excerpt *
                                    </label>
                                    <textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Brief description of the resource"
                                    />
                                    {errors.excerpt && (
                                        <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Content */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={20}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    placeholder="Write your resource content here... (HTML supported)"
                                />
                                {errors.content && (
                                    <p className="text-red-600 text-sm mt-1">{errors.content}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    You can use HTML tags for formatting. Word count: {data.content.split(' ').filter(word => word).length}
                                </p>
                            </div>
                        </Card>

                        {/* SEO Settings */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={data.meta_title}
                                        onChange={(e) => setData('meta_title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="SEO title for search engines"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.meta_title.length}/60 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="SEO description for search engines"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.meta_description.length}/160 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meta Keywords
                                    </label>
                                    <input
                                        type="text"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Publish Settings</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="review">In Review</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Author
                                    </label>
                                    <select
                                        value={data.author_id}
                                        onChange={(e) => setData('author_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Author</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name} ({author.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.author_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.author_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select Category</option>
                                        {resourceCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && (
                                        <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Read Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.read_time}
                                        onChange={(e) => setData('read_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Auto-calculated if empty"
                                        min="1"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_featured" className="ml-2 flex items-center text-sm text-gray-700">
                                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                            Featured Resource
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_trending"
                                            checked={data.is_trending}
                                            onChange={(e) => setData('is_trending', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="is_trending" className="ml-2 flex items-center text-sm text-gray-700">
                                            <TrendingUp className="w-4 h-4 mr-1 text-orange-500" />
                                            Trending Resource
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Tags */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>

                            <div className="space-y-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add tag"
                                    />
                                    <Button type="button" onClick={addTag} size="sm">
                                        <Tag className="w-4 h-4" />
                                    </Button>
                                </div>

                                {selectedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="flex items-center">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {popularTags.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Tags:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {popularTags.map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => addPopularTag(tag)}
                                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                                    disabled={selectedTags.includes(tag)}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Images */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Featured Image
                                    </label>
                                    {featuredImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={featuredImagePreview}
                                                alt="Featured image preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeFeaturedImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFeaturedImageChange}
                                                className="hidden"
                                                id="featured-image"
                                            />
                                            <label
                                                htmlFor="featured-image"
                                                className="cursor-pointer flex flex-col items-center justify-center"
                                            >
                                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600">
                                                    Click to upload featured image
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                    {errors.featured_image && (
                                        <p className="text-red-600 text-sm mt-1">{errors.featured_image}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gallery Images
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGalleryImagesChange}
                                            className="hidden"
                                            id="gallery-images"
                                        />
                                        <label
                                            htmlFor="gallery-images"
                                            className="cursor-pointer flex flex-col items-center justify-center"
                                        >
                                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-600">
                                                Click to upload gallery images
                                            </span>
                                        </label>
                                    </div>

                                    {galleryPreviews.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {galleryPreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Gallery image ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                        {data.gallery_images[index]?.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Submit Button */}
                        <Card className="p-6">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                                size="lg"
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Save className="w-4 h-4 mr-2" />
                                        Create Resource
                                    </div>
                                )}
                            </Button>

                            {progress && (
                                <div className="mt-2">
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Uploading... {progress.percentage}%
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
