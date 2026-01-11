import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import type { ThreatItem } from '@/lib/types';

interface ThreatCardProps {
    threat: ThreatItem;
}

export function ThreatCard({ threat }: ThreatCardProps) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/5 p-4">
            <div className="rounded-full bg-danger/10 p-2">
                <AlertTriangle className="h-4 w-4 text-danger" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">{threat.name}</p>
                    <Badge variant="destructive" className="text-xs">
                        {threat.value}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{threat.detail}</p>
            </div>
        </div>
    );
}

interface ThreatListProps {
    threats: ThreatItem[];
    className?: string;
}

export function ThreatList({ threats, className }: ThreatListProps) {
    if (threats.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Top Threats This Week</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No active threats detected.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg text-danger">Top Threats This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {threats.map((threat) => (
                    <ThreatCard key={threat.id} threat={threat} />
                ))}
            </CardContent>
        </Card>
    );
}
