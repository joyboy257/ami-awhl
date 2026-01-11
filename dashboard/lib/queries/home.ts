import { query } from '@/lib/db';
import type { HomeDTO, HomeKPIs, ThreatItem, OpportunityItem } from '@/lib/types';

interface ClinicRow {
    id: string;
    name: string;
    competitor_score: number;
    score_confidence: number;
    scored_at: Date;
    score_breakdown: Record<string, unknown>;
}

interface OfferRow {
    clinic_id: string;
    clinic_name: string;
    price_value: number;
    offer_type: string;
    evidence_snippet: string;
}

interface CTAStats {
    whatsapp_count: string;
    total_clinics: string;
}

export async function getHomeData(filters: {
    vertical?: string;
    region?: string;
    timeframe?: string;
}): Promise<HomeDTO> {
    const verticalFilter = filters.vertical && filters.vertical !== 'all'
        ? `AND v.name ILIKE $1`
        : '';
    const params = verticalFilter ? [filters.vertical] : [];

    // Get basic KPIs
    const kpiResult = await query<{
        total_clinics: string;
        avg_score: number;
        scored_recently: string;
    }>(`
    SELECT 
      count(*)::text as total_clinics,
      coalesce(avg(c.competitor_score), 0) as avg_score,
      count(*) FILTER (WHERE c.scored_at > NOW() - INTERVAL '7 days')::text as scored_recently
    FROM wellness.clinics c
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE 1=1 ${verticalFilter}
  `, params);

    // Get WhatsApp CTA coverage
    const ctaResult = await query<CTAStats>(`
    SELECT 
      count(DISTINCT ct.clinic_id)::text as whatsapp_count,
      (SELECT count(*) FROM wellness.clinics)::text as total_clinics
    FROM wellness.clinic_ctas ct
    WHERE ct.cta_type = 'whatsapp'
  `);

    // Get median trial price
    const priceResult = await query<{ median_price: number }>(`
    SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY price_value) as median_price
    FROM wellness.clinic_offers
    WHERE offer_type = 'trial' AND price_value > 0
  `);

    // Get threats (aggressive pricing moves)
    const threats = await query<OfferRow>(`
    SELECT 
      o.clinic_id,
      c.name as clinic_name,
      o.price_value,
      o.offer_type,
      left(o.evidence_snippet, 100) as evidence_snippet
    FROM wellness.clinic_offers o
    JOIN wellness.clinics c ON o.clinic_id = c.id
    WHERE o.offer_type = 'trial' 
      AND o.price_value < 100
      AND o.extracted_at > NOW() - INTERVAL '7 days'
    ORDER BY o.price_value ASC
    LIMIT 5
  `);

    // Get opportunities (clinics we could outcompete)
    const opportunities = await query<{
        keyword_gap: string;
        keyword_count: string;
    }>(`
    SELECT 
      'High-opportunity keywords with no competition' as keyword_gap,
      count(DISTINCT sq.query_text)::text as keyword_count
    FROM wellness.search_queries sq
    LEFT JOIN wellness.serp_results sr ON sr.snapshot_id IN (
      SELECT ss.id FROM wellness.serp_snapshots ss WHERE ss.query_id = sq.id
    )
    WHERE sq.priority_tier = 'A'
    GROUP BY keyword_gap
    LIMIT 1
  `);

    const kpi = kpiResult[0];
    const ctaStats = ctaResult[0];
    const priceStats = priceResult[0];

    const whatsappPct = ctaStats?.total_clinics && parseInt(ctaStats.total_clinics) > 0
        ? Math.round((parseInt(ctaStats.whatsapp_count) / parseInt(ctaStats.total_clinics)) * 100)
        : 0;

    const kpis: HomeKPIs = {
        visibilityScore: Math.round(kpi?.avg_score ?? 0),
        shareOfVoice: 42, // Placeholder - would need SERP position analysis
        biggestMovers: 3, // Placeholder - would need historical comparison
        medianTrialPrice: priceStats?.median_price ?? null,
        whatsappCTAs: whatsappPct,
    };

    const threatItems: ThreatItem[] = threats.map((t) => ({
        id: t.clinic_id,
        name: t.clinic_name,
        detail: `Launched aggressive trial pricing`,
        value: `$${t.price_value}`,
        severity: t.price_value < 50 ? 'high' : 'medium',
    }));

    const opportunityItems: OpportunityItem[] = opportunities.map((o) => ({
        id: 'keyword-gap',
        title: o.keyword_gap,
        detail: `${o.keyword_count} tier-A keywords where we have no presence but low competition`,
        count: parseInt(o.keyword_count) || 0,
    }));

    return {
        kpis,
        threats: threatItems,
        opportunities: opportunityItems,
        freshness: new Date().toISOString(),
    };
}
