import { query, queryOne } from '@/lib/db';
import type { BattlecardDTO } from '@/lib/types';

interface DBClinic {
    id: string;
    name: string;
    vertical_name: string;
    competitor_score: number;
    score_confidence: number;
    scored_at: Date;
    score_breakdown: Record<string, unknown>;
}

interface DBDomain {
    domain: string;
}

interface DBCTA {
    cta_type: string;
    cta_text: string;
    evidence_snippet: string;
}

interface DBOffer {
    service_name: string;
    offer_type: string;
    price_value: number | null;
    evidence_snippet: string;
}

export async function getBattlecardData(clinicId: string): Promise<BattlecardDTO | null> {
    // Get clinic details
    const clinic = await queryOne<DBClinic>(`
    SELECT 
      c.id,
      c.name,
      v.name as vertical_name,
      c.competitor_score,
      c.score_confidence,
      c.scored_at,
      c.score_breakdown
    FROM wellness.clinics c
    JOIN wellness.verticals v ON c.vertical_id = v.id
    WHERE c.id = $1
  `, [clinicId]);

    if (!clinic) {
        return null;
    }

    // Get domains
    const domains = await query<DBDomain>(`
    SELECT domain FROM wellness.domains WHERE clinic_id = $1
  `, [clinicId]);

    // Get CTAs
    const ctas = await query<DBCTA>(`
    SELECT cta_type, cta_text, left(evidence_snippet, 200) as evidence_snippet
    FROM wellness.clinic_ctas
    WHERE clinic_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `, [clinicId]);

    // Get offers
    const offers = await query<DBOffer>(`
    SELECT service_name, offer_type, price_value, left(evidence_snippet, 200) as evidence_snippet
    FROM wellness.clinic_offers
    WHERE clinic_id = $1
    ORDER BY extracted_at DESC
    LIMIT 20
  `, [clinicId]);

    // Get page count
    const pageCountResult = await queryOne<{ count: string }>(`
    SELECT count(*)::text as count
    FROM wellness.pages p
    JOIN wellness.domains d ON p.domain_id = d.id
    WHERE d.clinic_id = $1
  `, [clinicId]);

    const breakdown = clinic.score_breakdown ?? {};
    const visibility = (breakdown.visibility ?? {}) as Record<string, unknown>;
    const inventory = (breakdown.inventory ?? {}) as Record<string, unknown>;
    const conversion = (breakdown.conversion ?? {}) as Record<string, unknown>;
    const commercial = (breakdown.commercial ?? {}) as Record<string, unknown>;
    const technical = (breakdown.technical ?? {}) as Record<string, unknown>;

    return {
        clinic: {
            id: clinic.id,
            name: clinic.name ?? 'Unknown',
            vertical: clinic.vertical_name,
            score: Math.round(clinic.competitor_score ?? 0),
            confidence: Math.round(clinic.score_confidence ?? 0),
            scoredAt: clinic.scored_at?.toISOString() ?? '',
        },
        domains: domains.map(d => d.domain),
        scoreBreakdown: {
            visibility: {
                raw: Number(visibility.raw ?? 0),
                normalized: Number(visibility.normalized ?? 0),
            },
            inventory: {
                score: Number(inventory.score ?? 0),
                pageTypes: Array.isArray(inventory.page_types) ? inventory.page_types : [],
                contentfulPages: Number(inventory.contentful_pages ?? 0),
            },
            conversion: {
                score: Number(conversion.score ?? 0),
                whatsapp: Boolean(conversion.whatsapp),
                phone: Boolean(conversion.phone),
                booking: Boolean(conversion.booking),
                form: Boolean(conversion.form),
            },
            commercial: {
                score: Number(commercial.score ?? 0),
                ctaCount: Number(commercial.cta_count ?? 0),
                offerCount: Number(commercial.offer_count ?? 0),
                hasPricingEvidence: Boolean(commercial.has_pricing_evidence),
            },
            technical: {
                score: Number(technical.score ?? 0),
                hasStructuredData: Boolean(technical.has_structured_data),
                hasLocalBusinessSchema: Boolean(technical.has_local_business_schema),
            },
        },
        ctas: ctas.map(c => ({
            type: c.cta_type,
            text: c.cta_text,
            evidence: c.evidence_snippet,
        })),
        offers: offers.map(o => ({
            service: o.service_name,
            type: o.offer_type,
            price: o.price_value,
            evidence: o.evidence_snippet,
        })),
        pageCount: parseInt(pageCountResult?.count ?? '0', 10),
        freshness: new Date().toISOString(),
    };
}
