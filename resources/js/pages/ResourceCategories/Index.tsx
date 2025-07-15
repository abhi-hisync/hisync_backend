import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    FolderOpen,
    Star,
    Hash,
    Calendar,
    Users,
    BarChart3,
    Plus,
    MoreHorizontal,
    Globe,
    FileText,
    Image as ImageIcon,
    Archive,
    CheckCircle,
    XCircle,
    AlertCircle,
    Layers,
    TreePine,
    Move,
    ArrowUp,
    ArrowDown
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
];

interface ResourceCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    color: string;
    icon?: string;
    featured_image?: string;
    parent_id?: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    resource_count: number;
    resources_count: number;
    active_resources_count: number;
    created_at: string;
    parent?: {
        id: number;
        name: string;
    };
    children?: ResourceCategory[];
    hierarchy_level: number;
    breadcrumb: Array<{
        id: number;
        name: string;
        slug: string;
        url: string;
    }>;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    featured: number;
    with_resources: number;
    root_categories: number;
    total_resources: number;
}

interface PageProps extends Record<string, any> {
    categories: {
        data: ResourceCategory[];
        links?: any[];
        meta?: any;
    };
    stats?: Stats;
    filters?: {
        statuses?: Array<{ value: string; label: string }>;
        parents?: Array<{ value: string; label: string }>;
    };
    queryParams?: {
        status?: string;
        featured?: string;
        parent?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function ResourceCategoriesIndex() {
    const { categories, stats, filters, queryParams } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(queryParams?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(queryParams?.status || 'all');
    const [selectedParent, setSelectedParent] = useState(queryParams?.parent || 'all');
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedParent !== 'all') params.set('parent', selectedParent);

        router.get(`/resource-categories?${params.toString()}`);
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedParent('all');
        router.get('/resource-categories');
    };

    const handleBulkAction = (action: string) => {
        if (selectedCategories.length === 0) return;

        router.post('/resource-categories/bulk-action', {
            action,
            category_ids: selectedCategories
        }, {
            onSuccess: () => {
                setSelectedCategories([]);
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCategories(categories.data.map(c => c.id));
        } else {
            setSelectedCategories([]);
        }
    };

    const handleSelectCategory = (categoryId: number, checked: boolean) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, categoryId]);
        } else {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        }
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive ?
            <CheckCircle className="w-4 h-4" /> :
            <XCircle className="w-4 h-4" />;
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ?
            'bg-green-100 text-green-800 border-green-200' :
            'bg-red-100 text-red-800 border-red-200';
    };

    const getHierarchyIndent = (level: number) => {
        return level * 20; // 20px per level
    };

    const reorderCategory = (categoryId: number, direction: 'up' | 'down') => {
        router.post('/resource-categories/reorder', {
            category_id: categoryId,
            direction: direction
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resource Categories Management" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resource Categories</h1>
                        <p className="text-gray-600">Organize your resources with categories and subcategories</p>
                    </div>
                    <Link href="/resource-categories/create">
                        <Button className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Category
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Featured</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats?.featured || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-yellow-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                                <p className="text-2xl font-bold text-purple-600">{stats?.total_resources?.toLocaleString() || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {filters?.statuses?.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                )) || (
                                    <>
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </>
                                )}
                            </select>

                            <select
                                value={selectedParent}
                                onChange={(e) => setSelectedParent(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {filters?.parents?.map((parent) => (
                                    <option key={parent.value} value={parent.value}>
                                        {parent.label}
                                    </option>
                                )) || (
                                    <>
                                        <option value="all">All Categories</option>
                                        <option value="root">Root Categories Only</option>
                                    </>
                                )}
                            </select>

                            <Button onClick={handleSearch} className="px-4 py-2">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>

                            <Button onClick={handleReset} variant="outline" className="px-4 py-2">
                                Reset
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Bulk Actions */}
                {selectedCategories.length > 0 && (
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {selectedCategories.length} category(ies) selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('activate')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Activate
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('feature')}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    Feature
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('deactivate')}
                                    className="bg-gray-600 hover:bg-gray-700"
                                >
                                    Deactivate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleBulkAction('delete')}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Categories Table */}
                <Card className="flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.length === categories.data.length && categories.data.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resources
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.data && categories.data.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3" style={{ paddingLeft: `${getHierarchyIndent(category.hierarchy_level)}px` }}>
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: category.color + '20', color: category.color }}
                                                >
                                                    {category.featured_image ? (
                                                        <img
                                                            src={`/storage/${category.featured_image}`}
                                                            alt={category.name}
                                                            className="w-10 h-10 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <FolderOpen className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="text-sm font-medium text-gray-900">
                                                            {category.name}
                                                        </h3>
                                                        {category.is_featured && (
                                                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                                <Star className="w-3 h-3 mr-1" />
                                                                Featured
                                                            </Badge>
                                                        )}
                                                        {category.hierarchy_level > 0 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Layers className="w-3 h-3 mr-1" />
                                                                Level {category.hierarchy_level}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-500 truncate">{category.description}</p>
                                                    )}
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-xs text-gray-400 flex items-center">
                                                            <Hash className="w-3 h-3 mr-1" />
                                                            {category.slug}
                                                        </span>
                                                        {category.children && category.children.length > 0 && (
                                                            <span className="text-xs text-gray-400 flex items-center">
                                                                <TreePine className="w-3 h-3 mr-1" />
                                                                {category.children.length} subcategories
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {category.parent ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {category.parent.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-gray-400">Root Category</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`inline-flex items-center ${getStatusColor(category.is_active)}`}>
                                                {getStatusIcon(category.is_active)}
                                                <span className="ml-1">{category.is_active ? 'Active' : 'Inactive'}</span>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {category.resource_count} total
                                                </div>
                                                <div className="flex items-center text-green-600">
                                                    <Globe className="w-3 h-3 mr-1" />
                                                    {category.active_resources_count} published
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {category.sort_order}
                                                </span>
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => reorderCategory(category.id, 'up')}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => reorderCategory(category.id, 'down')}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div>{new Date(category.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/resource-categories/${category.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/resource-categories/${category.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this category?')) {
                                                            router.delete(`/resource-categories/${category.id}`);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={category.resource_count > 0 || (category.children && category.children.length > 0)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.data && categories.data.length > 0 && categories.meta && (
                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {categories.meta.from || 1} to {categories.meta.to || categories.data.length} of {categories.meta.total || categories.data.length} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {categories.links && categories.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {(!categories.data || categories.data.length === 0) && (
                        <div className="text-center py-12">
                            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
                            <Link href="/resource-categories/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Category
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
