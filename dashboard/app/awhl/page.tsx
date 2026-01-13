import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Zap,
    Target,
    Trophy,
    MessageCircle,
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

function InsightCard({
    type,
    icon,
    message,
    action,
}: {
    type: 'success' | 'warning' | 'danger' | 'info';
    icon: string;
    message: string;
    action?: string;
}) {
    const colors = {
        success: 'bg-success/10 border-success/30 text-success',
        warning: 'bg-warning/10 border-warning/30 text-warning',
        danger: 'bg-danger/10 border-danger/30 text-danger',
        info: 'bg-primary/10 border-primary/30 text-primary',
    };

    return (
        <div className={cn('p-4 rounded-lg border', colors[type])}>
            <div className="flex items-start gap-3">
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                    <p className="font-medium text-foreground">{message}</p>
                    {action && (
                        <p className="text-sm mt-1 opacity-80">→ {action}</p>
                    )}
                </div>
            </div>
        </div>
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

function HealthCheck({ passed }: { passed: boolean }) {
    return passed ? (
        <CheckCircle2 className="h-5 w-5 text-success" />
    ) : (
        <XCircle className="h-5 w-5 text-danger" />
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
                                Strategic intelligence for your 4 brands
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights - Executive Summary */}
            {data.keyInsights.length > 0 && (
                <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Key Insights
                        </CardTitle>
                        <CardDescription>Critical findings requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            {data.keyInsights.map((insight, i) => (
                                <InsightCard key={i} {...insight} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

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
                    title="Content Pages"
                    value={data.summary.totalPages.toLocaleString()}
                    subtitle="indexed across all brands"
                />
                <MetricCard
                    title="Keywords Tracked"
                    value={data.summary.totalKeywords.toLocaleString()}
                    subtitle="across all brands"
                />
            </div>

            {/* Brand Health Matrix */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Brand Health Matrix
                    </CardTitle>
                    <CardDescription>Quick status check across all brands</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Brand</TableHead>
                                    <TableHead className="text-center">CTAs</TableHead>
                                    <TableHead className="text-center">WhatsApp</TableHead>
                                    <TableHead className="text-center">Offers</TableHead>
                                    <TableHead className="text-center">SERP Visible</TableHead>
                                    <TableHead className="text-center">Content</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.brandHealth.map((bh) => (
                                    <TableRow key={bh.domain}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className={cn('h-3 w-3 rounded-full', brandColors[bh.domain] || 'bg-primary')} />
                                                {brandNames[bh.domain] || bh.domain}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center"><HealthCheck passed={bh.hasCtas} /></TableCell>
                                        <TableCell className="text-center"><HealthCheck passed={bh.hasWhatsapp} /></TableCell>
                                        <TableCell className="text-center"><HealthCheck passed={bh.hasOffers} /></TableCell>
                                        <TableCell className="text-center"><HealthCheck passed={bh.hasSerpVisibility} /></TableCell>
                                        <TableCell className="text-center"><HealthCheck passed={bh.hasContent} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

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
                                    <div className="grid grid-cols-4 gap-2 text-center">
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
                                        <div className="rounded-lg bg-muted/50 p-2">
                                            <MessageCircle className="h-4 w-4 mx-auto text-muted-foreground" />
                                            <p className="text-lg font-bold mt-1">{brand.whatsapp_count}</p>
                                            <p className="text-xs text-muted-foreground">WhatsApp</p>
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
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Quick Wins */}
                    {data.quickWins.length > 0 && (
                        <Card className="border-success/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-success">
                                    <Zap className="h-5 w-5" />
                                    Quick Wins
                                </CardTitle>
                                <CardDescription>Immediate actions with high impact</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.quickWins.slice(0, 5).map((win, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'shrink-0',
                                                    win.priority === 'high' && 'bg-danger/15 text-danger border-danger/30',
                                                    win.priority === 'medium' && 'bg-warning/15 text-warning border-warning/30',
                                                    win.priority === 'low' && 'bg-muted'
                                                )}
                                            >
                                                {win.priority}
                                            </Badge>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{win.action}</p>
                                                <p className="text-xs text-muted-foreground">{win.brand}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-medium text-success">{win.impact}</p>
                                                <p className="text-xs text-muted-foreground">{win.effort}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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

                    {/* Competitor Threats */}
                    {data.competitorThreats.length > 0 && (
                        <Card className="border-danger/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-danger">
                                    <AlertTriangle className="h-5 w-5" />
                                    Competitor Threats
                                </CardTitle>
                                <CardDescription>Non-AWHL brands outperforming yours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.competitorThreats.map((threat, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div>
                                                <p className="font-medium text-sm">{threat.name}</p>
                                                <p className="text-xs text-muted-foreground">{threat.keyAdvantage}</p>
                                            </div>
                                            <div className="text-right">
                                                <ScoreBadge score={threat.score} />
                                                <p className="text-xs text-danger mt-1">Beats {threat.beatsCount} brands</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Keywords Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Keywords by Vertical */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Top Keywords by Vertical
                        </CardTitle>
                        <CardDescription>Highest competition keywords in each market</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(data.topKeywordsByVertical).map(([vertical, keywords]) => (
                                <div key={vertical}>
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <Badge variant="outline">{vertical}</Badge>
                                    </h4>
                                    <div className="space-y-2">
                                        {keywords.slice(0, 5).map((kw, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                                                <span className="truncate flex-1">{kw.query}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-muted-foreground">{kw.competingDomains} competitors</span>
                                                    {kw.awhlBrand ? (
                                                        <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-xs">
                                                            #{kw.awhlRanking} {brandNames[kw.awhlBrand] || 'AWHL'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-danger/15 text-danger border-danger/30 text-xs">
                                                            Not ranking
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Brand Keyword Rankings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            AWHL Brand Keywords
                        </CardTitle>
                        <CardDescription>Keywords where your brands are ranking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(data.brandKeywords).map(([domain, keywords]) => (
                                <div key={domain}>
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <div className={cn('h-3 w-3 rounded-full', brandColors[domain] || 'bg-primary')} />
                                        {brandNames[domain] || domain}
                                        <Badge variant="secondary" className="ml-auto">{keywords.length} keywords</Badge>
                                    </h4>
                                    {keywords.length > 0 ? (
                                        <div className="space-y-1">
                                            {keywords.slice(0, 5).map((kw, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                                                    <span className="truncate flex-1 text-xs">{kw.query}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Badge variant="outline" className="text-xs">{kw.vertical}</Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'text-xs',
                                                                kw.rank <= 3 && 'bg-success/15 text-success border-success/30',
                                                                kw.rank > 3 && kw.rank <= 10 && 'bg-warning/15 text-warning border-warning/30',
                                                                kw.rank > 10 && 'bg-muted'
                                                            )}
                                                        >
                                                            #{kw.rank}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                            {keywords.length > 5 && (
                                                <p className="text-xs text-muted-foreground text-center pt-1">
                                                    +{keywords.length - 5} more keywords
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No SERP rankings found</p>
                                    )}
                                </div>
                            ))}
                            {Object.keys(data.brandKeywords).length === 0 && (
                                <p className="text-muted-foreground text-center py-4">No keyword rankings data yet. Run SERP workflows to populate.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.recentActivity.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No recent activity.</p>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-5">
                            {data.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 text-sm p-3 rounded-lg bg-muted/30">
                                    <div className={cn(
                                        'mt-0.5 h-2 w-2 rounded-full shrink-0',
                                        brandColors[activity.brand] || 'bg-primary'
                                    )} />
                                    <div>
                                        <p className="font-medium">{brandNames[activity.brand] || activity.brand}</p>
                                        <p className="text-muted-foreground text-xs">{activity.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
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
            <Skeleton className="h-40" />
            <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <Skeleton className="h-32" />
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
