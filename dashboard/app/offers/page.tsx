import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ChartCard,
    PriceDistributionChart,
    CTAMixChart,
    TrialLeaderboard,
} from '@/components/charts';
import { FilterTabs, Pagination } from '@/components/filter-controls';
import { Tooltip, MetricTooltips } from '@/components/tooltip';
import { getOffersData, type OfferRow } from '@/lib/queries/offers';
import { Download, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OffersPageProps {
    searchParams: Promise<{
        vertical?: string;
        region?: string;
        timeframe?: string;
        offerType?: string;
        sort?: string;
        order?: string;
        page?: string;
    }>;
}

const offerTypeOptions = [
    { value: 'all', label: 'All Services', tooltip: 'Show all offer types' },
    { value: 'trial', label: 'Trial Offers', tooltip: MetricTooltips.offerType },
    { value: 'package', label: 'Packages', tooltip: 'Bundled service packages with discounts' },
    { value: 'promo', label: 'Promotions', tooltip: 'Time-limited promotional offers' },
];

function OfferTypeBadge({ type }: { type: string }) {
    const colors: Record<string, string> = {
        trial: 'bg-success/15 text-success border-success/30',
        package: 'bg-primary/15 text-primary border-primary/30',
        promo: 'bg-warning/15 text-warning border-warning/30',
        seasonal: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    };

    return (
        <Badge variant="outline" className={cn('capitalize', colors[type] ?? 'bg-muted text-muted-foreground')}>
            {type}
        </Badge>
    );
}

function SortableHeader({
    column,
    label,
    currentSort,
    currentOrder,
    tooltip,
}: {
    column: string;
    label: string;
    currentSort: string;
    currentOrder: string;
    tooltip?: string;
}) {
    const isActive = currentSort === column;
    const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : 'asc';

    const Icon = isActive
        ? (currentOrder === 'asc' ? ChevronUp : ChevronDown)
        : ChevronsUpDown;

    const content = (
        <Link
            href={`?sort=${column}&order=${nextOrder}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
            {label}
            <Icon className={cn('h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground/50')} />
        </Link>
    );

    if (tooltip) {
        return (
            <Tooltip content={tooltip} showIcon={false}>
                {content}
            </Tooltip>
        );
    }

    return content;
}

async function OffersContent({ searchParams }: OffersPageProps) {
    const params = await searchParams;
    const currentPage = parseInt(params.page ?? '1', 10);
    const pageSize = 15;

    const data = await getOffersData({
        vertical: params.vertical,
        region: params.region,
        offerType: params.offerType,
        sort: params.sort,
        order: (params.order ?? 'asc') as 'asc' | 'desc',
        page: currentPage,
        pageSize,
    });

    const currentSort = params.sort ?? 'priceValue';
    const currentOrder = params.order ?? 'asc';

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Offers & Pricing Intelligence
                    </h1>
                    <p className="text-muted-foreground">
                        Competitive pricing + offer strategies, evidence-first
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filter tabs */}
            <FilterTabs
                paramName="offerType"
                options={offerTypeOptions}
                defaultValue="all"
            />

            {/* Charts grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Price Distribution */}
                <ChartCard
                    title="Price Distribution by Service"
                    description="Average pricing across all tracked clinics"
                    className="lg:col-span-1"
                >
                    <PriceDistributionChart data={data.priceDistribution} />
                </ChartCard>

                {/* Trial Leaderboard */}
                <ChartCard
                    title="Trial Offers Leaderboard"
                    description="Cheapest trial offers in market"
                    className="lg:col-span-1"
                >
                    <TrialLeaderboard data={data.trialLeaderboard} />
                </ChartCard>

                {/* CTA Mix */}
                <ChartCard
                    title="CTA Mix"
                    description="Distribution of conversion paths"
                    className="lg:col-span-1"
                >
                    <CTAMixChart data={data.ctaMix} />
                </ChartCard>
            </div>

            {/* Offers Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        {data.totalCount} Offers Found
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.offers.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                            <p className="text-muted-foreground">No offers found matching your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-48">
                                                <SortableHeader
                                                    column="clinicName"
                                                    label="Clinic"
                                                    currentSort={currentSort}
                                                    currentOrder={currentOrder}
                                                />
                                            </TableHead>
                                            <TableHead className="w-24">
                                                <SortableHeader
                                                    column="vertical"
                                                    label="Vertical"
                                                    currentSort={currentSort}
                                                    currentOrder={currentOrder}
                                                />
                                            </TableHead>
                                            <TableHead className="w-48">
                                                <SortableHeader
                                                    column="serviceName"
                                                    label="Service"
                                                    currentSort={currentSort}
                                                    currentOrder={currentOrder}
                                                />
                                            </TableHead>
                                            <TableHead className="w-24">
                                                <SortableHeader
                                                    column="offerType"
                                                    label="Type"
                                                    currentSort={currentSort}
                                                    currentOrder={currentOrder}
                                                    tooltip={MetricTooltips.offerType}
                                                />
                                            </TableHead>
                                            <TableHead className="w-28 text-right">
                                                <SortableHeader
                                                    column="priceValue"
                                                    label="Price"
                                                    currentSort={currentSort}
                                                    currentOrder={currentOrder}
                                                    tooltip={MetricTooltips.priceRange}
                                                />
                                            </TableHead>
                                            <TableHead className="w-20">Evidence</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.offers.map((offer) => (
                                            <TableRow key={offer.id}>
                                                <TableCell className="font-medium">{offer.clinicName}</TableCell>
                                                <TableCell className="text-muted-foreground">{offer.vertical}</TableCell>
                                                <TableCell>{offer.serviceName}</TableCell>
                                                <TableCell>
                                                    <OfferTypeBadge type={offer.offerType} />
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums font-semibold">
                                                    {offer.priceDisplay}
                                                </TableCell>
                                                <TableCell>
                                                    {offer.evidenceUrl ? (
                                                        <a
                                                            href={offer.evidenceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline inline-flex items-center gap-1"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {data.totalCount > pageSize && (
                                <div className="mt-4">
                                    <Pagination
                                        totalCount={data.totalCount}
                                        pageSize={pageSize}
                                        currentPage={currentPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function OffersLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-2 h-4 w-96" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
                <Skeleton className="h-80" />
            </div>
            <Skeleton className="h-[400px]" />
        </div>
    );
}

export default function OffersPage(props: OffersPageProps) {
    return (
        <Suspense fallback={<OffersLoading />}>
            <OffersContent {...props} />
        </Suspense>
    );
}
