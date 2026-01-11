import { query } from '@/lib/db';
import type { MarketMapDTO, CompetitorRow } from '@/lib/types';

interface QueryParams {
    vertical?: string;
    region?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
    hasTrialOffer?: boolean;
    hasWhatsApp?: boolean;
    topOnly?: boolean;
}

interface DBCompetitor {
    id: string;
    name: string;
    domain: string;
    competitor_score: number;
    score_confidence: number;
    page_count: string;
    serp_visibility: number | null;
    seo_hygiene: number | null;
    has_trial: boolean;
    has_whatsapp: boolean;
}

export async function getMarketMapData(params: QueryParams): Promise<MarketMapDTO> {
    const {
        vertical,
        sort = 'competitor_score',
        order = 'desc',
        page = 1,
        pageSize = 20,
        hasTrialOffer,
        hasWhatsApp,
        topOnly,
    } = params;

    // Build WHERE clauses
    const conditions: string[] = ['1=1'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (vertical && vertical !== 'all') {
        conditions.push(`v.name ILIKE $${paramIndex}`);
        queryParams.push(vertical);
        paramIndex++;
    }

    if (hasTrialOffer) {
        conditions.push(`EXISTS (
      SELECT 1 FROM wellness.clinic_offers o 
      WHERE o.clinic_id = c.id AND o.offer_type = 'trial'
    )`);
    }

    if (hasWhatsApp) {
        conditions.push(`EXISTS (
      SELECT 1 FROM wellness.clinic_ctas ct 
      WHERE ct.clinic_id = c.id AND ct.cta_type = 'whatsapp'
    )`);
    }

    if (topOnly) {
        conditions.push(`c.competitor_score >= 60`);
    }

    const whereClause = conditions.join(' AND ');

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['competitor_score', 'name', 'page_count', 'serp_visibility', 'seo_hygiene'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'competitor_score';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query<{ count: string }>(`
    SELECT count(DISTINCT c.id)::text as count
    FROM wellness.clinics c
    JOIN wellness.verticals v ON c.vertical_id = v.id
    LEFT JOIN wellness.domains d ON d.clinic_id = c.id
    WHERE ${whereClause}
  `, queryParams);

    const totalCount = parseInt(countResult[0]?.count ?? '0', 10);

    // Get paginated data
    const offset = (page - 1) * pageSize;

    const competitors = await query<DBCompetitor>(`
    SELECT DISTINCT ON (c.id)
      c.id,
      c.name,
      d.domain,
      c.competitor_score,
      c.score_confidence,
      (SELECT count(*) FROM wellness.pages p WHERE p.domain_id = d.id)::text as page_count,
      (c.score_breakdown->'visibility'->>'normalized')::numeric as serp_visibility,
      (c.score_breakdown->'technical'->>'score')::numeric as seo_hygiene,
      EXISTS (
        SELECT 1 FROM wellness.clinic_offers o 
        WHERE o.clinic_id = c.id AND o.offer_type = 'trial'
      ) as has_trial,
      EXISTS (
        SELECT 1 FROM wellness.clinic_ctas ct 
        WHERE ct.clinic_id = c.id AND ct.cta_type = 'whatsapp'
      ) as has_whatsapp
    FROM wellness.clinics c
    JOIN wellness.verticals v ON c.vertical_id = v.id
    LEFT JOIN wellness.domains d ON d.clinic_id = c.id
    WHERE ${whereClause}
    ORDER BY c.id, ${sortColumn} ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, [...queryParams, pageSize, offset]);

    const rows: CompetitorRow[] = competitors.map((c) => ({
        id: c.id,
        name: c.name ?? 'Unknown',
        domain: c.domain ?? '',
        score: Math.round(c.competitor_score ?? 0),
        serpVisibility: Math.round(c.serp_visibility ?? 0),
        pageCount: parseInt(c.page_count, 10) || 0,
        seoHygiene: Math.round(c.seo_hygiene ?? 0),
        hasTrialOffer: c.has_trial,
        hasWhatsApp: c.has_whatsapp,
    }));

    return {
        competitors: rows,
        totalCount,
        freshness: new Date().toISOString(),
    };
}
