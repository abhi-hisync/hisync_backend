import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, HelpCircle, LayoutGrid, MessageSquare, FileText, FolderOpen, Tags, BarChart3 } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Contact Inquiries',
        href: '/contact-inquiries',
        icon: MessageSquare,
    },
    {
        title: 'FAQ Management',
        href: '/faqs',
        icon: HelpCircle,
    },
    {
        title: 'Resources',
        href: '/resources',
        icon: FileText,
        items: [
            {
                title: 'All Resources',
                href: '/resources',
                icon: FileText,
            },
            {
                title: 'Categories',
                href: '/resource-categories',
                icon: FolderOpen,
            },
            {
                title: 'Create Resource',
                href: '/resources/create',
                icon: FileText,
            },
            {
                title: 'Create Category',
                href: '/resource-categories/create',
                icon: FolderOpen,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
