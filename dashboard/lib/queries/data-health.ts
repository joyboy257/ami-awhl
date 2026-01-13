import { query } from '@/lib/db';
import type { DataHealthDTO } from '@/lib/types';

export async function getDataHealthData(): Promise<DataHealthDTO> {
    // Get crawl stats with content breakdown using page_type column
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
      count(*) FILTER (WHERE last_http_status >= 400)::text as errors,
      -- Content breakdown using page_type column
      count(*) FILTER (WHERE page_type = 'content')::text as content_pages,
      count(*) FILTER (WHERE page_type = 'image')::text as image_files,
      count(*) FILTER (WHERE page_type = 'sitemap')::text as sitemap_urls,
      count(*) FILTER (WHERE page_type = 'asset')::text as other_assets,
      -- Pending content pages (not yet crawled, content type only)
      count(*) FILTER (
        WHERE page_type = 'content' AND last_crawled_at IS NULL
      )::text as pending_content
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

    const stats = crawlStats[0] ?? {
        total: '0', crawled: '0', errors: '0',
        content_pages: '0', image_files: '0', sitemap_urls: '0', other_assets: '0', pending_content: '0'
    };
    const total = parseInt(stats.total, 10);
    const crawled = parseInt(stats.crawled, 10);
    const errors = parseInt(stats.errors, 10);
    const contentPages = parseInt(stats.content_pages, 10);
    const imageFiles = parseInt(stats.image_files, 10);
    const sitemapUrls = parseInt(stats.sitemap_urls, 10);
    const otherAssets = parseInt(stats.other_assets, 10);
    const pendingContent = parseInt(stats.pending_content, 10);

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

    // Calculate success rate based on content pages only
    const contentCrawled = contentPages - pendingContent;
    const contentSuccessRate = contentPages > 0 ? Math.round((contentCrawled / contentPages) * 100) : 0;

    return {
        crawlStats: {
            total,
            crawled,
            errors,
            successRate: total > 0 ? Math.round(((crawled - errors) / total) * 100) : 0,
        },
        contentBreakdown: {
            contentPages,
            imageFiles,
            sitemapUrls,
            otherAssets,
            pendingContent,
            contentSuccessRate,
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
