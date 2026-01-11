'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    FileText,
    Zap,
    DollarSign,
    Wrench,
    Check,
    X,
} from 'lucide-react';
import type { BattlecardDTO } from '@/lib/types';

interface ScoreBreakdownProps {
    breakdown: BattlecardDTO['scoreBreakdown'];
    totalScore: number;
}

interface ScoreSectionProps {
    title: string;
    icon: React.ReactNode;
    score: number;
    maxScore?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function ScoreSection({
    title,
    icon,
    score,
    maxScore = 100,
    children,
    defaultOpen = false,
}: ScoreSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const percent = Math.round((score / maxScore) * 100);

    return (
        <div className="border-b border-border last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">{icon}</div>
                    <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{score} / {maxScore} pts</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-24">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all',
                                    percent >= 70 ? 'bg-success' : percent >= 40 ? 'bg-warning' : 'bg-danger'
                                )}
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-border bg-muted/30 p-4">{children}</div>
            )}
        </div>
    );
}

function BooleanIndicator({ value, label }: { value: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2">
            {value ? (
                <Check className="h-4 w-4 text-success" />
            ) : (
                <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(value ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
            </span>
        </div>
    );
}

export function ScoreBreakdown({ breakdown, totalScore }: ScoreBreakdownProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Score Breakdown</CardTitle>
                    <Badge
                        variant="outline"
                        className={cn(
                            'text-lg font-bold px-3 py-1',
                            totalScore >= 80
                                ? 'border-success/30 text-success'
                                : totalScore >= 60
                                    ? 'border-primary/30 text-primary'
                                    : totalScore >= 40
                                        ? 'border-warning/30 text-warning'
                                        : 'border-danger/30 text-danger'
                        )}
                    >
                        {totalScore}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Visibility */}
                <ScoreSection
                    title="Visibility"
                    icon={<Eye className="h-4 w-4" />}
                    score={Math.round(breakdown.visibility.normalized)}
                    defaultOpen
                >
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Raw SERP score</span>
                            <span>{breakdown.visibility.raw}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Normalized (0-100)</span>
                            <span>{breakdown.visibility.normalized.toFixed(1)}</span>
                        </div>
                    </div>
                </ScoreSection>

                {/* Inventory */}
                <ScoreSection
                    title="Inventory"
                    icon={<FileText className="h-4 w-4" />}
                    score={breakdown.inventory.score}
                >
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Contentful pages</span>
                            <span>{breakdown.inventory.contentfulPages}</span>
                        </div>
                        {breakdown.inventory.pageTypes.length > 0 && (
                            <div>
                                <span className="text-muted-foreground">Page types: </span>
                                {breakdown.inventory.pageTypes.map((type, i) => (
                                    <Badge key={i} variant="secondary" className="mr-1 text-xs">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </ScoreSection>

                {/* Conversion */}
                <ScoreSection
                    title="Conversion"
                    icon={<Zap className="h-4 w-4" />}
                    score={breakdown.conversion.score}
                >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <BooleanIndicator value={breakdown.conversion.whatsapp} label="WhatsApp" />
                        <BooleanIndicator value={breakdown.conversion.phone} label="Phone" />
                        <BooleanIndicator value={breakdown.conversion.booking} label="Booking" />
                        <BooleanIndicator value={breakdown.conversion.form} label="Contact Form" />
                    </div>
                </ScoreSection>

                {/* Commercial */}
                <ScoreSection
                    title="Commercial"
                    icon={<DollarSign className="h-4 w-4" />}
                    score={breakdown.commercial.score}
                >
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">CTA count</span>
                            <span>{breakdown.commercial.ctaCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Offer count</span>
                            <span>{breakdown.commercial.offerCount}</span>
                        </div>
                        <BooleanIndicator
                            value={breakdown.commercial.hasPricingEvidence}
                            label="Has pricing evidence"
                        />
                    </div>
                </ScoreSection>

                {/* Technical */}
                <ScoreSection
                    title="Technical"
                    icon={<Wrench className="h-4 w-4" />}
                    score={breakdown.technical.score}
                >
                    <div className="space-y-2 text-sm">
                        <BooleanIndicator
                            value={breakdown.technical.hasStructuredData}
                            label="Has structured data"
                        />
                        <BooleanIndicator
                            value={breakdown.technical.hasLocalBusinessSchema}
                            label="LocalBusiness schema"
                        />
                    </div>
                </ScoreSection>
            </CardContent>
        </Card>
    );
}
