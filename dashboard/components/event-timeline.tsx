'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
    Tag,
    MessageCircle,
    TrendingUp,
    DollarSign,
    ExternalLink,
} from 'lucide-react';
import type { ChangeEvent, AlertRule } from '@/lib/types';

// Event type icons and colors
const eventConfig: Record<string, { icon: React.ReactNode; color: string }> = {
    new_offer: {
        icon: <Tag className="h-4 w-4" />,
        color: 'bg-warning/15 text-warning border-warning/30',
    },
    price_change: {
        icon: <DollarSign className="h-4 w-4" />,
        color: 'bg-danger/15 text-danger border-danger/30',
    },
    rank_shift: {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'bg-primary/15 text-primary border-primary/30',
    },
    new_cta: {
        icon: <MessageCircle className="h-4 w-4" />,
        color: 'bg-success/15 text-success border-success/30',
    },
};

interface EventTimelineProps {
    events: ChangeEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
    if (events.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">No events in this time period.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => {
                const config = eventConfig[event.eventType] ?? eventConfig.new_offer;
                const timeAgo = getTimeAgo(new Date(event.timestamp));

                return (
                    <div
                        key={event.id}
                        className="flex items-start gap-4 rounded-lg border border-border p-4"
                    >
                        <div className={cn('rounded-full p-2', config.color)}>
                            {config.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">{event.clinicName}</p>
                                <span className="text-sm text-muted-foreground">{timeAgo}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.detail}</p>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

interface AlertRulesProps {
    rules: AlertRule[];
}

export function AlertRules({ rules }: AlertRulesProps) {
    const severityColors: Record<string, string> = {
        high: 'bg-danger text-white',
        medium: 'bg-warning text-white',
        low: 'bg-muted text-muted-foreground',
    };

    return (
        <div className="space-y-4">
            {rules.map((rule) => (
                <div
                    key={rule.id}
                    className="flex items-start justify-between rounded-lg border border-border p-4"
                >
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Switch checked={rule.enabled} />
                            <span className={cn(!rule.enabled && 'text-muted-foreground')}>
                                {rule.label}
                            </span>
                        </div>
                    </div>
                    <Badge className={cn('text-xs', severityColors[rule.severity])}>
                        {rule.severity}
                    </Badge>
                </div>
            ))}
        </div>
    );
}
