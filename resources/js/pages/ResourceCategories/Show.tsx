import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Edit,
    Trash2,
    FolderOpen,
    Hash,
    Calendar,
    Globe,
    Star,
    Eye,
    BarChart3,
    Users,
    Layers,
    Plus,
    FileText,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    Tag
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface Resource {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    status: string;
    is_featured: boolean;
    is_trending: boolean;
    featured_image?: string;
    read_time: number;
    view_count: number;
    published_at?: string;
    author: {
        id: number;
        name: string;
        email: string;
    };
}

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
    created_at: string;
    parent?: {
        id: number;
        name: string;
    };
    children?: ResourceCategory[];
    activeResources?: Resource[];
    breadcrumb: Array<{
        id: number;
        name: string;
        slug: string;
        url: string;
    }>;
}

interface Stats {
    total_resources: number;
    published_resources: number;
    draft_resources: number;
    total_views: number;
    avg_seo_score: number;
    children_count: number;
}

interface PageProps extends Record<string, any> {
    category: ResourceCategory;
    stats: Stats;
}

export default function ShowResourceCategory() {
    const { category, stats } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Resources', href: '/resources' },
        { title: 'Categories', href: '/resource-categories' },
        { title: category.name, href: `/resource-categories/${category.id}` },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
            router.delete(`/resource-categories/${category.id}`);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published':
                return <CheckCircle className="w-4 h-4" />;
            case 'draft':
                return <FileText className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'draft':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category - ${category.name}`} />

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
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                                {category.is_featured && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Star className="w-3 h-3 mr-1" />
                                        Featured
                                    </Badge>
                                )}
                                <Badge className={category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            {category.description && (
                                <p className="text-gray-600 mt-1">{category.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/resource-categories/${category.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={category.resource_count > 0 || (category.children && category.children.length > 0)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Breadcrumb */}
                {category.breadcrumb && category.breadcrumb.length > 1 && (
                    <Card className="p-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Path:</span>
                            {category.breadcrumb.map((item, index) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    {index > 0 && <span>/</span>}
                                    <span className={index === category.breadcrumb.length - 1 ? 'font-medium text-gray-900' : ''}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_resources}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-2xl font-bold text-green-600">{stats.published_resources}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.total_views.toLocaleString()}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Resources */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Recent Resources</h3>
                                <Link href={`/resources?category=${category.slug}`}>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </Link>
                            </div>

                            {category.activeResources && category.activeResources.length > 0 ? (
                                <div className="space-y-4">
                                    {category.activeResources.map((resource) => (
                                        <div key={resource.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {resource.featured_image ? (
                                                    <img
                                                        src={`/storage/${resource.featured_image}`}
                                                        alt={resource.title}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <FileText className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {resource.title}
                                                    </h4>
                                                    {resource.is_featured && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                            <Star className="w-3 h-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {resource.is_trending && (
                                                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                                                            <TrendingUp className="w-3 h-3 mr-1" />
                                                            Trending
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 truncate mt-1">{resource.excerpt}</p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className="text-xs text-gray-400 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {resource.read_time} min read
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        {resource.view_count} views
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        {resource.author.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={`inline-flex items-center ${getStatusColor(resource.status)}`}>
                                                    {getStatusIcon(resource.status)}
                                                    <span className="ml-1 capitalize">{resource.status}</span>
                                                </Badge>
                                                <Link
                                                    href={`/resources/${resource.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No resources found</h4>
                                    <p className="text-gray-600 mb-4">This category doesn't have any resources yet.</p>
                                    <Link href={`/resources/create?category=${category.id}`}>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Resource
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </Card>

                        {/* Subcategories */}
                        {category.children && category.children.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Subcategories</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.children.map((child) => (
                                        <Link
                                            key={child.id}
                                            href={`/resource-categories/${child.id}`}
                                            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: child.color + '20', color: child.color }}
                                            >
                                                <FolderOpen className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-medium text-gray-900">{child.name}</h4>
                                                    {child.is_featured && (
                                                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">{child.resource_count} resources</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category Details */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Category Details</h3>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">Slug:</span>
                                    <p className="text-sm font-medium font-mono">#{category.slug}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Created:</span>
                                    <p className="text-sm font-medium">
                                        {new Date(category.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">Sort Order:</span>
                                    <p className="text-sm font-medium">{category.sort_order}</p>
                                </div>
                                {category.parent && (
                                    <div>
                                        <span className="text-sm text-gray-600">Parent Category:</span>
                                        <Link
                                            href={`/resource-categories/${category.parent.id}`}
                                            className="block text-sm font-medium text-blue-600 hover:text-blue-900"
                                        >
                                            {category.parent.name}
                                        </Link>
                                    </div>
                                )}
                                {stats.children_count > 0 && (
                                    <div>
                                        <span className="text-sm text-gray-600">Subcategories:</span>
                                        <p className="text-sm font-medium">{stats.children_count}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* SEO Information */}
                        {(category.meta_title || category.meta_description || category.meta_keywords) && (
                            <Card className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h3>

                                <div className="space-y-3">
                                    {category.meta_title && (
                                        <div>
                                            <span className="text-sm text-gray-600">Meta Title:</span>
                                            <p className="text-sm font-medium">{category.meta_title}</p>
                                        </div>
                                    )}
                                    {category.meta_description && (
                                        <div>
                                            <span className="text-sm text-gray-600">Meta Description:</span>
                                            <p className="text-sm">{category.meta_description}</p>
                                        </div>
                                    )}
                                    {category.meta_keywords && (
                                        <div>
                                            <span className="text-sm text-gray-600">Meta Keywords:</span>
                                            <p className="text-sm">{category.meta_keywords}</p>
                                        </div>
                                    )}
                                    {stats.avg_seo_score > 0 && (
                                        <div>
                                            <span className="text-sm text-gray-600">Avg SEO Score:</span>
                                            <p className="text-sm font-medium">{stats.avg_seo_score}%</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>

                            <div className="space-y-3">
                                <Link href={`/resources/create?category=${category.id}`}>
                                    <Button className="w-full justify-start">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Resource
                                    </Button>
                                </Link>
                                <Link href={`/resource-categories/create?parent=${category.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <FolderOpen className="w-4 h-4 mr-2" />
                                        Add Subcategory
                                    </Button>
                                </Link>
                                <Link href={`/resources?category=${category.slug}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View All Resources
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
