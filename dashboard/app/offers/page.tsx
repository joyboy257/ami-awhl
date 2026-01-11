import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChartCard,
    PriceDistributionChart,
    CTAMixChart,
    TrialLeaderboard,
} from '@/components/charts';
import { getOffersData } from '@/lib/queries/offers';
import { Download } from 'lucide-react';

interface OffersPageProps {
    searchParams: Promise<{
        vertical?: string;
        region?: string;
        timeframe?: string;
    }>;
}

async function OffersContent({ searchParams }: OffersPageProps) {
    const params = await searchParams;
    const data = await getOffersData({
        vertical: params.vertical,
        region: params.region,
    });

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
            <div className="flex gap-2">
                <Badge variant="default">All Services</Badge>
                <Badge variant="outline">Trial Offers</Badge>
                <Badge variant="outline">Packages</Badge>
                <Badge variant="outline">Singapore</Badge>
            </div>

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
