import { query } from '@/lib/db';

interface KeywordRow {
    id: string;
    query_text: string;
    priority_tier: string;
    vertical_name: string;
    snapshot_count: number;
    last_snapshot_at: string | null;
    top_clinic_name: string | null;
    top_clinic_rank: number | null;
}

interface KeywordsDTO {
    keywords: KeywordRow[];
    totalCount: number;
    freshness: string;
}

interface QueryParams {
    vertical?: string;
    tier?: string;
    page?: number;
    pageSize?: number;
}

export async function getKeywordsData(params: QueryParams): Promise<KeywordsDTO> {
    const { vertical, tier, page = 1, pageSize = 20 } = params;

    // Build WHERE clauses
    const conditions: string[] = ['1=1'];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (vertical && vertical !== 'all') {
        conditions.push(`v.name ILIKE $${paramIndex}`);
        queryParams.push(vertical);
        paramIndex++;
    }

    if (tier && tier !== 'all') {
        conditions.push(`sq.priority_tier = $${paramIndex}`);
        queryParams.push(tier);
        paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await query<{ count: string }>(`
    SELECT count(*)::text as count
    FROM wellness.search_queries sq
    JOIN wellness.verticals v ON sq.vertical_id = v.id
    WHERE ${whereClause}
  `, queryParams);

    const totalCount = parseInt(countResult[0]?.count ?? '0', 10);

    // Get paginated keywords with SERP info
    const offset = (page - 1) * pageSize;

    const keywords = await query<{
        id: string;
        query_text: string;
        priority_tier: string;
        vertical_name: string;
        snapshot_count: string;
        last_snapshot_at: Date | null;
        top_clinic_name: string | null;
        top_clinic_rank: number | null;
    }>(`
    SELECT 
      sq.id,
      sq.query_text,
      sq.priority_tier,
      v.name as vertical_name,
      (SELECT count(*) FROM wellness.serp_snapshots ss WHERE ss.query_id = sq.id)::text as snapshot_count,
      (SELECT max(captured_at) FROM wellness.serp_snapshots ss WHERE ss.query_id = sq.id) as last_snapshot_at,
      (
        SELECT c.name FROM wellness.serp_results sr
        JOIN wellness.serp_snapshots ss ON sr.snapshot_id = ss.id
        JOIN wellness.clinics c ON sr.clinic_id = c.id
        WHERE ss.query_id = sq.id AND sr.rank = 1
        ORDER BY ss.captured_at DESC
        LIMIT 1
      ) as top_clinic_name,
      (
        SELECT sr.rank FROM wellness.serp_results sr
        JOIN wellness.serp_snapshots ss ON sr.snapshot_id = ss.id
        WHERE ss.query_id = sq.id
        ORDER BY ss.captured_at DESC
        LIMIT 1
      ) as top_clinic_rank
    FROM wellness.search_queries sq
    JOIN wellness.verticals v ON sq.vertical_id = v.id
    WHERE ${whereClause}
    ORDER BY sq.priority_tier ASC, sq.query_text ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, [...queryParams, pageSize, offset]);

    return {
        keywords: keywords.map((k) => ({
            id: k.id,
            query_text: k.query_text,
            priority_tier: k.priority_tier,
            vertical_name: k.vertical_name,
            snapshot_count: parseInt(k.snapshot_count, 10) || 0,
            last_snapshot_at: k.last_snapshot_at?.toISOString() ?? null,
            top_clinic_name: k.top_clinic_name,
            top_clinic_rank: k.top_clinic_rank,
        })),
        totalCount,
        freshness: new Date().toISOString(),
    };
}
