import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit,
    Globe,
    Star,
    TrendingUp,
    Calendar,
    Clock,
    User,
    Eye,
    BarChart3,
    Tag,
    Image as ImageIcon
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
    content: string;
    category: string;
    tags: string[];
    status: 'draft' | 'review' | 'published' | 'archived';
    is_published: boolean;
    is_featured: boolean;
    is_trending: boolean;
    featured_image?: string;
    gallery_images: string[] | null;
    read_time: number;
    view_count: number;
    share_count: number;
    like_count: number;
    seo_score: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    published_at?: string;
    created_at: string;
    updated_at: string;
    author: {
        id: number;
        name: string;
        email: string;
    };
}

interface RelatedResource {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string;
    published_at: string;
    view_count: number;
}

interface PageProps extends Record<string, any> {
    resource: Resource;
    relatedResources: RelatedResource[];
}

export default function ShowResource({ resource, relatedResources }: PageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Resources', href: '/resources' },
        { title: resource.title, href: `/resources/${resource.id}` },
    ];

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
            <Head title={`${resource.title} - Resource Details`} />

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
                            <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
                            <p className="text-gray-600">Resource Details</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={`/resources/${resource.id}/edit`}>
                            <Button>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Resource
                            </Button>
                        </Link>
                        {resource.is_published && (
                            <Button variant="outline" asChild>
                                <a href={`/resources/${resource.slug}`} target="_blank" rel="noopener noreferrer">
                                    <Globe className="w-4 h-4 mr-2" />
                                    View Live
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resource Info */}
                        <Card className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <Badge className={getStatusColor(resource.status)}>
                                        {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                                    </Badge>
                                    <Badge variant="outline">{resource.category}</Badge>
                                    {resource.is_featured && (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                            <Star className="w-3 h-3 mr-1" />
                                            Featured
                                        </Badge>
                                    )}
                                    {resource.is_trending && (
                                        <Badge className="bg-orange-100 text-orange-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Trending
                                        </Badge>
                                    )}
                                </div>
                                <div className={`text-sm font-medium ${getSeoScoreColor(resource.seo_score)}`}>
                                    SEO Score: {resource.seo_score}%
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h2>
                            <p className="text-gray-600 mb-4">{resource.excerpt}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <Eye className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.view_count.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500">Views</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <BarChart3 className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.share_count}</div>
                                    <div className="text-xs text-gray-500">Shares</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <Clock className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.read_time}</div>
                                    <div className="text-xs text-gray-500">Min Read</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-1">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">{resource.like_count}</div>
                                    <div className="text-xs text-gray-500">Likes</div>
                                </div>
                            </div>

                            {resource.tags.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    <span>Author: {resource.author.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>Created: {new Date(resource.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>Updated: {new Date(resource.updated_at).toLocaleDateString()}</span>
                                </div>
                                {resource.published_at && (
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 mr-2" />
                                        <span>Published: {new Date(resource.published_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Featured Image */}
                        {resource.featured_image && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
                                <div className="relative">
                                    <img
                                        src={`/storage/${resource.featured_image}`}
                                        alt={resource.title}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            </Card>
                        )}

                        {/* Content Preview */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: resource.content.substring(0, 1000) + (resource.content.length > 1000 ? '...' : '') }}
                            />
                            {resource.content.length > 1000 && (
                                <p className="text-sm text-gray-500 mt-4">
                                    Content truncated. Full content visible on live page.
                                </p>
                            )}
                        </Card>

                        {/* Gallery Images */}
                        {resource.gallery_images && resource.gallery_images.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery Images</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {resource.gallery_images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`Gallery image ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* SEO Information */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {resource.meta_title || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {resource.meta_description || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {resource.meta_keywords || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SEO Score</label>
                                    <div className={`text-lg font-semibold ${getSeoScoreColor(resource.seo_score)}`}>
                                        {resource.seo_score}%
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Resource Details */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Details</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Slug:</span>
                                    <span className="text-sm font-mono text-gray-900">{resource.slug}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Category:</span>
                                    <Badge variant="outline" className="text-xs">{resource.category}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Read Time:</span>
                                    <span className="text-sm text-gray-900">{resource.read_time} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Word Count:</span>
                                    <span className="text-sm text-gray-900">
                                        {resource.content.split(' ').filter(word => word).length}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Related Resources */}
                        {relatedResources.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Resources</h3>
                                <div className="space-y-3">
                                    {relatedResources.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/resources/${related.id}`}
                                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-start space-x-3">
                                                {related.featured_image ? (
                                                    <img
                                                        src={`/storage/${related.featured_image}`}
                                                        alt={related.title}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {related.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {related.excerpt}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-400 mt-1">
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        {related.view_count.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
