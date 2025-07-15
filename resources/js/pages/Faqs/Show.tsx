import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Eye,
    Star,
    StarOff,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    User
} from 'lucide-react';

interface Faq {
    id: number;
    question: string;
    answer: string;
    category: string;
    slug: string;
    status: 'active' | 'inactive';
    is_featured: boolean;
    tags: string[];
    meta_description: string | null;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    helpfulness_ratio: number;
    created_at: string;
    updated_at: string;
    creator?: {
        id: number;
        name: string;
        email: string;
    };
    updater?: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    faq: Faq;
}

export default function FaqShow({ faq }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'FAQ Management', href: '/faqs' },
        { title: faq.question, href: `/faqs/${faq.id}` },
    ];

    const deleteFaq = () => {
        if (confirm(`Are you sure you want to delete "${faq.question}"?`)) {
            router.delete(`/faqs/${faq.id}`);
        }
    };

    const toggleStatus = () => {
        router.patch(`/faqs/${faq.id}/toggle-status`);
    };

    const toggleFeatured = () => {
        router.patch(`/faqs/${faq.id}/toggle-featured`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`FAQ - ${faq.question}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">FAQ Details</h1>
                        <p className="text-gray-600">View and manage FAQ information</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.get('/faqs')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to FAQs
                        </Button>
                        <Button asChild>
                            <Link href={`/faqs/${faq.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* FAQ Content */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl">{faq.question}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={faq.status === 'active' ? 'default' : 'secondary'}
                                            >
                                                {faq.status}
                                            </Badge>
                                            {faq.is_featured && (
                                                <Badge variant="default" className="bg-yellow-500">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Featured
                                                </Badge>
                                            )}
                                            <Badge variant="outline">
                                                {faq.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Answer</h3>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>

                                {faq.meta_description && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Meta Description</h3>
                                        <p className="text-gray-600 text-sm italic">
                                            {faq.meta_description}
                                        </p>
                                    </div>
                                )}

                                {faq.tags.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {faq.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Engagement Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Engagement Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <Eye className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {faq.view_count.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Views</div>
                                    </div>

                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <ThumbsUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {faq.helpful_count}
                                        </div>
                                        <div className="text-sm text-gray-600">Helpful Votes</div>
                                    </div>

                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <ThumbsDown className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-red-600">
                                            {faq.not_helpful_count}
                                        </div>
                                        <div className="text-sm text-gray-600">Not Helpful Votes</div>
                                    </div>
                                </div>

                                {(faq.helpful_count + faq.not_helpful_count) > 0 && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                Helpfulness Ratio
                                            </span>
                                            <span className="text-lg font-bold text-gray-900">
                                                {(faq.helpfulness_ratio * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${faq.helpfulness_ratio * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={toggleStatus}
                                >
                                    {faq.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={toggleFeatured}
                                >
                                    {faq.is_featured ? (
                                        <>
                                            <StarOff className="h-4 w-4 mr-2" />
                                            Unfeature
                                        </>
                                    ) : (
                                        <>
                                            <Star className="h-4 w-4 mr-2" />
                                            Feature
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={deleteFaq}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete FAQ
                                </Button>
                            </CardContent>
                        </Card>

                        {/* FAQ Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>FAQ Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Slug</div>
                                    <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                                        {faq.slug}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-700 mb-1">Category</div>
                                    <Badge variant="outline">{faq.category}</Badge>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <div className="font-medium text-gray-700">Created</div>
                                        <div className="text-gray-600">
                                            {new Date(faq.created_at).toLocaleDateString()} at{' '}
                                            {new Date(faq.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <div className="font-medium text-gray-700">Last Updated</div>
                                        <div className="text-gray-600">
                                            {new Date(faq.updated_at).toLocaleDateString()} at{' '}
                                            {new Date(faq.updated_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                {faq.creator && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-700">Created by</div>
                                            <div className="text-gray-600">{faq.creator.name}</div>
                                        </div>
                                    </div>
                                )}

                                {faq.updater && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-gray-700">Last updated by</div>
                                            <div className="text-gray-600">{faq.updater.name}</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Public Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Public Preview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">
                                    View how this FAQ appears to users on the frontend.
                                </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <a
                                        href={`/api/v1/faqs/${faq.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Public FAQ
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
