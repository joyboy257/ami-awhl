import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getAWHLDashboardData } from '@/lib/queries/awhl';
import { ScoreBadge } from '@/components/score-badge';
import {
    Building2,
    TrendingUp,
    TrendingDown,
    Minus,
    Globe,
    FileText,
    Search,
    ExternalLink,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Force dynamic rendering 
export const dynamic = 'force-dynamic';

// Brand logos/colors mapping
const brandColors: Record<string, string> = {
    'haach.com': 'bg-pink-500',
    'drhaach.com': 'bg-purple-500',
    'natrahea.com.sg': 'bg-green-500',
    'guotaitcm.com': 'bg-amber-600',
};

const brandNames: Record<string, string> = {
    'haach.com': 'HAACH',
    'drhaach.com': 'Dr HAACH',
    'natrahea.com.sg': 'Natrahea',
    'guotaitcm.com': 'Guo Tai TCM',
};

function MetricCard({
    title,
    value,
    subtitle,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    {trend && (
                        <div className={cn(
                            'rounded-full p-2',
                            trend === 'up' && 'bg-success/15 text-success',
                            trend === 'down' && 'bg-danger/15 text-danger',
                            trend === 'stable' && 'bg-muted text-muted-foreground'
                        )}>
                            {trend === 'up' && <TrendingUp className="h-5 w-5" />}
                            {trend === 'down' && <TrendingDown className="h-5 w-5" />}
                            {trend === 'stable' && <Minus className="h-5 w-5" />}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ComparisonRow({
    metric,
    awhlAvg,
    marketAvg,
    difference,
}: {
    metric: string;
    awhlAvg: number;
    marketAvg: number;
    difference: number;
}) {
    const isPositive = difference > 0;
    const isNeutral = difference === 0;

    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <span className="text-sm font-medium">{metric}</span>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="font-bold">{awhlAvg}</p>
                    <p className="text-xs text-muted-foreground">AWHL</p>
                </div>
                <div className="text-right text-muted-foreground">
                    <p>{marketAvg}</p>
                    <p className="text-xs">Market</p>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        'min-w-[60px] justify-center',
                        isPositive && 'bg-success/15 text-success border-success/30',
                        !isPositive && !isNeutral && 'bg-danger/15 text-danger border-danger/30',
                        isNeutral && 'bg-muted'
                    )}
                >
                    {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : !isNeutral && <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {isPositive ? '+' : ''}{difference}
                </Badge>
            </div>
        </div>
    );
}

async function AWHLContent() {
    const data = await getAWHLDashboardData();

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">AWHL Brands</h1>
                            <p className="text-muted-foreground">
                                Performance overview of your 4 brands
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Brands Tracked"
                    value={data.summary.totalBrands}
                    subtitle="of 4 total"
                    trend="stable"
                />
                <MetricCard
                    title="Average Score"
                    value={data.summary.avgScore}
                    subtitle="out of 100"
                    trend={data.summary.scoreTrend}
                />
                <MetricCard
                    title="Total Pages"
                    value={data.summary.totalPages.toLocaleString()}
                    subtitle="indexed across all brands"
                />
                <MetricCard
                    title="Keywords Tracked"
                    value={data.summary.totalKeywords.toLocaleString()}
                    subtitle="across all brands"
                />
            </div>

            {/* Main grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Brand cards */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">Brand Performance</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {data.brands.map((brand) => (
                            <Card key={brand.id} className="overflow-hidden">
                                <div className={cn('h-1', brandColors[brand.domain] || 'bg-primary')} />
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">
                                                {brandNames[brand.domain] || brand.name}
                                            </CardTitle>
                                            <a
                                                href={`https://${brand.domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                                            >
                                                {brand.domain}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <ScoreBadge score={brand.competitor_score} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="rounded-lg bg-muted/50 p-2">
                                            <Globe className="h-4 w-4 mx-auto text-muted-foreground" />
                                            <p className="text-lg font-bold mt-1">{brand.page_count}</p>
                                            <p className="text-xs text-muted-foreground">Pages</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-2">
                                            <Search className="h-4 w-4 mx-auto text-muted-foreground" />
                                            <p className="text-lg font-bold mt-1">{brand.keyword_count}</p>
                                            <p className="text-xs text-muted-foreground">Keywords</p>
                                        </div>
                                        <div className="rounded-lg bg-muted/50 p-2">
                                            <FileText className="h-4 w-4 mx-auto text-muted-foreground" />
                                            <p className="text-lg font-bold mt-1">{brand.offer_count}</p>
                                            <p className="text-xs text-muted-foreground">Offers</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                        <Badge variant="outline">{brand.vertical_name}</Badge>
                                        <Link href={`/battlecard/${brand.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View Details →
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {data.brands.length === 0 && (
                        <Card className="p-8 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">Brands Not Found</h3>
                            <p className="text-muted-foreground text-sm">
                                AWHL domains haven&apos;t been discovered yet. Run the SERP pipeline (W-2) and Site Discovery (W-3) workflows to index your brands.
                            </p>
                        </Card>
                    )}
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* vs Market comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">vs Market Average</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.vsMarket.map((item) => (
                                <ComparisonRow
                                    key={item.metric}
                                    metric={item.metric}
                                    awhlAvg={item.awhlAvg}
                                    marketAvg={item.marketAvg}
                                    difference={item.difference}
                                />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.recentActivity.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No recent activity.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 text-sm">
                                            <div className={cn(
                                                'mt-0.5 h-2 w-2 rounded-full',
                                                brandColors[activity.brand] || 'bg-primary'
                                            )} />
                                            <div>
                                                <p className="font-medium">{brandNames[activity.brand] || activity.brand}</p>
                                                <p className="text-muted-foreground">{activity.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function AWHLLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="mt-2 h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        </div>
    );
}

export default function AWHLPage() {
    return (
        <Suspense fallback={<AWHLLoading />}>
            <AWHLContent />
        </Suspense>
    );
}
