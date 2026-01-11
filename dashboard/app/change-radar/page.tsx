import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventTimeline, AlertRules } from '@/components/event-timeline';
import { getChangeRadarData } from '@/lib/queries/change-radar';
import { Bell, Zap } from 'lucide-react';

interface ChangeRadarPageProps {
    searchParams: Promise<{
        vertical?: string;
        region?: string;
        timeframe?: string;
        eventType?: string;
    }>;
}

async function ChangeRadarContent({ searchParams }: ChangeRadarPageProps) {
    const params = await searchParams;
    const data = await getChangeRadarData({
        vertical: params.vertical,
        timeframe: params.timeframe,
        eventType: params.eventType,
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Change Radar</h1>
                <p className="text-muted-foreground">
                    What changed this week that needs action?
                </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                <Badge variant="default">All Events</Badge>
                <Badge variant="outline">SERP Movement</Badge>
                <Badge variant="outline">New Offers</Badge>
                <Badge variant="outline">CTA Changes</Badge>
            </div>

            {/* Main grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Event Timeline */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5" />
                            Recent Events ({data.events.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EventTimeline events={data.events} />
                    </CardContent>
                </Card>

                {/* Alert Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Alert Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AlertRules rules={data.alertRules} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ChangeRadarLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="lg:col-span-2 h-[500px]" />
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    );
}

export default function ChangeRadarPage(props: ChangeRadarPageProps) {
    return (
        <Suspense fallback={<ChangeRadarLoading />}>
            <ChangeRadarContent {...props} />
        </Suspense>
    );
}
