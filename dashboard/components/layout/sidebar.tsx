'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Map,
    Search,
    DollarSign,
    FileText,
    Bell,
    Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/market-map', label: 'Market Map', icon: Map },
    { href: '/keywords', label: 'Keywords', icon: Search },
    { href: '/offers', label: 'Offers & Pricing', icon: DollarSign },
    { href: '/battlecard', label: 'Battlecards', icon: FileText },
    { href: '/change-radar', label: 'Change Radar', icon: Bell },
    { href: '/data-health', label: 'Data Health', icon: Activity },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                <span className="text-xl font-bold text-primary">AMI</span>
                <span className="ml-2 text-sm text-muted-foreground">
                    AWHL Market Intelligence
                </span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
