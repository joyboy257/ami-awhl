import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getDataHealthData } from '@/lib/queries/data-health';
import {
    Activity,
    Database,
    Globe,
    CheckCircle2,
    XCircle,
    Clock,
    Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

function MetricCard({
    title,
    value,
    subtitle,
    icon,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'good' | 'bad' | 'neutral';
}) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            'rounded-lg p-3',
                            trend === 'good' && 'bg-success/15 text-success',
                            trend === 'bad' && 'bg-danger/15 text-danger',
                            trend === 'neutral' && 'bg-muted text-muted-foreground'
                        )}
                    >
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; icon: React.ReactNode }> = {
        completed: {
            color: 'bg-success/15 text-success border-success/30',
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
        running: {
            color: 'bg-primary/15 text-primary border-primary/30',
            icon: <Play className="h-3 w-3" />,
        },
        pending: {
            color: 'bg-warning/15 text-warning border-warning/30',
            icon: <Clock className="h-3 w-3" />,
        },
        failed: {
            color: 'bg-danger/15 text-danger border-danger/30',
            icon: <XCircle className="h-3 w-3" />,
        },
    };

    const { color, icon } = config[status] ?? config.pending;

    return (
        <Badge variant="outline" className={cn('gap-1', color)}>
            {icon}
            {status}
        </Badge>
    );
}

async function DataHealthContent() {
    const data = await getDataHealthData();

    const { crawlStats, domainStats, recentRuns } = data;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Data Health</h1>
                <p className="text-muted-foreground">
                    Pipeline status and data quality metrics
                </p>
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Pages"
                    value={crawlStats.total.toLocaleString()}
                    subtitle="indexed"
                    icon={<Database className="h-5 w-5" />}
                    trend="neutral"
                />
                <MetricCard
                    title="Crawl Success Rate"
                    value={`${crawlStats.successRate}%`}
                    subtitle={`${crawlStats.crawled} crawled`}
                    icon={<Activity className="h-5 w-5" />}
                    trend={crawlStats.successRate >= 80 ? 'good' : 'bad'}
                />
                <MetricCard
                    title="Crawl Errors"
                    value={crawlStats.errors}
                    subtitle="pages with errors"
                    icon={<XCircle className="h-5 w-5" />}
                    trend={crawlStats.errors === 0 ? 'good' : 'bad'}
                />
                <MetricCard
                    title="Domains Complete"
                    value={domainStats.complete}
                    subtitle={`of ${domainStats.pending + domainStats.inProgress + domainStats.complete}`}
                    icon={<Globe className="h-5 w-5" />}
                    trend={domainStats.pending === 0 ? 'good' : 'neutral'}
                />
            </div>

            {/* Domain discovery breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Domain Discovery Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1 rounded-lg bg-muted p-4 text-center">
                            <p className="text-2xl font-bold">{domainStats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-primary/10 p-4 text-center">
                            <p className="text-2xl font-bold text-primary">
                                {domainStats.inProgress}
                            </p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div className="flex-1 rounded-lg bg-success/10 p-4 text-center">
                            <p className="text-2xl font-bold text-success">
                                {domainStats.complete}
                            </p>
                            <p className="text-sm text-muted-foreground">Complete</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent runs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Pipeline Runs</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentRuns.length === 0 ? (
                        <p className="text-muted-foreground">No runs recorded.</p>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Run ID</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Started</TableHead>
                                        <TableHead>Ended</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRuns.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-mono text-sm">
                                                {run.id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{run.mode}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={run.status} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {run.startedAt
                                                    ? new Date(run.startedAt).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {run.endedAt
                                                    ? new Date(run.endedAt).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function DataHealthLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28" />
                ))}
            </div>
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
        </div>
    );
}

export default function DataHealthPage() {
    return (
        <Suspense fallback={<DataHealthLoading />}>
            <DataHealthContent />
        </Suspense>
    );
}
