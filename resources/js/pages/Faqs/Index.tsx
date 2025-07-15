import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Filter,
    HelpCircle,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Star,
    StarOff,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    X
} from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'FAQ Management', href: '/faqs' },
];

interface Faq {
    id: number;
    question: string;
    answer: string;
    category_id?: number;
    slug: string;
    status: 'active' | 'inactive';
    is_featured: boolean;
    tags: string | string[]; // Can be JSON string or array
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    helpfulness_ratio: number;
    meta_description: string | null;
    created_at: string;
    updated_at: string;
    category?: FaqCategory; // Laravel relationship
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

interface PaginatedFaqs {
    current_page: number;
    data: Faq[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface FaqCategory {
    id: number;
    name: string;
    color?: string;
}

interface Props {
    faqs: PaginatedFaqs;
    filters: {
        search?: string;
        category?: string;
        status?: string;
        featured?: string;
        sort_by?: string;
        sort_order?: string;
    };
    categories: FaqCategory[];
    statuses: string[];
    stats: {
        total: number;
        active: number;
        inactive: number;
        featured: number;
        total_views: number;
        total_helpful: number;
    };
}

export default function FaqsIndex({ faqs, filters, categories, statuses, stats }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');

    // Helper function to safely parse tags
    const parseTags = (tags: string | string[]): string[] => {
        if (Array.isArray(tags)) {
            return tags;
        }
        if (typeof tags === 'string') {
            try {
                const parsed = JSON.parse(tags);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        }
        return [];
    };

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        if (value === '' || value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        // Reset to first page when filtering
        params.delete('page');

        router.get(`/faqs?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const search = formData.get('search') as string;
        handleFilter('search', search);
    };

    const clearFilters = () => {
        router.get('/faqs');
    };

    const handleSort = (column: string) => {
        const currentSort = filters.sort_by;
        const currentOrder = filters.sort_order || 'desc';

        let newOrder = 'desc';
        if (currentSort === column && currentOrder === 'desc') {
            newOrder = 'asc';
        }

        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', column);
        params.set('sort_order', newOrder);

        router.get(`/faqs?${params.toString()}`);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(faqs.data.map(faq => faq.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        }
    };

    const handleBulkAction = () => {
        if (!bulkAction || selectedIds.length === 0) return;

        router.post('/faqs/bulk-action', {
            action: bulkAction,
            ids: selectedIds,
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setBulkAction('');
            }
        });
    };

    const deleteFaq = (faq: Faq) => {
        router.delete(`/faqs/${faq.id}`, {
            onBefore: () => confirm(`Are you sure you want to delete "${faq.question}"?`),
        });
    };

    const toggleStatus = (faq: Faq) => {
        router.patch(`/faqs/${faq.id}/toggle-status`);
    };

    const toggleFeatured = (faq: Faq) => {
        router.patch(`/faqs/${faq.id}/toggle-featured`);
    };

    const getSortIcon = (column: string) => {
        if (filters.sort_by !== column) return null;
        return filters.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = filters.search || filters.category !== 'all' || filters.status !== 'all' || filters.featured !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ Management" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
                        <p className="text-gray-600">Manage frequently asked questions and their responses</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/faq-categories">
                                <Filter className="h-4 w-4 mr-2" />
                                Categories
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/faqs/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Add FAQ
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.active} active, {stats.inactive} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Featured</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.featured}</div>
                            <p className="text-xs text-muted-foreground">
                                Featured questions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_views.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                All time views
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_helpful.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Positive feedback
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    name="search"
                                    placeholder="Search questions, answers, or categories..."
                                    defaultValue={filters.search || ''}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="flex flex-wrap gap-4">
                            <Select value={filters.category || 'all'} onValueChange={(value) => handleFilter('category', value)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
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

                            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.featured || 'all'} onValueChange={(value) => handleFilter('featured', value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Featured" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">Featured</SelectItem>
                                    <SelectItem value="no">Not Featured</SelectItem>
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <Card>
                        <CardContent className="py-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                    {selectedIds.length} item(s) selected
                                </span>
                                <Select value={bulkAction} onValueChange={setBulkAction}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select action..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="activate">Activate</SelectItem>
                                        <SelectItem value="deactivate">Deactivate</SelectItem>
                                        <SelectItem value="feature">Feature</SelectItem>
                                        <SelectItem value="unfeature">Unfeature</SelectItem>
                                        <SelectItem value="delete">Delete</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                                >
                                    Apply Action
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* FAQs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>FAQs ({faqs.total})</CardTitle>
                        <CardDescription>
                            Showing {faqs.from || 0} to {faqs.to || 0} of {faqs.total} FAQs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === faqs.data.length && faqs.data.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('question')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Question
                                            {getSortIcon('question')}
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Category
                                            {getSortIcon('category')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('view_count')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Views
                                            {getSortIcon('view_count')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Engagement</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Created
                                            {getSortIcon('created_at')}
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-16">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faqs.data.map((faq) => (
                                    <TableRow key={faq.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(faq.id)}
                                                onCheckedChange={(checked) => handleSelectItem(faq.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {faq.question}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {faq.is_featured && (
                                                        <Badge variant="default" className="h-5">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {parseTags(faq.tags).map((tag, index) => (
                                                        <Badge key={index} variant="secondary" className="h-5">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {faq.category?.color && (
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: faq.category.color }}
                                                    />
                                                )}
                                                <Badge variant="outline">
                                                    {faq.category?.name || 'Uncategorized'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={faq.status === 'active' ? 'default' : 'secondary'}
                                            >
                                                {faq.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                                {faq.view_count.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <ThumbsUp className="h-4 w-4" />
                                                            {faq.helpful_count}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Helpful votes: {faq.helpful_count}
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <div className="flex items-center gap-1 text-red-600">
                                                            <ThumbsDown className="h-4 w-4" />
                                                            {faq.not_helpful_count}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Not helpful votes: {faq.not_helpful_count}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(faq.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/faqs/${faq.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/faqs/${faq.id}/edit`}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleStatus(faq)}>
                                                        {faq.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleFeatured(faq)}>
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
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteFaq(faq)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {faqs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {faqs.from || 0} to {faqs.to || 0} of {faqs.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    {faqs.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
