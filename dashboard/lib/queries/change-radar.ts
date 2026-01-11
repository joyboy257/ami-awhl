import { query } from '@/lib/db';
import type { ChangeRadarDTO, ChangeEvent, AlertRule } from '@/lib/types';

interface QueryParams {
    vertical?: string;
    timeframe?: string;
    eventType?: string;
}

interface DBEvent {
    id: string;
    clinic_name: string;
    event_type: string;
    detail: string;
    event_time: Date;
}

export async function getChangeRadarData(params: QueryParams): Promise<ChangeRadarDTO> {
    const { vertical, timeframe = '7d' } = params;

    // Calculate interval based on timeframe
    const intervalMap: Record<string, string> = {
        '7d': '7 days',
        '14d': '14 days',
        '30d': '30 days',
        '90d': '90 days',
    };
    const interval = intervalMap[timeframe] ?? '7 days';

    // Build WHERE clause
    const conditions: string[] = [`extracted_at > NOW() - INTERVAL '${interval}'`];
    const queryParams: unknown[] = [];
    let paramIndex = 1;

    if (vertical && vertical !== 'all') {
        conditions.push(`v.name ILIKE $${paramIndex}`);
        queryParams.push(vertical);
        paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Get recent offer events (new offers, price changes)
    const offerEvents = await query<DBEvent>(`
    SELECT 
      o.id::text,
      c.name as clinic_name,
      'new_offer' as event_type,
      concat('New ', o.offer_type, ' offer: ', o.service_name, 
             CASE WHEN o.price_value > 0 THEN concat(' at $', o.price_value::int) ELSE '' END) as detail,
      o.extracted_at as event_time
    FROM wellness.clinic_offers o
    JOIN wellness.clinics c ON o.clinic_id = c.id
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE ${whereClause.replace('extracted_at', 'o.extracted_at')}
    ORDER BY o.extracted_at DESC
    LIMIT 20
  `, queryParams);

    // Get recent CTA events
    const ctaEvents = await query<DBEvent>(`
    SELECT 
      ct.id::text,
      c.name as clinic_name,
      'new_cta' as event_type,
      concat('Added ', ct.cta_type, ' CTA: ', left(ct.cta_text, 50)) as detail,
      ct.created_at as event_time
    FROM wellness.clinic_ctas ct
    JOIN wellness.clinics c ON ct.clinic_id = c.id
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE ct.created_at > NOW() - INTERVAL '${interval}'
      ${vertical && vertical !== 'all' ? `AND v.name ILIKE $1` : ''}
    ORDER BY ct.created_at DESC
    LIMIT 10
  `, vertical && vertical !== 'all' ? [vertical] : []);

    // Combine and sort events
    const allEvents: ChangeEvent[] = [
        ...offerEvents.map((e) => ({
            id: e.id,
            clinicName: e.clinic_name ?? 'Unknown',
            eventType: e.event_type as ChangeEvent['eventType'],
            detail: e.detail,
            timestamp: e.event_time.toISOString(),
        })),
        ...ctaEvents.map((e) => ({
            id: e.id,
            clinicName: e.clinic_name ?? 'Unknown',
            eventType: e.event_type as ChangeEvent['eventType'],
            detail: e.detail,
            timestamp: e.event_time.toISOString(),
        })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Static alert rules (these would be user-configurable in a real app)
    const alertRules: AlertRule[] = [
        {
            id: '1',
            label: 'Competitor introduced new trial offer under $100',
            enabled: true,
            severity: 'high',
        },
        {
            id: '2',
            label: 'Competitor gained top 3 for high-intent keyword',
            enabled: true,
            severity: 'high',
        },
        {
            id: '3',
            label: 'Competitor changed CTA to WhatsApp',
            enabled: false,
            severity: 'medium',
        },
    ];

    return {
        events: allEvents.slice(0, 20),
        alertRules,
        freshness: new Date().toISOString(),
    };
}
