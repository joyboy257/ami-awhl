import { query } from '@/lib/db';
import type { DataHealthDTO } from '@/lib/types';

export async function getDataHealthData(): Promise<DataHealthDTO> {
    // Get crawl stats with content breakdown
    const crawlStats = await query<{
        total: string;
        crawled: string;
        errors: string;
        content_pages: string;
        image_files: string;
        sitemap_urls: string;
        other_assets: string;
        pending_content: string;
    }>(`
    SELECT 
      count(*)::text as total,
      (SELECT count(DISTINCT page_id) FROM wellness.page_content)::text as crawled,
      count(*) FILTER (WHERE last_http_status >= 400)::text as errors,
      count(*) FILTER (WHERE page_type = 'content')::text as content_pages,
      count(*) FILTER (WHERE page_type = 'image')::text as image_files,
      count(*) FILTER (WHERE page_type = 'sitemap')::text as sitemap_urls,
      count(*) FILTER (WHERE page_type = 'asset')::text as other_assets,
      count(*) FILTER (WHERE page_type = 'content' AND last_crawled_at IS NULL)::text as pending_content
    FROM wellness.pages
  `);

    // Get domain discovery stats
    const domainStatsSet = await query<{
        discovery_state: string;
        count: string;
    }>(`
    SELECT discovery_state, count(*)::text as count
    FROM wellness.domains
    GROUP BY discovery_state
  `);

    // Get Vertical Stats (Clinics and Keywords)
    const verticalStatsRaw = await query<{
        name: string;
        clinics: string;
        keywords: string;
    }>(`
    SELECT 
        v.name,
        count(DISTINCT c.id)::text as clinics,
        count(DISTINCT sq.id)::text as keywords
    FROM wellness.verticals v
    LEFT JOIN wellness.clinics c ON c.vertical_id = v.id
    LEFT JOIN wellness.search_queries sq ON sq.vertical_id = v.id
    GROUP BY v.name
    ORDER BY clinics DESC
  `);

    // Get SERP Stats
    const serpStatsRaw = await query<{
        total_results: string;
        total_snapshots: string;
    }>(`
    SELECT 
        (SELECT count(*) FROM wellness.serp_results)::text as total_results,
        (SELECT count(*) FROM wellness.serp_snapshots)::text as total_snapshots
  `);

    // Get Job Queue Status
    const jobStatsRaw = await query<{
        job_type: string;
        state: string;
        count: string;
    }>(`
    SELECT job_type, state, count(*)::text as count
    FROM wellness.jobs
    GROUP BY job_type, state
    ORDER BY job_type, state
  `);

    // Get recent runs with summary
    const recentRunsRaw = await query<{
        id: string;
        mode: string;
        status: string;
        started_at: Date | null;
        ended_at: Date | null;
        result_summary: any;
    }>(`
    SELECT id, mode, status, started_at, ended_at, result_summary
    FROM wellness.runs
    ORDER BY created_at DESC
    LIMIT 20
  `);

    const stats = crawlStats[0] ?? {
        total: '0', crawled: '0', errors: '0',
        content_pages: '0', image_files: '0', sitemap_urls: '0', other_assets: '0', pending_content: '0'
    };

    const domainCounts = domainStatsSet.reduce(
        (acc, d) => {
            const count = parseInt(d.count, 10);
            switch (d.discovery_state) {
                case 'pending': acc.pending += count; break;
                case 'in_progress': acc.inProgress += count; break;
                case 'done':
                case 'complete': acc.complete += count; break;
            }
            return acc;
        },
        { pending: 0, inProgress: 0, complete: 0 }
    );

    return {
        crawlStats: {
            total: parseInt(stats.total, 10),
            crawled: parseInt(stats.crawled, 10),
            errors: parseInt(stats.errors, 10),
            successRate: parseInt(stats.total, 10) > 0 ? Math.round(((parseInt(stats.crawled, 10) - parseInt(stats.errors, 10)) / parseInt(stats.total, 10)) * 100) : 0,
        },
        contentBreakdown: {
            contentPages: parseInt(stats.content_pages, 10),
            imageFiles: parseInt(stats.image_files, 10),
            sitemapUrls: parseInt(stats.sitemap_urls, 10),
            otherAssets: parseInt(stats.other_assets, 10),
            pendingContent: parseInt(stats.pending_content, 10),
            contentSuccessRate: parseInt(stats.content_pages, 10) > 0 ? Math.round(((parseInt(stats.content_pages, 10) - parseInt(stats.pending_content, 10)) / parseInt(stats.content_pages, 10)) * 100) : 0,
        },
        domainStats: domainCounts,
        verticalStats: verticalStatsRaw.map(v => ({
            name: v.name,
            clinics: parseInt(v.clinics, 10),
            keywords: parseInt(v.keywords, 10)
        })),
        serpStats: {
            totalResults: parseInt(serpStatsRaw[0]?.total_results || '0', 10),
            totalSnapshots: parseInt(serpStatsRaw[0]?.total_snapshots || '0', 10)
        },
        jobStats: jobStatsRaw.map(j => ({
            type: j.job_type,
            state: j.state,
            count: parseInt(j.count, 10)
        })),
        recentRuns: recentRunsRaw.map((r) => ({
            id: r.id,
            mode: r.mode,
            status: r.status,
            startedAt: r.started_at?.toISOString() ?? '',
            endedAt: r.ended_at?.toISOString() ?? null,
            resultSummary: r.result_summary
        })),
        freshness: new Date().toISOString(),
    };
}
