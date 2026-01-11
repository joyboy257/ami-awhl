import { Suspense } from 'react';
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
import { getKeywordsData } from '@/lib/queries/keywords';
import { Search, Download, TrendingUp, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeywordsPageProps {
    searchParams: Promise<{
        vertical?: string;
        tier?: string;
        page?: string;
    }>;
}

function TierBadge({ tier }: { tier: string }) {
    const colors: Record<string, string> = {
        A: 'bg-success/15 text-success border-success/30',
        B: 'bg-primary/15 text-primary border-primary/30',
        C: 'bg-muted text-muted-foreground border-muted',
    };

    return (
        <Badge variant="outline" className={cn('font-bold', colors[tier] ?? colors.C)}>
            Tier {tier}
        </Badge>
    );
}

async function KeywordsContent({ searchParams }: KeywordsPageProps) {
    const params = await searchParams;
    const data = await getKeywordsData({
        vertical: params.vertical,
        tier: params.tier,
        page: parseInt(params.page ?? '1', 10),
        pageSize: 20,
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Keywords & SERP</h1>
                    <p className="text-muted-foreground">
                        High-intent keyword performance and SERP snapshots
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                <Badge variant="default">All Tiers</Badge>
                <Badge variant="outline">Tier A</Badge>
                <Badge variant="outline">Tier B</Badge>
                <Badge variant="outline">Tier C</Badge>
            </div>

            {/* Keywords table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        {data.totalCount} Keywords Tracked
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {data.keywords.length === 0 ? (
                        <div className="flex h-32 items-center justify-center">
                            <p className="text-muted-foreground">No keywords found.</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Keyword</TableHead>
                                        <TableHead className="w-24">Tier</TableHead>
                                        <TableHead className="w-32">Vertical</TableHead>
                                        <TableHead className="w-24 text-right">Snapshots</TableHead>
                                        <TableHead className="w-48">Top Rank</TableHead>
                                        <TableHead className="w-32">Last Check</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.keywords.map((kw) => (
                                        <TableRow key={kw.id}>
                                            <TableCell className="font-medium">{kw.query_text}</TableCell>
                                            <TableCell>
                                                <TierBadge tier={kw.priority_tier} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {kw.vertical_name}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {kw.snapshot_count}
                                            </TableCell>
                                            <TableCell>
                                                {kw.top_clinic_name ? (
                                                    <div className="flex items-center gap-2">
                                                        {kw.top_clinic_rank === 1 && (
                                                            <Crown className="h-4 w-4 text-warning" />
                                                        )}
                                                        <span className="truncate max-w-[120px]">
                                                            {kw.top_clinic_name}
                                                        </span>
                                                        <span className="text-muted-foreground text-sm">
                                                            #{kw.top_clinic_rank}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {kw.last_snapshot_at
                                                    ? new Date(kw.last_snapshot_at).toLocaleDateString()
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

function KeywordsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-[500px]" />
        </div>
    );
}

export default function KeywordsPage(props: KeywordsPageProps) {
    return (
        <Suspense fallback={<KeywordsLoading />}>
            <KeywordsContent {...props} />
        </Suspense>
    );
}
