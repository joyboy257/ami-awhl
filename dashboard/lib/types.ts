// DTO types for API responses

// Global filter parameters
export interface Filters {
    vertical: string;
    region: string;
    timeframe: string;
}

// Home page DTOs
export interface HomeKPIs {
    visibilityScore: number;
    shareOfVoice: number;
    biggestMovers: number;
    medianTrialPrice: number | null;
    whatsappCTAs: number;
}

export interface ThreatItem {
    id: string;
    name: string;
    detail: string;
    value: string;
    severity: 'high' | 'medium' | 'low';
}

export interface OpportunityItem {
    id: string;
    title: string;
    detail: string;
    count: number;
}

export interface HomeDTO {
    kpis: HomeKPIs;
    threats: ThreatItem[];
    opportunities: OpportunityItem[];
    freshness: string;
}

// Market Map DTOs
export interface CompetitorRow {
    id: string;
    name: string;
    domain: string;
    score: number;
    serpVisibility: number;
    pageCount: number;
    seoHygiene: number;
    hasTrialOffer: boolean;
    hasWhatsApp: boolean;
}

export interface MarketMapDTO {
    competitors: CompetitorRow[];
    totalCount: number;
    freshness: string;
}

// Offers & Pricing DTOs
export interface PriceDistributionItem {
    service: string;
    avgPrice: number;
    count: number;
}

export interface TrialLeaderboardItem {
    name: string;
    price: number;
}

export interface CTAMixItem {
    type: string;
    count: number;
    [key: string]: string | number;
}

export interface OffersDTO {
    priceDistribution: PriceDistributionItem[];
    trialLeaderboard: TrialLeaderboardItem[];
    ctaMix: CTAMixItem[];
    freshness: string;
}

// Battlecard (Clinic Profile) DTOs
export interface BattlecardDTO {
    clinic: {
        id: string;
        name: string;
        vertical: string;
        score: number;
        confidence: number;
        scoredAt: string;
    };
    domains: string[];
    scoreBreakdown: {
        visibility: { raw: number; normalized: number };
        inventory: { score: number; pageTypes: string[]; contentfulPages: number };
        conversion: { score: number; whatsapp: boolean; phone: boolean; booking: boolean; form: boolean };
        commercial: { score: number; ctaCount: number; offerCount: number; hasPricingEvidence: boolean };
        technical: { score: number; hasStructuredData: boolean; hasLocalBusinessSchema: boolean };
    };
    ctas: Array<{ type: string; text: string; evidence: string }>;
    offers: Array<{ service: string; type: string; price: number | null; evidence: string }>;
    pageCount: number;
    freshness: string;
}

// Change Radar DTOs
export interface ChangeEvent {
    id: string;
    clinicName: string;
    eventType: 'new_offer' | 'price_change' | 'rank_shift' | 'new_cta';
    detail: string;
    timestamp: string;
}

export interface AlertRule {
    id: string;
    label: string;
    enabled: boolean;
    severity: 'high' | 'medium' | 'low';
}

export interface ChangeRadarDTO {
    events: ChangeEvent[];
    alertRules: AlertRule[];
    freshness: string;
}

// Data Health DTOs
export interface DataHealthDTO {
    crawlStats: {
        total: number;
        crawled: number;
        errors: number;
        successRate: number;
    };
    domainStats: {
        pending: number;
        inProgress: number;
        complete: number;
    };
    recentRuns: Array<{
        id: string;
        mode: string;
        status: string;
        startedAt: string;
        endedAt: string | null;
    }>;
    freshness: string;
}
