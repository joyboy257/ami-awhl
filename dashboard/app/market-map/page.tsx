import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CompetitorTable, MarketMapFilters } from '@/components/competitor-table';
import { getMarketMapData } from '@/lib/queries/market-map';

interface MarketMapPageProps {
    searchParams: Promise<{
        vertical?: string;
        region?: string;
        timeframe?: string;
        sort?: string;
        order?: string;
        page?: string;
        topOnly?: string;
        hasTrialOffer?: string;
        hasWhatsApp?: string;
    }>;
}

async function MarketMapContent({ searchParams }: MarketMapPageProps) {
    const params = await searchParams;

    const data = await getMarketMapData({
        vertical: params.vertical,
        region: params.region,
        sort: params.sort,
        order: (params.order ?? 'desc') as 'asc' | 'desc',
        page: parseInt(params.page ?? '1', 10),
        pageSize: 20,
        topOnly: params.topOnly === 'true',
        hasTrialOffer: params.hasTrialOffer === 'true',
        hasWhatsApp: params.hasWhatsApp === 'true',
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Market Map</h1>
                    <p className="text-muted-foreground">
                        Full market snapshot, filterable and sortable
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Suspense fallback={<Skeleton className="h-9 w-full" />}>
                <MarketMapFilters />
            </Suspense>

            {/* Competitor table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        {data.totalCount} Competitors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CompetitorTable
                        data={data.competitors}
                        totalCount={data.totalCount}
                        pageSize={20}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

function MarketMapLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-40" />
            </div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    );
}

export default function MarketMapPage(props: MarketMapPageProps) {
    return (
        <Suspense fallback={<MarketMapLoading />}>
            <MarketMapContent {...props} />
        </Suspense>
    );
}
