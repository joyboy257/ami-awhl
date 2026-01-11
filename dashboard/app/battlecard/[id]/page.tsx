import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreBadge } from '@/components/score-badge';
import { ScoreBreakdown } from '@/components/score-breakdown';
import { EvidenceDrawer } from '@/components/evidence-drawer';
import { getBattlecardData } from '@/lib/queries/battlecard';
import {
    ArrowLeft,
    Globe,
    FileText,
    MessageCircle,
    Phone,
    Calendar,
    Mail,
    Tag,
} from 'lucide-react';

interface BattlecardPageProps {
    params: Promise<{ id: string }>;
}

async function BattlecardContent({ params }: BattlecardPageProps) {
    const { id } = await params;
    const data = await getBattlecardData(id);

    if (!data) {
        notFound();
    }

    const evidenceItems = [
        ...data.ctas.map((cta) => ({
            type: 'CTA',
            label: cta.text,
            evidence: cta.evidence,
        })),
        ...data.offers.map((offer) => ({
            type: 'Offer',
            label: `${offer.service} (${offer.type})`,
            evidence: offer.evidence,
        })),
    ];

    const ctaIcons: Record<string, React.ReactNode> = {
        whatsapp: <MessageCircle className="h-4 w-4" />,
        phone: <Phone className="h-4 w-4" />,
        call: <Phone className="h-4 w-4" />,
        book: <Calendar className="h-4 w-4" />,
        booking: <Calendar className="h-4 w-4" />,
        email: <Mail className="h-4 w-4" />,
        form: <FileText className="h-4 w-4" />,
    };

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link
                href="/market-map"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Market Map
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{data.clinic.name}</h1>
                        <ScoreBadge score={data.clinic.score} size="lg" />
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{data.clinic.vertical}</Badge>
                        <span>Confidence: {data.clinic.confidence}%</span>
                        <span>
                            Last scored:{' '}
                            {new Date(data.clinic.scoredAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <EvidenceDrawer items={evidenceItems} />
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Score breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <ScoreBreakdown
                        breakdown={data.scoreBreakdown}
                        totalScore={data.clinic.score}
                    />

                    {/* CTAs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conversion Paths ({data.ctas.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.ctas.length === 0 ? (
                                <p className="text-muted-foreground">No CTAs detected.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {data.ctas.map((cta, i) => (
                                        <Badge
                                            key={i}
                                            variant="outline"
                                            className="gap-1.5 py-1.5 px-3"
                                        >
                                            {ctaIcons[cta.type.toLowerCase()] || <Tag className="h-4 w-4" />}
                                            {cta.text}
                                            <span className="text-muted-foreground">({cta.type})</span>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Offers */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Offers & Pricing ({data.offers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.offers.length === 0 ? (
                                <p className="text-muted-foreground">No pricing evidence detected.</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.offers.map((offer, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg border border-border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">{offer.service}</p>
                                                <p className="text-sm text-muted-foreground">{offer.type}</p>
                                            </div>
                                            {offer.price && (
                                                <Badge className="bg-warning text-warning-foreground">
                                                    S${offer.price}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column - Quick stats */}
                <div className="space-y-6">
                    {/* Domains */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Domains</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.domains.length === 0 ? (
                                <p className="text-muted-foreground">No domains tracked.</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.domains.map((domain, i) => (
                                        <a
                                            key={i}
                                            href={`https://${domain}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <Globe className="h-4 w-4" />
                                            {domain}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Page inventory */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Page Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="text-2xl font-bold">{data.pageCount}</p>
                                    <p className="text-sm text-muted-foreground">pages indexed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BattlecardLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-16" />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-48" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
            </div>
        </div>
    );
}

export default function BattlecardPage(props: BattlecardPageProps) {
    return (
        <Suspense fallback={<BattlecardLoading />}>
            <BattlecardContent {...props} />
        </Suspense>
    );
}
