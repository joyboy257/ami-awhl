import { query } from '@/lib/db';
import type { DataHealthDTO } from '@/lib/types';

export async function getDataHealthData(): Promise<DataHealthDTO> {
    // Get crawl stats
    const crawlStats = await query<{
        total: string;
        crawled: string;
        errors: string;
    }>(`
    SELECT 
      count(*)::text as total,
      count(*) FILTER (WHERE last_crawled_at IS NOT NULL)::text as crawled,
      count(*) FILTER (WHERE last_http_status >= 400)::text as errors
    FROM wellness.pages
  `);

    // Get domain discovery stats
    const domainStats = await query<{
        discovery_state: string;
        count: string;
    }>(`
    SELECT discovery_state, count(*)::text as count
    FROM wellness.domains
    GROUP BY discovery_state
  `);

    // Get recent runs
    const recentRuns = await query<{
        id: string;
        mode: string;
        status: string;
        started_at: Date | null;
        ended_at: Date | null;
    }>(`
    SELECT id, mode, status, started_at, ended_at
    FROM wellness.runs
    ORDER BY created_at DESC
    LIMIT 10
  `);

    const stats = crawlStats[0] ?? { total: '0', crawled: '0', errors: '0' };
    const total = parseInt(stats.total, 10);
    const crawled = parseInt(stats.crawled, 10);
    const errors = parseInt(stats.errors, 10);

    const domainCounts = domainStats.reduce(
        (acc, d) => {
            const count = parseInt(d.count, 10);
            switch (d.discovery_state) {
                case 'pending':
                    acc.pending += count;
                    break;
                case 'in_progress':
                    acc.inProgress += count;
                    break;
                case 'done':
                case 'complete':
                    acc.complete += count;
                    break;
            }
            return acc;
        },
        { pending: 0, inProgress: 0, complete: 0 }
    );

    return {
        crawlStats: {
            total,
            crawled,
            errors,
            successRate: total > 0 ? Math.round(((crawled - errors) / total) * 100) : 0,
        },
        domainStats: domainCounts,
        recentRuns: recentRuns.map((r) => ({
            id: r.id,
            mode: r.mode,
            status: r.status,
            startedAt: r.started_at?.toISOString() ?? '',
            endedAt: r.ended_at?.toISOString() ?? null,
        })),
        freshness: new Date().toISOString(),
    };
}
