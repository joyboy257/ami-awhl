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

    const { crawlStats, contentBreakdown, domainStats, verticalStats, serpStats, jobStats, recentRuns } = data;

    return (
        <div className="space-y-6">
            {/* CEO Summary Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Full Database Report</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Executive overview of AMI's digital assets, intelligence coverage, and pipeline performance.
                </p>
            </div>

            {/* Top-level intelligence metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Clinics Tracked"
                    value={verticalStats.reduce((acc, v) => acc + v.clinics, 0).toLocaleString()}
                    subtitle="across all verticals"
                    icon={<Database className="h-5 w-5" />}
                    trend="good"
                />
                <MetricCard
                    title="Search Keywords"
                    value={verticalStats.reduce((acc, v) => acc + v.keywords, 0).toLocaleString()}
                    subtitle="generating intelligence"
                    icon={<Globe className="h-5 w-5" />}
                    trend="good"
                />
                <MetricCard
                    title="SERP Data Points"
                    value={serpStats.totalResults.toLocaleString()}
                    subtitle={`from ${serpStats.totalSnapshots.toLocaleString()} snapshots`}
                    icon={<Activity className="h-5 w-5" />}
                    trend="good"
                />
                <MetricCard
                    title="Discovery Pace"
                    value={`${crawlStats.successRate}%`}
                    subtitle="fetch success rate"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    trend={crawlStats.successRate >= 95 ? 'good' : 'neutral'}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Vertical Coverage */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Market Coverage by Vertical
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vertical</TableHead>
                                    <TableHead className="text-right">Clinics</TableHead>
                                    <TableHead className="text-right">Keywords</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {verticalStats.map((v) => (
                                    <TableRow key={v.name}>
                                        <TableCell className="font-medium">{v.name}</TableCell>
                                        <TableCell className="text-right">{v.clinics.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{v.keywords.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Job Queue Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Workload Queue Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Type</TableHead>
                                    <TableHead>State</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobStats.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                            Idle (All jobs processed)
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobStats.map((j, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="capitalize">{j.type.replace(/_/g, ' ')}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0 leading-tight",
                                                        j.state === 'available' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'
                                                    )}
                                                >
                                                    {j.state}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{j.count.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Run History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Pipeline Activity & Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentRuns.length === 0 ? (
                        <p className="text-muted-foreground">No runs recorded.</p>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[100px]">Run ID</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Outcomes / Summary</TableHead>
                                        <TableHead className="text-right">Finished</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentRuns.map((run) => (
                                        <TableRow key={run.id}>
                                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                                                {run.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px]">{run.mode}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={run.status} />
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {run.resultSummary ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(run.resultSummary).map(([key, value]) => (
                                                            <span key={key} className="text-[11px] bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/10">
                                                                <span className="opacity-70">{key.replace(/_/g, ' ')}:</span> {String(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {run.endedAt
                                                    ? new Date(run.endedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
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

            {/* Hygiene stats - Content and Domains */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Crawler Inventory Hygiene</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Content Coverage</p>
                                <p className="text-xl font-bold">{contentBreakdown.contentSuccessRate}%</p>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-success"
                                        style={{ width: `${contentBreakdown.contentSuccessRate}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Pending Crawl</p>
                                <p className="text-xl font-bold">{contentBreakdown.pendingContent.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground">pages awaiting analysis</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Domain Discovery Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="h-3 flex-1 bg-success/20 rounded-sm overflow-hidden flex">
                                <div className="h-full bg-success" style={{ width: `${(domainStats.complete / (domainStats.pending + domainStats.inProgress + domainStats.complete)) * 100 || 0}%` }} />
                                <div className="h-full bg-primary" style={{ width: `${(domainStats.inProgress / (domainStats.pending + domainStats.inProgress + domainStats.complete)) * 100 || 0}%` }} />
                            </div>
                            <span className="text-xs font-medium">{domainStats.complete} / {domainStats.pending + domainStats.inProgress + domainStats.complete}</span>
                        </div>
                        <div className="mt-3 flex gap-4 text-[10px]">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-success" />
                                <span className="text-muted-foreground">Complete</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-muted-foreground">In Progress</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-muted" />
                                <span className="text-muted-foreground">Pending</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
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
