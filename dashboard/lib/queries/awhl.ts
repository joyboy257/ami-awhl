import { query } from '@/lib/db';

// AWHL brand domains
const AWHL_DOMAINS = [
    'haach.com',
    'drhaach.com',
    'natrahea.com.sg',
    'guotaitcm.com',
];

interface BrandStats {
    id: string;
    name: string;
    domain: string;
    vertical_name: string;
    competitor_score: number;
    score_confidence: number;
    page_count: number;
    serp_visibility: number;
    keyword_count: number;
    offer_count: number;
    cta_count: number;
    last_crawled: string | null;
}

interface AWHLSummary {
    totalBrands: number;
    avgScore: number;
    totalPages: number;
    totalKeywords: number;
    scoreTrend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
    id: string;
    brand: string;
    type: 'page_crawled' | 'offer_found' | 'keyword_added' | 'score_updated';
    detail: string;
    timestamp: string;
}

interface CompetitorComparison {
    metric: string;
    awhlAvg: number;
    marketAvg: number;
    difference: number;
}

export interface AWHLDashboardDTO {
    summary: AWHLSummary;
    brands: BrandStats[];
    recentActivity: RecentActivity[];
    vsMarket: CompetitorComparison[];
    freshness: string;
}

export async function getAWHLDashboardData(): Promise<AWHLDashboardDTO> {
    // Get brand stats for each AWHL domain
    const brandStats = await query<{
        id: string;
        name: string;
        domain: string;
        vertical_name: string;
        competitor_score: number;
        score_confidence: number;
        page_count: string;
        serp_visibility: number | null;
        keyword_count: string;
        offer_count: string;
        cta_count: string;
        last_crawled: Date | null;
    }>(`
    SELECT 
      c.id,
      c.name,
      d.domain,
      v.name as vertical_name,
      coalesce(c.competitor_score, 0) as competitor_score,
      coalesce(c.score_confidence, 0) as score_confidence,
      (SELECT count(*) FROM wellness.pages p WHERE p.domain_id = d.id)::text as page_count,
      (c.score_breakdown->'visibility'->>'normalized')::numeric as serp_visibility,
      (SELECT count(*) FROM wellness.clinic_keywords ck WHERE ck.clinic_id = c.id)::text as keyword_count,
      (SELECT count(*) FROM wellness.clinic_offers o WHERE o.clinic_id = c.id)::text as offer_count,
      (SELECT count(*) FROM wellness.clinic_ctas ct WHERE ct.clinic_id = c.id)::text as cta_count,
      (SELECT max(p.last_crawled_at) FROM wellness.pages p WHERE p.domain_id = d.id) as last_crawled
    FROM wellness.domains d
    LEFT JOIN wellness.clinics c ON d.clinic_id = c.id
    LEFT JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE d.domain = ANY($1)
    ORDER BY c.competitor_score DESC NULLS LAST
  `, [AWHL_DOMAINS]);

    const brands: BrandStats[] = brandStats.map(b => ({
        id: b.id || b.domain,
        name: b.name || b.domain.replace(/\.(com|sg).*/, '').replace(/\./g, ' ').toUpperCase(),
        domain: b.domain,
        vertical_name: b.vertical_name || 'Unknown',
        competitor_score: Math.round(b.competitor_score || 0),
        score_confidence: Math.round(b.score_confidence || 0),
        page_count: parseInt(b.page_count, 10) || 0,
        serp_visibility: Math.round(b.serp_visibility || 0),
        keyword_count: parseInt(b.keyword_count, 10) || 0,
        offer_count: parseInt(b.offer_count, 10) || 0,
        cta_count: parseInt(b.cta_count, 10) || 0,
        last_crawled: b.last_crawled?.toISOString() || null,
    }));

    // Calculate summary
    const totalPages = brands.reduce((sum, b) => sum + b.page_count, 0);
    const totalKeywords = brands.reduce((sum, b) => sum + b.keyword_count, 0);
    const avgScore = brands.length > 0
        ? Math.round(brands.reduce((sum, b) => sum + b.competitor_score, 0) / brands.length)
        : 0;

    // Get market averages for comparison
    const marketAvgs = await query<{
        avg_score: number;
        avg_pages: number;
        avg_keywords: number;
    }>(`
    SELECT 
      coalesce(avg(c.competitor_score), 0) as avg_score,
      coalesce(avg(page_counts.cnt), 0) as avg_pages,
      coalesce(avg(kw_counts.cnt), 0) as avg_keywords
    FROM wellness.clinics c
    LEFT JOIN (
      SELECT d.clinic_id, count(p.id) as cnt 
      FROM wellness.domains d 
      JOIN wellness.pages p ON p.domain_id = d.id 
      GROUP BY d.clinic_id
    ) page_counts ON page_counts.clinic_id = c.id
    LEFT JOIN (
      SELECT clinic_id, count(*) as cnt FROM wellness.clinic_keywords GROUP BY clinic_id
    ) kw_counts ON kw_counts.clinic_id = c.id
    WHERE NOT EXISTS (
      SELECT 1 FROM wellness.domains d WHERE d.clinic_id = c.id AND d.domain = ANY($1)
    )
  `, [AWHL_DOMAINS]);

    const market = marketAvgs[0];
    const avgPagesPerBrand = brands.length > 0 ? totalPages / brands.length : 0;
    const avgKeywordsPerBrand = brands.length > 0 ? totalKeywords / brands.length : 0;

    const vsMarket: CompetitorComparison[] = [
        {
            metric: 'Competitor Score',
            awhlAvg: avgScore,
            marketAvg: Math.round(market?.avg_score || 0),
            difference: avgScore - Math.round(market?.avg_score || 0),
        },
        {
            metric: 'Pages Indexed',
            awhlAvg: Math.round(avgPagesPerBrand),
            marketAvg: Math.round(market?.avg_pages || 0),
            difference: Math.round(avgPagesPerBrand) - Math.round(market?.avg_pages || 0),
        },
        {
            metric: 'Keywords Tracked',
            awhlAvg: Math.round(avgKeywordsPerBrand),
            marketAvg: Math.round(market?.avg_keywords || 0),
            difference: Math.round(avgKeywordsPerBrand) - Math.round(market?.avg_keywords || 0),
        },
    ];

    // Get recent activity (simulated from real data patterns)
    const recentCrawls = await query<{
        domain: string;
        last_crawled: Date;
        page_url: string;
    }>(`
    SELECT d.domain, p.last_crawled_at as last_crawled, p.url as page_url
    FROM wellness.pages p
    JOIN wellness.domains d ON p.domain_id = d.id
    WHERE d.domain = ANY($1)
      AND p.last_crawled_at IS NOT NULL
    ORDER BY p.last_crawled_at DESC
    LIMIT 5
  `, [AWHL_DOMAINS]);

    const recentActivity: RecentActivity[] = recentCrawls.map((r, i) => ({
        id: `activity-${i}`,
        brand: r.domain,
        type: 'page_crawled' as const,
        detail: `Crawled ${r.page_url.split('/').pop() || 'page'}`,
        timestamp: r.last_crawled?.toISOString() || new Date().toISOString(),
    }));

    return {
        summary: {
            totalBrands: brands.length,
            avgScore,
            totalPages,
            totalKeywords,
            scoreTrend: 'stable',
        },
        brands,
        recentActivity,
        vsMarket,
        freshness: new Date().toISOString(),
    };
}
