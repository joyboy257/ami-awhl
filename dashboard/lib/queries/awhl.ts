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
    whatsapp_count: number;
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

interface KeyInsight {
    type: 'success' | 'warning' | 'danger' | 'info';
    icon: string;
    message: string;
    action?: string;
}

interface CompetitorThreat {
    name: string;
    domain: string;
    score: number;
    beatsCount: number;
    keyAdvantage: string;
}

interface QuickWin {
    action: string;
    brand: string;
    impact: string;
    effort: string;
    priority: 'high' | 'medium' | 'low';
}

interface BrandKeyword {
    query: string;
    rank: number;
    intent: string;
    vertical: string;
}

interface TopKeyword {
    query: string;
    vertical: string;
    competingDomains: number;
    awhlRanking: number | null;
    awhlBrand: string | null;
}

interface BrandHealthItem {
    domain: string;
    hasCtas: boolean;
    hasWhatsapp: boolean;
    hasOffers: boolean;
    hasSerpVisibility: boolean;
    hasContent: boolean;
}

export interface AWHLDashboardDTO {
    summary: AWHLSummary;
    brands: BrandStats[];
    recentActivity: RecentActivity[];
    vsMarket: CompetitorComparison[];
    keyInsights: KeyInsight[];
    competitorThreats: CompetitorThreat[];
    quickWins: QuickWin[];
    brandKeywords: Record<string, BrandKeyword[]>;
    topKeywordsByVertical: Record<string, TopKeyword[]>;
    brandHealth: BrandHealthItem[];
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
        whatsapp_count: string;
        last_crawled: Date | null;
    }>(`
    SELECT 
      c.id,
      c.name,
      d.domain,
      v.name as vertical_name,
      coalesce(c.competitor_score, 0) as competitor_score,
      coalesce(c.score_confidence, 0) as score_confidence,
      (SELECT count(*) FROM wellness.pages p WHERE p.domain_id = d.id AND p.page_type = 'content')::text as page_count,
      (c.score_breakdown->'visibility'->>'normalized')::numeric as serp_visibility,
      (SELECT count(*) FROM wellness.clinic_keywords ck WHERE ck.clinic_id = c.id)::text as keyword_count,
      (SELECT count(*) FROM wellness.clinic_offers o WHERE o.clinic_id = c.id)::text as offer_count,
      (SELECT count(*) FROM wellness.clinic_ctas ct WHERE ct.clinic_id = c.id)::text as cta_count,
      (SELECT count(*) FROM wellness.clinic_ctas ct WHERE ct.clinic_id = c.id AND ct.cta_type = 'whatsapp')::text as whatsapp_count,
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
        whatsapp_count: parseInt(b.whatsapp_count, 10) || 0,
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
        avg_whatsapp: number;
        avg_offers: number;
    }>(`
    SELECT 
      coalesce(avg(c.competitor_score), 0) as avg_score,
      coalesce(avg(page_counts.cnt), 0) as avg_pages,
      coalesce(avg(kw_counts.cnt), 0) as avg_keywords,
      coalesce(avg(wa_counts.cnt), 0) as avg_whatsapp,
      coalesce(avg(offer_counts.cnt), 0) as avg_offers
    FROM wellness.clinics c
    LEFT JOIN (
      SELECT d.clinic_id, count(p.id) as cnt 
      FROM wellness.domains d 
      JOIN wellness.pages p ON p.domain_id = d.id AND p.page_type = 'content'
      GROUP BY d.clinic_id
    ) page_counts ON page_counts.clinic_id = c.id
    LEFT JOIN (
      SELECT clinic_id, count(*) as cnt FROM wellness.clinic_keywords GROUP BY clinic_id
    ) kw_counts ON kw_counts.clinic_id = c.id
    LEFT JOIN (
      SELECT clinic_id, count(*) as cnt FROM wellness.clinic_ctas WHERE cta_type = 'whatsapp' GROUP BY clinic_id
    ) wa_counts ON wa_counts.clinic_id = c.id
    LEFT JOIN (
      SELECT clinic_id, count(*) as cnt FROM wellness.clinic_offers GROUP BY clinic_id
    ) offer_counts ON offer_counts.clinic_id = c.id
    WHERE NOT EXISTS (
      SELECT 1 FROM wellness.domains d WHERE d.clinic_id = c.id AND d.domain = ANY($1)
    )
  `, [AWHL_DOMAINS]);

    const market = marketAvgs[0];
    const avgPagesPerBrand = brands.length > 0 ? totalPages / brands.length : 0;
    const avgKeywordsPerBrand = brands.length > 0 ? totalKeywords / brands.length : 0;
    const avgWhatsappPerBrand = brands.length > 0 ? brands.reduce((sum, b) => sum + b.whatsapp_count, 0) / brands.length : 0;
    const avgOffersPerBrand = brands.length > 0 ? brands.reduce((sum, b) => sum + b.offer_count, 0) / brands.length : 0;

    const vsMarket: CompetitorComparison[] = [
        {
            metric: 'Competitor Score',
            awhlAvg: avgScore,
            marketAvg: Math.round(market?.avg_score || 0),
            difference: avgScore - Math.round(market?.avg_score || 0),
        },
        {
            metric: 'Content Pages',
            awhlAvg: Math.round(avgPagesPerBrand),
            marketAvg: Math.round(market?.avg_pages || 0),
            difference: Math.round(avgPagesPerBrand) - Math.round(market?.avg_pages || 0),
        },
        {
            metric: 'WhatsApp CTAs',
            awhlAvg: Math.round(avgWhatsappPerBrand * 10) / 10,
            marketAvg: Math.round((market?.avg_whatsapp || 0) * 10) / 10,
            difference: Math.round((avgWhatsappPerBrand - (market?.avg_whatsapp || 0)) * 10) / 10,
        },
        {
            metric: 'Offers Listed',
            awhlAvg: Math.round(avgOffersPerBrand * 10) / 10,
            marketAvg: Math.round((market?.avg_offers || 0) * 10) / 10,
            difference: Math.round((avgOffersPerBrand - (market?.avg_offers || 0)) * 10) / 10,
        },
    ];

    // Get competitor threats (non-AWHL brands scoring higher)
    const threats = await query<{
        name: string;
        domain: string;
        score: number;
        cta_count: string;
        offer_count: string;
    }>(`
    SELECT 
      c.name,
      d.domain,
      c.competitor_score as score,
      (SELECT count(*) FROM wellness.clinic_ctas ct WHERE ct.clinic_id = c.id)::text as cta_count,
      (SELECT count(*) FROM wellness.clinic_offers o WHERE o.clinic_id = c.id)::text as offer_count
    FROM wellness.clinics c
    LEFT JOIN wellness.domains d ON d.clinic_id = c.id
    WHERE c.competitor_score > $1
      AND d.domain IS NOT NULL
      AND d.domain NOT IN (SELECT unnest($2::text[]))
    ORDER BY c.competitor_score DESC
    LIMIT 5
  `, [brands.length > 0 ? Math.min(...brands.map(b => b.competitor_score)) : 0, AWHL_DOMAINS]);

    const competitorThreats: CompetitorThreat[] = threats.map(t => ({
        name: t.name,
        domain: t.domain,
        score: t.score,
        beatsCount: brands.filter(b => b.competitor_score < t.score).length,
        keyAdvantage: parseInt(t.cta_count) > 3 ? 'Strong CTAs' : parseInt(t.offer_count) > 2 ? 'Many offers' : 'Content depth',
    }));

    // Get SERP rankings for each AWHL brand
    const serpRankings = await query<{
        domain: string;
        query_text: string;
        rank_position: number;
        intent_tag: string;
        vertical: string;
    }>(`
    SELECT 
      d.domain,
      sq.query_text,
      sr.rank_position,
      sq.intent_tag,
      v.name as vertical
    FROM wellness.serp_results sr
    JOIN wellness.serp_snapshots ss ON sr.snapshot_id = ss.id
    JOIN wellness.search_queries sq ON ss.query_id = sq.id
    JOIN wellness.verticals v ON sq.vertical_id = v.id
    JOIN wellness.domains d ON sr.domain_id = d.id
    WHERE d.domain = ANY($1)
    ORDER BY d.domain, sr.rank_position ASC
  `, [AWHL_DOMAINS]);

    const brandKeywords: Record<string, BrandKeyword[]> = {};
    for (const r of serpRankings) {
        if (!brandKeywords[r.domain]) brandKeywords[r.domain] = [];
        brandKeywords[r.domain].push({
            query: r.query_text,
            rank: r.rank_position,
            intent: r.intent_tag || 'unknown',
            vertical: r.vertical,
        });
    }

    // Get top keywords by vertical
    const topKeywords = await query<{
        query_text: string;
        vertical: string;
        competing_domains: string;
        awhl_rank: number | null;
        awhl_domain: string | null;
    }>(`
    WITH keyword_competition AS (
      SELECT 
        sq.query_text,
        v.name as vertical,
        count(DISTINCT sr.domain_id) as competing_domains
      FROM wellness.search_queries sq
      JOIN wellness.verticals v ON sq.vertical_id = v.id
      JOIN wellness.serp_snapshots ss ON ss.query_id = sq.id
      JOIN wellness.serp_results sr ON sr.snapshot_id = ss.id
      GROUP BY sq.query_text, v.name
      HAVING count(DISTINCT sr.domain_id) >= 3
    ),
    awhl_ranks AS (
      SELECT 
        sq.query_text,
        d.domain as awhl_domain,
        sr.rank_position as awhl_rank
      FROM wellness.serp_results sr
      JOIN wellness.serp_snapshots ss ON sr.snapshot_id = ss.id
      JOIN wellness.search_queries sq ON ss.query_id = sq.id
      JOIN wellness.domains d ON sr.domain_id = d.id
      WHERE d.domain = ANY($1)
    )
    SELECT 
      kc.query_text,
      kc.vertical,
      kc.competing_domains::text,
      ar.awhl_rank,
      ar.awhl_domain
    FROM keyword_competition kc
    LEFT JOIN awhl_ranks ar ON ar.query_text = kc.query_text
    ORDER BY kc.competing_domains DESC, kc.vertical
    LIMIT 30
  `, [AWHL_DOMAINS]);

    const topKeywordsByVertical: Record<string, TopKeyword[]> = {};
    for (const tk of topKeywords) {
        if (!topKeywordsByVertical[tk.vertical]) topKeywordsByVertical[tk.vertical] = [];
        if (topKeywordsByVertical[tk.vertical].length < 10) {
            topKeywordsByVertical[tk.vertical].push({
                query: tk.query_text,
                vertical: tk.vertical,
                competingDomains: parseInt(tk.competing_domains, 10),
                awhlRanking: tk.awhl_rank,
                awhlBrand: tk.awhl_domain,
            });
        }
    }

    // Build brand health matrix
    const brandHealth: BrandHealthItem[] = brands.map(b => ({
        domain: b.domain,
        hasCtas: b.cta_count > 0,
        hasWhatsapp: b.whatsapp_count > 0,
        hasOffers: b.offer_count > 0,
        hasSerpVisibility: Object.keys(brandKeywords[b.domain] || {}).length > 0,
        hasContent: b.page_count >= 20,
    }));

    // Generate key insights
    const keyInsights: KeyInsight[] = [];

    const topBrand = brands[0];
    if (topBrand && topBrand.competitor_score >= 40) {
        keyInsights.push({
            type: 'success',
            icon: '🏆',
            message: `${topBrand.name} is your #1 performer, ranking in top 3 of entire market`,
        });
    }

    const brandsWithoutWhatsapp = brands.filter(b => b.whatsapp_count === 0);
    if (brandsWithoutWhatsapp.length > 0) {
        keyInsights.push({
            type: 'warning',
            icon: '📱',
            message: `${brandsWithoutWhatsapp.length} of 4 brands have NO WhatsApp CTA (competitors average ${Math.round((market?.avg_whatsapp || 0) * 100) / 100})`,
            action: `Add WhatsApp to: ${brandsWithoutWhatsapp.map(b => b.name).join(', ')}`,
        });
    }

    const brandsWithoutOffers = brands.filter(b => b.offer_count === 0);
    if (brandsWithoutOffers.length > 0) {
        keyInsights.push({
            type: 'warning',
            icon: '🏷️',
            message: `${brandsWithoutOffers.length} brands have NO offers listed - invisible to deal-seekers`,
            action: `Create offers for: ${brandsWithoutOffers.map(b => b.name).join(', ')}`,
        });
    }

    const highSerpNoCta = brands.filter(b =>
        (brandKeywords[b.domain]?.length || 0) > 50 && b.cta_count === 0
    );
    if (highSerpNoCta.length > 0) {
        keyInsights.push({
            type: 'danger',
            icon: '🔴',
            message: `${highSerpNoCta.map(b => b.name).join(', ')} has high SERP visibility but ZERO conversion CTAs`,
            action: 'Add CTAs immediately to convert traffic',
        });
    }

    const lowScoreBrands = brands.filter(b => b.competitor_score < 20);
    if (lowScoreBrands.length > 0) {
        keyInsights.push({
            type: 'danger',
            icon: '⚠️',
            message: `${lowScoreBrands.map(b => b.name).join(' & ')} need urgent attention (scores below 20)`,
            action: 'Focus on content, CTAs, and offers',
        });
    }

    // Generate quick wins
    const quickWins: QuickWin[] = [];

    for (const b of brandsWithoutWhatsapp.slice(0, 2)) {
        quickWins.push({
            action: 'Add WhatsApp CTA',
            brand: b.name,
            impact: '+15% conversions',
            effort: '1 day',
            priority: 'high',
        });
    }

    for (const b of brandsWithoutOffers.slice(0, 2)) {
        quickWins.push({
            action: 'Add trial offer',
            brand: b.name,
            impact: '+10 score',
            effort: '1 day',
            priority: 'high',
        });
    }

    for (const b of lowScoreBrands) {
        quickWins.push({
            action: 'Create pricing page',
            brand: b.name,
            impact: '+5 score',
            effort: '2 days',
            priority: 'medium',
        });
    }

    // Get recent activity
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
        keyInsights,
        competitorThreats,
        quickWins,
        brandKeywords,
        topKeywordsByVertical,
        brandHealth,
        freshness: new Date().toISOString(),
    };
}
