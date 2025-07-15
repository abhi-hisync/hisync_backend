import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Filter,
    FolderOpen,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
    GripVertical,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'FAQ Management', href: '/faqs' },
    { title: 'Categories', href: '/faq-categories' },
];

interface FaqCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    faqs_count: number;
    active_faqs_count: number;
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

interface PaginatedCategories {
    current_page: number;
    data: FaqCategory[];
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

interface Props {
    categories: PaginatedCategories;
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
    };
    statuses: string[];
    stats: {
        total: number;
        active: number;
        inactive: number;
        total_faqs: number;
    };
}

export default function FaqCategoriesIndex({ categories, filters, statuses, stats }: Props) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);

        if (value === '' || value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        // Reset to first page when filtering
        params.delete('page');

        router.get(`/faq-categories?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const search = formData.get('search') as string;
        handleFilter('search', search);
    };

    const clearFilters = () => {
        router.get('/faq-categories');
    };

    const handleSort = (column: string) => {
        const currentSort = filters.sort_by;
        const currentOrder = filters.sort_order || 'asc';

        let newOrder = 'asc';
        if (currentSort === column && currentOrder === 'asc') {
            newOrder = 'desc';
        }

        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', column);
        params.set('sort_order', newOrder);

        router.get(`/faq-categories?${params.toString()}`);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(categories.data.map(category => category.id));
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

        router.post('/faq-categories/bulk-action', {
            action: bulkAction,
            ids: selectedIds,
        }, {
            onSuccess: () => {
                setSelectedIds([]);
                setBulkAction('');
            }
        });
    };

    const deleteCategory = (category: FaqCategory) => {
        router.delete(`/faq-categories/${category.id}`, {
            onBefore: () => confirm(`Are you sure you want to delete "${category.name}"?`),
        });
    };

    const toggleStatus = (category: FaqCategory) => {
        router.patch(`/faq-categories/${category.id}/toggle-status`);
    };

    const getSortIcon = (column: string) => {
        if (filters.sort_by !== column) return null;
        return filters.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = filters.search || filters.status !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">FAQ Categories</h1>
                        <p className="text-gray-600">Organize your FAQs into categories</p>
                    </div>
                    <Button asChild>
                        <Link href="/faq-categories/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total FAQs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_faqs}</p>
                            </div>
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Filter className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        name="search"
                                        placeholder="Search categories..."
                                        defaultValue={filters.search || ''}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>

                        <div className="flex gap-2">
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

                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {selectedIds.length} item(s) selected
                            </span>
                            <Select value={bulkAction} onValueChange={setBulkAction}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select action..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activate">Activate</SelectItem>
                                    <SelectItem value="deactivate">Deactivate</SelectItem>
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
                    </Card>
                )}

                {/* Categories Table */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Categories ({categories.total})</CardTitle>
                        <CardDescription>
                            Showing {categories.from || 0} to {categories.to || 0} of {categories.total} categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedIds.length === categories.data.length && categories.data.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>
                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Name
                                            {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>FAQs</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-gray-50"
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
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(category.id)}
                                                onCheckedChange={(checked) => handleSelectItem(category.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className="cursor-move p-1"
                                                title="Drag to reorder"
                                            >
                                                <GripVertical className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {category.color && (
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    {category.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={category.status === 'active' ? 'default' : 'secondary'}
                                            >
                                                {category.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <span className="font-medium">{category.faqs_count}</span> total
                                                {category.active_faqs_count !== category.faqs_count && (
                                                    <span className="text-gray-500">
                                                        , {category.active_faqs_count} active
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-500">
                                                {new Date(category.created_at).toLocaleDateString()}
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
                                                        <Link href={`/faq-categories/${category.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/faq-categories/${category.id}/edit`}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleStatus(category)}>
                                                        {category.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => deleteCategory(category)}
                                                        className="text-red-600"
                                                        disabled={category.faqs_count > 0}
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
                        {categories.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-gray-500">
                                    Showing {categories.from || 0} to {categories.to || 0} of {categories.total} results
                                </div>
                                <div className="flex items-center gap-2">
                                    {categories.links.map((link, index) => (
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

                        {categories.data.length === 0 && (
                            <div className="text-center py-12">
                                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                                <p className="text-gray-600 mb-4">Create your first FAQ category to get started.</p>
                                <Button asChild>
                                    <Link href="/faq-categories/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Category
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
