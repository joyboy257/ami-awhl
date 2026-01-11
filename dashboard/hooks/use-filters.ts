'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { Filters } from '@/lib/types';

const DEFAULT_FILTERS: Filters = {
    vertical: 'all',
    region: 'singapore',
    timeframe: '7d',
};

/**
 * Hook to manage global filters via URL search params
 * Filters persist across navigation and are shareable via URL
 */
export function useFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const filters: Filters = {
        vertical: searchParams.get('vertical') ?? DEFAULT_FILTERS.vertical,
        region: searchParams.get('region') ?? DEFAULT_FILTERS.region,
        timeframe: searchParams.get('timeframe') ?? DEFAULT_FILTERS.timeframe,
    };

    const setFilter = useCallback(
        (key: keyof Filters, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === DEFAULT_FILTERS[key]) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams]
    );

    const setFilters = useCallback(
        (newFilters: Partial<Filters>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(newFilters).forEach(([key, value]) => {
                if (value === DEFAULT_FILTERS[key as keyof Filters]) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams]
    );

    const resetFilters = useCallback(() => {
        router.push(pathname);
    }, [pathname, router]);

    // Build query string for API calls
    const queryString = new URLSearchParams(
        Object.entries(filters).filter(([, v]) => v !== DEFAULT_FILTERS[v as keyof Filters])
    ).toString();

    return {
        filters,
        setFilter,
        setFilters,
        resetFilters,
        queryString,
    };
}
