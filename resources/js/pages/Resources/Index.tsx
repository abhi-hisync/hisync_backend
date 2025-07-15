import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    BookOpen,
    Star,
    TrendingUp,
    Calendar,
    Clock,
    User,
    Tag,
    BarChart3,
    Plus,
    MoreHorizontal,
    Globe,
    FileText,
    Image as ImageIcon,
    Archive,
    CheckCircle,
    XCircle,
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
];

interface Resource {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category_id?: number;
    category?: {
        id: number;
        name: string;
        color?: string;
        slug: string;
    };
    tags: string[];
    status: 'draft' | 'review' | 'published' | 'archived';
    is_published: boolean;
    is_featured: boolean;
    is_trending: boolean;
    featured_image?: string;
    read_time: number;
    view_count: number;
    share_count: number;
    like_count: number;
    seo_score: number;
    published_at?: string;
    created_at: string;
    author: {
        id: number;
        name: string;
        email: string;
    };
}

interface Stats {
    total: number;
    published: number;
    draft: number;
    featured: number;
    trending: number;
    today: number;
    this_month: number;
    total_views: number;
    avg_seo_score: number;
}

interface PageProps extends Record<string, any> {
    resources: {
        data: Resource[];
        links?: any[];
        meta?: any;
    };
    stats?: Stats;
    filters?: {
        statuses?: Array<{ value: string; label: string }>;
        categories?: Array<{ value: string; label: string }>;
        authors?: Array<{ value: string; label: string }>;
    };
    queryParams?: {
        status?: string;
        category?: string;
        author?: string;
        featured?: string;
        trending?: string;
        search?: string;
    };
}

export default function ResourcesIndex() {
    const { resources, stats, filters, queryParams } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(queryParams?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(queryParams?.status || 'all');
    const [selectedCategory, setSelectedCategory] = useState(queryParams?.category || 'all');
    const [selectedAuthor, setSelectedAuthor] = useState(queryParams?.author || 'all');
    const [selectedResources, setSelectedResources] = useState<number[]>([]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedAuthor !== 'all') params.set('author', selectedAuthor);

        router.get(`/resources?${params.toString()}`);
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('all');
        setSelectedCategory('all');
        setSelectedAuthor('all');
        router.get('/resources');
    };

    const handleBulkAction = (action: string) => {
        if (selectedResources.length === 0) return;

        router.post('/resources/bulk-action', {
            action,
            resource_ids: selectedResources
        }, {
            onSuccess: () => {
                setSelectedResources([]);
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedResources(resources.data.map(r => r.id));
        } else {
            setSelectedResources([]);
        }
    };

    const handleSelectResource = (resourceId: number, checked: boolean) => {
        if (checked) {
            setSelectedResources([...selectedResources, resourceId]);
        } else {
            setSelectedResources(selectedResources.filter(id => id !== resourceId));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <FileText className="w-4 h-4" />;
            case 'review':
                return <AlertCircle className="w-4 h-4" />;
            case 'published':
                return <CheckCircle className="w-4 h-4" />;
            case 'archived':
                return <Archive className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'review':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'published':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'archived':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeoScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resources Management" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resources Management</h1>
                        <p className="text-gray-600">Create and manage your knowledge base resources</p>
                    </div>
                    <Link href="/resources/create">
                        <Button className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Resource
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-2xl font-bold text-green-600">{stats?.published || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Globe className="w-4 h-4 text-green-600" />
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
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-purple-600">{stats?.total_views?.toLocaleString() || 0}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg SEO Score</p>
                                <p className={`text-2xl font-bold ${getSeoScoreColor(stats?.avg_seo_score || 0)}`}>
                                    {stats?.avg_seo_score || 0}%
                                </p>
                            </div>
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
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
                                    placeholder="Search resources..."
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
                                        <option value="draft">Draft</option>
                                        <option value="review">In Review</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </>
                                )}
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {filters?.categories?.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                )) || (
                                    <option value="all">All Categories</option>
                                )}
                            </select>

                            <select
                                value={selectedAuthor}
                                onChange={(e) => setSelectedAuthor(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {filters?.authors?.map((author) => (
                                    <option key={author.value} value={author.value}>
                                        {author.label}
                                    </option>
                                )) || (
                                    <option value="all">All Authors</option>
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
                {selectedResources.length > 0 && (
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {selectedResources.length} resource(s) selected
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleBulkAction('publish')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Publish
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
                                    onClick={() => handleBulkAction('trend')}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    Mark Trending
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

                {/* Resources Table */}
                <Card className="flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedResources.length === resources.data.length && resources.data.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Resource
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        SEO Score
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {resources.data && resources.data.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedResources.includes(resource.id)}
                                                onChange={(e) => handleSelectResource(resource.id, e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {resource.featured_image ? (
                                                        <img
                                                            src={`/storage/${resource.featured_image}`}
                                                            alt={resource.title}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                                            {resource.title}
                                                        </h3>
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
                                                    <p className="text-sm text-gray-500 truncate">{resource.excerpt}</p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-xs text-gray-400 flex items-center">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {resource.read_time} min read
                                                        </span>
                                                        {resource.tags.length > 0 && (
                                                            <span className="text-xs text-gray-400 flex items-center">
                                                                <Tag className="w-3 h-3 mr-1" />
                                                                {resource.tags.slice(0, 2).join(', ')}
                                                                {resource.tags.length > 2 && ` +${resource.tags.length - 2}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                                style={resource.category?.color ? {
                                                    borderColor: resource.category.color,
                                                    color: resource.category.color
                                                } : {}}
                                            >
                                                {resource.category?.name || 'No Category'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {resource.author.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={`inline-flex items-center ${getStatusColor(resource.status)}`}>
                                                {getStatusIcon(resource.status)}
                                                <span className="ml-1 capitalize">{resource.status}</span>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    {resource.view_count.toLocaleString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <BarChart3 className="w-3 h-3 mr-1" />
                                                    {resource.share_count} shares
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${getSeoScoreColor(resource.seo_score)}`}>
                                                {resource.seo_score}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div>{new Date(resource.created_at).toLocaleDateString()}</div>
                                                {resource.published_at && (
                                                    <div className="text-xs text-green-600">
                                                        Published: {new Date(resource.published_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Link
                                                    href={`/resources/${resource.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/resources/${resource.id}/edit`}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this resource?')) {
                                                            router.delete(`/resources/${resource.id}`);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
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
                    {resources.data && resources.data.length > 0 && resources.meta && (
                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {resources.meta.from || 1} to {resources.meta.to || resources.data.length} of {resources.meta.total || resources.data.length} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {resources.links && resources.links.map((link, index) => (
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

                    {(!resources.data || resources.data.length === 0) && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                            <p className="text-gray-600 mb-4">Get started by creating your first resource.</p>
                            <Link href="/resources/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Resource
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
