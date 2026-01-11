import { query } from '@/lib/db';
import type { OffersDTO, PriceDistributionItem, TrialLeaderboardItem, CTAMixItem } from '@/lib/types';

interface QueryParams {
    vertical?: string;
    region?: string;
}

export async function getOffersData(params: QueryParams): Promise<OffersDTO> {
    const { vertical } = params;

    // Build WHERE clause for vertical filter
    const conditions: string[] = ['1=1'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (vertical && vertical !== 'all') {
        conditions.push(`v.name ILIKE $${paramIndex}`);
        queryParams.push(vertical);
        paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get price distribution by service
    const priceDistribution = await query<{
        service_name: string;
        avg_price: number;
        offer_count: string;
    }>(`
    SELECT 
      o.service_name,
      avg(o.price_value)::numeric as avg_price,
      count(*)::text as offer_count
    FROM wellness.clinic_offers o
    JOIN wellness.clinics c ON o.clinic_id = c.id
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE o.price_value > 0 AND ${whereClause}
    GROUP BY o.service_name
    ORDER BY avg_price DESC
    LIMIT 10
  `, queryParams);

    // Get trial leaderboard (cheapest trial offers)
    const trialLeaderboard = await query<{
        clinic_name: string;
        price_value: number;
    }>(`
    SELECT 
      c.name as clinic_name,
      o.price_value
    FROM wellness.clinic_offers o
    JOIN wellness.clinics c ON o.clinic_id = c.id
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE o.offer_type = 'trial' AND o.price_value > 0 AND ${whereClause}
    ORDER BY o.price_value ASC
    LIMIT 10
  `, queryParams);

    // Get CTA mix distribution
    const ctaMix = await query<{
        cta_type: string;
        cta_count: string;
    }>(`
    SELECT 
      ct.cta_type,
      count(*)::text as cta_count
    FROM wellness.clinic_ctas ct
    JOIN wellness.clinics c ON ct.clinic_id = c.id
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE ${whereClause}
    GROUP BY ct.cta_type
    ORDER BY cta_count DESC
  `, queryParams);

    const priceItems: PriceDistributionItem[] = priceDistribution.map((p) => ({
        service: p.service_name,
        avgPrice: Math.round(p.avg_price ?? 0),
        count: parseInt(p.offer_count, 10) || 0,
    }));

    const trialItems: TrialLeaderboardItem[] = trialLeaderboard.map((t) => ({
        name: t.clinic_name ?? 'Unknown',
        price: t.price_value ?? 0,
    }));

    const ctaItems: CTAMixItem[] = ctaMix.map((c) => ({
        type: c.cta_type ?? 'Unknown',
        count: parseInt(c.cta_count, 10) || 0,
    }));

    return {
        priceDistribution: priceItems,
        trialLeaderboard: trialItems,
        ctaMix: ctaItems,
        freshness: new Date().toISOString(),
    };
}
