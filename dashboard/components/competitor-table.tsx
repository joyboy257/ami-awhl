'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/data-table';
import { ScoreBadge } from '@/components/score-badge';
import { VisibilityBar } from '@/components/visibility-bar';
import { useFilters } from '@/hooks/use-filters';
import { Download, MessageCircle, Tag } from 'lucide-react';
import type { CompetitorRow } from '@/lib/types';

interface CompetitorTableProps {
    data: CompetitorRow[];
    totalCount: number;
    pageSize: number;
}

export function CompetitorTable({ data, totalCount, pageSize }: CompetitorTableProps) {
    const router = useRouter();

    const columns: Column<CompetitorRow>[] = [
        {
            key: 'name',
            header: 'Competitor',
            sortable: true,
            render: (row) => (
                <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-sm text-muted-foreground">{row.domain}</p>
                </div>
            ),
        },
        {
            key: 'score',
            header: 'Score',
            sortable: true,
            className: 'w-20',
            render: (row) => <ScoreBadge score={row.score} />,
        },
        {
            key: 'serpVisibility',
            header: 'SERP Visibility',
            sortable: true,
            className: 'w-40',
            render: (row) => <VisibilityBar percent={row.serpVisibility} />,
        },
        {
            key: 'pageCount',
            header: 'Pages',
            sortable: true,
            className: 'w-20 text-right',
            render: (row) => <span className="tabular-nums">{row.pageCount}</span>,
        },
        {
            key: 'seoHygiene',
            header: 'SEO Hygiene',
            sortable: true,
            className: 'w-24 text-right',
            render: (row) => <span className="tabular-nums">{row.seoHygiene}%</span>,
        },
        {
            key: 'indicators',
            header: 'Indicators',
            className: 'w-32',
            render: (row) => (
                <div className="flex gap-1">
                    {row.hasTrialOffer && (
                        <Badge variant="outline" className="gap-1 text-warning border-warning/30">
                            <Tag className="h-3 w-3" />
                            Trial
                        </Badge>
                    )}
                    {row.hasWhatsApp && (
                        <Badge variant="outline" className="gap-1 text-success border-success/30">
                            <MessageCircle className="h-3 w-3" />
                            WA
                        </Badge>
                    )}
                </div>
            ),
        },
    ];

    const handleRowClick = (row: CompetitorRow) => {
        router.push(`/battlecard/${row.id}`);
    };

    return (
        <DataTable
            columns={columns}
            data={data}
            keyField="id"
            onRowClick={handleRowClick}
            pageSize={pageSize}
            totalCount={totalCount}
            emptyMessage="No competitors found matching your filters."
        />
    );
}

interface FilterToggleProps {
    label: string;
    param: string;
    active: boolean;
    onClick: () => void;
}

function FilterToggle({ label, active, onClick }: FilterToggleProps) {
    return (
        <Button
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
        >
            {label}
        </Button>
    );
}

export function MarketMapFilters() {
    const { queryString, filters, setFilter } = useFilters();
    const searchParams = new URLSearchParams(queryString);

    const topOnly = searchParams.get('topOnly') === 'true';
    const hasTrialOffer = searchParams.get('hasTrialOffer') === 'true';
    const hasWhatsApp = searchParams.get('hasWhatsApp') === 'true';

    const toggleParam = (param: string, current: boolean) => {
        const params = new URLSearchParams(window.location.search);
        if (current) {
            params.delete(param);
        } else {
            params.set(param, 'true');
        }
        window.history.pushState({}, '', `?${params.toString()}`);
        window.location.reload();
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <FilterToggle
                label="Show Only Top Competitors"
                param="topOnly"
                active={topOnly}
                onClick={() => toggleParam('topOnly', topOnly)}
            />
            <FilterToggle
                label="Has Trial Offer"
                param="hasTrialOffer"
                active={hasTrialOffer}
                onClick={() => toggleParam('hasTrialOffer', hasTrialOffer)}
            />
            <FilterToggle
                label="Has WhatsApp CTA"
                param="hasWhatsApp"
                active={hasWhatsApp}
                onClick={() => toggleParam('hasWhatsApp', hasWhatsApp)}
            />

            <div className="ml-auto">
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    );
}
