import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import type { OpportunityItem } from '@/lib/types';

interface OpportunityCardProps {
    opportunity: OpportunityItem;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
    return (
        <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
            <div className="rounded-full bg-success/10 p-2">
                <Lightbulb className="h-4 w-4 text-success" />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">{opportunity.title}</p>
                    <Badge className="bg-success text-white text-xs">
                        {opportunity.count} keywords
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{opportunity.detail}</p>
            </div>
        </div>
    );
}

interface OpportunityListProps {
    opportunities: OpportunityItem[];
    className?: string;
}

export function OpportunityList({ opportunities, className }: OpportunityListProps) {
    if (opportunities.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg">Top Opportunities This Week</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">No new opportunities identified.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg text-success">Top Opportunities This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {opportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
            </CardContent>
        </Card>
    );
}
