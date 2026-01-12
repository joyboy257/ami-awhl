import { query } from '@/lib/db';
import type { OffersDTO, PriceDistributionItem, TrialLeaderboardItem, CTAMixItem } from '@/lib/types';

interface QueryParams {
  vertical?: string;
  region?: string;
  offerType?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface OfferRow {
  id: string;
  clinicName: string;
  vertical: string;
  serviceName: string;
  offerType: string;
  priceValue: number;
  priceDisplay: string;
  evidenceUrl: string | null;
}

export async function getOffersData(params: QueryParams): Promise<OffersDTO & { offers: OfferRow[]; totalCount: number }> {
  const {
    vertical,
    offerType,
    sort = 'price_value',
    order = 'asc',
    page = 1,
    pageSize = 20,
  } = params;

  // Build WHERE clause for vertical filter
  const conditions: string[] = ['1=1'];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (vertical && vertical !== 'all') {
    conditions.push(`v.name ILIKE $${paramIndex}`);
    queryParams.push(vertical);
    paramIndex++;
  }

  // Filter by offer type
  if (offerType && offerType !== 'all') {
    conditions.push(`o.offer_type = $${paramIndex}`);
    queryParams.push(offerType);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Column mapping for sorting
  const columnMapping: Record<string, string> = {
    'clinicName': 'c.name',
    'clinic': 'c.name',
    'vertical': 'v.name',
    'serviceName': 'o.service_name',
    'service': 'o.service_name',
    'offerType': 'o.offer_type',
    'type': 'o.offer_type',
    'priceValue': 'o.price_value',
    'price': 'o.price_value',
    'price_value': 'o.price_value',
  };

  const sortColumn = columnMapping[sort] || 'o.price_value';
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

  // Get total count
  const countResult = await query<{ count: string }>(`
        SELECT count(*)::text as count
        FROM wellness.clinic_offers o
        JOIN wellness.clinics c ON o.clinic_id = c.id
        JOIN wellness.verticals v ON c.vertical_id = v.id
        WHERE ${whereClause}
    `, queryParams);

  const totalCount = parseInt(countResult[0]?.count ?? '0', 10);

  // Get paginated offers data
  const offset = (page - 1) * pageSize;
  const offersData = await query<{
    id: string;
    clinic_name: string;
    vertical_name: string;
    service_name: string;
    offer_type: string;
    price_value: number;
    price_currency: string;
    evidence_url: string | null;
  }>(`
        SELECT 
            o.id,
            c.name as clinic_name,
            v.name as vertical_name,
            o.service_name,
            o.offer_type,
            o.price_value,
            COALESCE(o.price_currency, 'SGD') as price_currency,
            o.evidence_url
        FROM wellness.clinic_offers o
        JOIN wellness.clinics c ON o.clinic_id = c.id
        JOIN wellness.verticals v ON c.vertical_id = v.id
        WHERE ${whereClause}
        ORDER BY ${sortColumn} ${sortOrder} NULLS LAST
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, pageSize, offset]);

  const offers: OfferRow[] = offersData.map((o) => ({
    id: o.id,
    clinicName: o.clinic_name ?? 'Unknown',
    vertical: o.vertical_name ?? 'Unknown',
    serviceName: o.service_name ?? 'N/A',
    offerType: o.offer_type ?? 'other',
    priceValue: o.price_value ?? 0,
    priceDisplay: o.price_value ? `${o.price_currency}$${o.price_value}` : 'N/A',
    evidenceUrl: o.evidence_url,
  }));

  // Get price distribution by service (respects offer type filter)
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
    WHERE o.offer_type = 'trial' AND o.price_value > 0 AND ${whereClause.replace(/o\.offer_type = \$\d+/, '1=1')}
    ORDER BY o.price_value ASC
    LIMIT 10
  `, queryParams.filter((_, i) => !(offerType && offerType !== 'all' && i === queryParams.length - 1)));

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
    WHERE ${conditions.filter((_, i) => i === 0 || (vertical && vertical !== 'all' && i === 1)).join(' AND ')}
    GROUP BY ct.cta_type
    ORDER BY cta_count DESC
  `, vertical && vertical !== 'all' ? [vertical] : []);

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
    offers,
    totalCount,
    freshness: new Date().toISOString(),
  };
}
