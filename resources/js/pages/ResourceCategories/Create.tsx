import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Save,
    FolderOpen,
    Hash,
    Palette,
    Image as ImageIcon,
    Globe,
    Star,
    Eye,
    EyeOff,
    Layers,
    Upload,
    X
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resources', href: '/resources' },
    { title: 'Categories', href: '/resource-categories' },
    { title: 'Create Category', href: '/resource-categories/create' },
];

interface ParentCategory {
    id: number;
    name: string;
}

interface PageProps extends Record<string, any> {
    parentCategories: ParentCategory[];
}

export default function CreateResourceCategory() {
    const { parentCategories } = usePage<PageProps>().props;
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        color: '#3B82F6',
        icon: '',
        featured_image: null as File | null,
        parent_id: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_active: true as boolean,
        is_featured: false as boolean,
        sort_order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/resource-categories');
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        if (!data.slug) {
            setData('slug', generateSlug(name));
        }
        if (!data.meta_title) {
            setData('meta_title', name);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('featured_image', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('featured_image', null);
        setPreviewImage(null);
    };

    const colorPresets = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/resource-categories">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
                            <p className="text-gray-600">Add a new resource category</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter category name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                <Hash className="w-4 h-4" />
                                            </span>
                                            <input
                                                type="text"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="category-slug"
                                            />
                                        </div>
                                        {errors.slug && (
                                            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Describe this category..."
                                        />
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parent Category
                                        </label>
                                        <select
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Root Category</option>
                                            {parentCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.parent_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Appearance */}
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Color
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg border border-gray-200"
                                                    style={{ backgroundColor: data.color }}
                                                />
                                                <input
                                                    type="color"
                                                    value={data.color}
                                                    onChange={(e) => setData('color', e.target.value)}
                                                    className="w-16 h-10 border border-gray-300 rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.color}
                                                    onChange={(e) => setData('color', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="#3B82F6"
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                {colorPresets.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setData('color', color)}
                                                        className={`w-8 h-8 rounded-lg border-2 ${
                                                            data.color === color ? 'border-gray-900' : 'border-gray-200'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {errors.color && (
                                            <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Icon Class
                                        </label>
                                        <input
                                            type="text"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="lucide-folder-open or fa-folder"
                                        />
                                        {errors.icon && (
                                            <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Featured Image
                                        </label>
                                        {previewImage ? (
                                            <div className="relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                <label className="cursor-pointer text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <span className="text-sm text-gray-600">Click to upload image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        )}
                                        {errors.featured_image && (
                                            <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* SEO Settings */}
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>

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
                                            placeholder="SEO title for this category"
                                        />
                                        {errors.meta_title && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meta_title}</p>
                                        )}
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
                                            placeholder="SEO description for this category"
                                        />
                                        {errors.meta_description && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meta_description}</p>
                                        )}
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
                                        {errors.meta_keywords && (
                                            <p className="mt-1 text-sm text-red-600">{errors.meta_keywords}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Settings */}
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Active</label>
                                            <p className="text-xs text-gray-500">Category is visible to users</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('is_active', !data.is_active)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                data.is_active ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    data.is_active ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Featured</label>
                                            <p className="text-xs text-gray-500">Show in featured categories</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('is_featured', !data.is_featured)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                data.is_featured ? 'bg-yellow-500' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    data.is_featured ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="0"
                                        />
                                        {errors.sort_order && (
                                            <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Preview */}
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: data.color + '20', color: data.color }}
                                        >
                                            <FolderOpen className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900">
                                                    {data.name || 'Category Name'}
                                                </h4>
                                                {data.is_featured && (
                                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                            {data.description && (
                                                <p className="text-sm text-gray-500">{data.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Actions */}
                            <Card className="p-6">
                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing ? 'Creating...' : 'Create Category'}
                                    </Button>
                                    <Link href="/resource-categories">
                                        <Button variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
