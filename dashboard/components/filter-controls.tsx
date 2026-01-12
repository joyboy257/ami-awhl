'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable filter tabs component
interface FilterTabsProps {
    paramName: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
}

export function FilterTabs({ paramName, options, defaultValue = 'all' }: FilterTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentValue = searchParams.get(paramName) ?? defaultValue;

    const handleClick = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === defaultValue) {
            params.delete(paramName);
        } else {
            params.set(paramName, value);
        }
        // Reset to page 1 when filter changes
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 flex-wrap">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => handleClick(opt.value)}
                    className="focus:outline-none"
                >
                    <Badge
                        variant={currentValue === opt.value ? 'default' : 'outline'}
                        className={cn(
                            'cursor-pointer hover:opacity-80 transition-opacity',
                            currentValue === opt.value && 'ring-2 ring-primary ring-offset-2'
                        )}
                    >
                        {opt.label}
                    </Badge>
                </button>
            ))}
        </div>
    );
}

// Pagination component
interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
}

export function Pagination({ currentPage, totalCount, pageSize }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        return (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                size="sm"
                                className="w-8 px-0"
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// Search input with URL sync
interface SearchInputProps {
    paramName?: string;
    placeholder?: string;
}

export function SearchInput({ paramName = 'q', placeholder = 'Search...' }: SearchInputProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentValue = searchParams.get(paramName) ?? '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(paramName, value);
        } else {
            params.delete(paramName);
        }
        params.delete('page'); // Reset to page 1 when searching
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <input
            type="text"
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
    );
}
