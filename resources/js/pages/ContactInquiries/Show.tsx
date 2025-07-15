import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    User,
    MessageSquare,
    Edit,
    Save,
    X
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface ContactInquiry {
    id: number;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    service?: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    formatted_created_at: string;
    notes?: string;
    metadata?: {
        ip_address?: string;
        user_agent?: string;
        referer?: string;
        submitted_at?: string;
    };
    assigned_to?: {
        id: number;
        name: string;
        email: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps extends Record<string, any> {
    inquiry: ContactInquiry;
    users: User[];
}

export default function ContactInquiryShow() {
    const { inquiry, users } = usePage<PageProps>().props;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        status: inquiry.status,
        priority: inquiry.priority,
        assigned_to: inquiry.assigned_to?.id || '',
        notes: inquiry.notes || ''
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Contact Inquiries', href: '/contact-inquiries' },
        { title: `Inquiry #${inquiry.id}`, href: `/contact-inquiries/${inquiry.id}` },
    ];

    const handleSave = () => {
        router.put(`/contact-inquiries/${inquiry.id}`, formData, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    };

    const handleCancel = () => {
        setFormData({
            status: inquiry.status,
            priority: inquiry.priority,
            assigned_to: inquiry.assigned_to?.id || '',
            notes: inquiry.notes || ''
        });
        setIsEditing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Contact Inquiry #${inquiry.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={() => router.get('/contact-inquiries')}
                            className="flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Inquiries</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Inquiry #{inquiry.id}
                            </h1>
                            <p className="text-gray-600">Submitted on {inquiry.formatted_created_at}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button onClick={handleSave}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button variant="outline" onClick={handleCancel}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contact Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Name</p>
                                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium text-gray-900">{inquiry.email}</p>
                                    </div>
                                </div>

                                {inquiry.company && (
                                    <div className="flex items-center space-x-3">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Company</p>
                                            <p className="font-medium text-gray-900">{inquiry.company}</p>
                                        </div>
                                    </div>
                                )}

                                {inquiry.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium text-gray-900">{inquiry.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {inquiry.service && (
                                    <div className="flex items-center space-x-3">
                                        <MessageSquare className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Service Interest</p>
                                            <p className="font-medium text-gray-900">{inquiry.service}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Submitted</p>
                                        <p className="font-medium text-gray-900">{inquiry.formatted_created_at}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Message */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                            </div>
                        </Card>

                        {/* Notes */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h2>
                            {isEditing ? (
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Add internal notes..."
                                />
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {inquiry.notes || 'No notes added yet.'}
                                    </p>
                                </div>
                            )}
                        </Card>

                        {/* Metadata */}
                        {inquiry.metadata && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h2>
                                <div className="space-y-2 text-sm">
                                    {inquiry.metadata.ip_address && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IP Address:</span>
                                            <span className="text-gray-900 font-mono">{inquiry.metadata.ip_address}</span>
                                        </div>
                                    )}
                                    {inquiry.metadata.referer && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Referer:</span>
                                            <span className="text-gray-900 truncate ml-2">{inquiry.metadata.referer}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status and Priority */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Priority</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="new">New</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    ) : (
                                        <Badge className={`capitalize ${getStatusColor(inquiry.status)}`}>
                                            {inquiry.status.replace('_', ' ')}
                                        </Badge>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    ) : (
                                        <Badge className={`capitalize ${getPriorityColor(inquiry.priority)}`}>
                                            {inquiry.priority}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Assignment */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h2>
                            {isEditing ? (
                                <select
                                    value={formData.assigned_to}
                                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div>
                                    {inquiry.assigned_to ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{inquiry.assigned_to.name}</p>
                                                <p className="text-sm text-gray-600">{inquiry.assigned_to.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">Not assigned</p>
                                    )}
                                </div>
                            )}
                        </Card>

                        {/* Quick Actions */}
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.open(`mailto:${inquiry.email}`)}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Reply via Email
                                </Button>

                                {inquiry.phone && (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => window.open(`tel:${inquiry.phone}`)}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Call Customer
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
