'use client';

import { Suspense } from 'react';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useFilters } from '@/hooks/use-filters';

const verticals = [
    { value: 'all', label: 'All Verticals' },
    { value: 'tcm', label: 'TCM' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'chiropractic', label: 'Chiropractic' },
    { value: 'aesthetics', label: 'Aesthetics' },
];

const regions = [
    { value: 'singapore', label: 'Singapore' },
    { value: 'central', label: 'Central' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
    { value: 'north', label: 'North' },
];

const timeframes = [
    { value: '7d', label: '7 days' },
    { value: '14d', label: '14 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
];

function GlobalFiltersInner() {
    const { filters, setFilter } = useFilters();

    return (
        <div className="flex items-center gap-4">
            {/* Search box placeholder */}
            <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search clinics..."
                    className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Vertical filter */}
            <Select
                value={filters.vertical}
                onValueChange={(value) => setFilter('vertical', value)}
            >
                <SelectTrigger className="h-9 w-[140px]">
                    <SelectValue placeholder="Vertical" />
                </SelectTrigger>
                <SelectContent>
                    {verticals.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                            {v.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Region filter */}
            <Select
                value={filters.region}
                onValueChange={(value) => setFilter('region', value)}
            >
                <SelectTrigger className="h-9 w-[120px]">
                    <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                    {regions.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                            {r.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Timeframe filter */}
            <Select
                value={filters.timeframe}
                onValueChange={(value) => setFilter('timeframe', value)}
            >
                <SelectTrigger className="h-9 w-[100px]">
                    <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                    {timeframes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                            {t.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export function GlobalFilters() {
    return (
        <Suspense fallback={<div className="h-9 w-[500px] animate-pulse rounded-md bg-muted" />}>
            <GlobalFiltersInner />
        </Suspense>
    );
}
