import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Palette } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'FAQ Management', href: '/faqs' },
    { title: 'Categories', href: '/faq-categories' },
    { title: 'Create Category', href: '/faq-categories/create' },
];

const iconOptions = [
    { value: 'HelpCircle', label: 'Help Circle' },
    { value: 'Package', label: 'Package' },
    { value: 'Settings', label: 'Settings' },
    { value: 'CreditCard', label: 'Credit Card' },
    { value: 'Wrench', label: 'Wrench' },
    { value: 'User', label: 'User' },
    { value: 'FolderOpen', label: 'Folder' },
    { value: 'FileText', label: 'File Text' },
    { value: 'Shield', label: 'Shield' },
    { value: 'Globe', label: 'Globe' },
];

const colorOptions = [
    { value: '#3B82F6', label: 'Blue', color: '#3B82F6' },
    { value: '#8B5CF6', label: 'Purple', color: '#8B5CF6' },
    { value: '#10B981', label: 'Green', color: '#10B981' },
    { value: '#F59E0B', label: 'Yellow', color: '#F59E0B' },
    { value: '#EF4444', label: 'Red', color: '#EF4444' },
    { value: '#6366F1', label: 'Indigo', color: '#6366F1' },
    { value: '#EC4899', label: 'Pink', color: '#EC4899' },
    { value: '#14B8A6', label: 'Teal', color: '#14B8A6' },
];

export default function FaqCategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        status: 'active' as 'active' | 'inactive',
        sort_order: 0,
        meta_title: '',
        meta_description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/faq-categories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create FAQ Category" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create FAQ Category</h1>
                        <p className="text-gray-600">Add a new category to organize your FAQs</p>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/faq-categories')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Categories
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Category Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Category Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter category name..."
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of this category..."
                                            rows={4}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.description ? 'border-red-500' : ''
                                            }`}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="meta_title">Meta Title</Label>
                                        <Input
                                            id="meta_title"
                                            value={data.meta_title}
                                            onChange={(e) => setData('meta_title', e.target.value)}
                                            placeholder="SEO title for this category"
                                            maxLength={60}
                                            className={errors.meta_title ? 'border-red-500' : ''}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            {data.meta_title.length}/60 characters
                                        </p>
                                        {errors.meta_title && (
                                            <p className="text-sm text-red-600 mt-1">{errors.meta_title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="meta_description">Meta Description</Label>
                                        <textarea
                                            id="meta_description"
                                            value={data.meta_description}
                                            onChange={(e) => setData('meta_description', e.target.value)}
                                            placeholder="SEO description for this category"
                                            rows={3}
                                            maxLength={160}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.meta_description ? 'border-red-500' : ''
                                            }`}
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
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="icon">Icon</Label>
                                        <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                                            <SelectTrigger className={errors.icon ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select an icon" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {iconOptions.map((icon) => (
                                                    <SelectItem key={icon.value} value={icon.value}>
                                                        {icon.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.icon && (
                                            <p className="text-sm text-red-600 mt-1">{errors.icon}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="color">Color</Label>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-4 gap-2">
                                                {colorOptions.map((colorOption) => (
                                                    <button
                                                        key={colorOption.value}
                                                        type="button"
                                                        onClick={() => setData('color', colorOption.value)}
                                                        className={`w-8 h-8 rounded border-2 ${
                                                            data.color === colorOption.value
                                                                ? 'border-gray-900'
                                                                : 'border-gray-200'
                                                        }`}
                                                        style={{ backgroundColor: colorOption.color }}
                                                        title={colorOption.label}
                                                    />
                                                ))}
                                            </div>
                                            <Input
                                                type="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="w-full h-10"
                                            />
                                        </div>
                                        {errors.color && (
                                            <p className="text-sm text-red-600 mt-1">{errors.color}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="sort_order">Sort Order</Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            min="0"
                                            className={errors.sort_order ? 'border-red-500' : ''}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Lower numbers appear first
                                        </p>
                                        {errors.sort_order && (
                                            <p className="text-sm text-red-600 mt-1">{errors.sort_order}</p>
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
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg p-4 space-y-2">
                                        <div className="flex items-center gap-3">
                                            {data.color && (
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: data.color }}
                                                />
                                            )}
                                            <div className="font-medium">
                                                {data.name || 'Category Name'}
                                            </div>
                                        </div>
                                        {data.description && (
                                            <p className="text-sm text-gray-600">
                                                {data.description}
                                            </p>
                                        )}
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
                                        {processing ? 'Creating...' : 'Create Category'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.get('/faq-categories')}
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
