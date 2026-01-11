import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: string | number;
    delta?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function KPICard({
    label,
    value,
    delta,
    trend = 'neutral',
    subtitle,
    icon,
    className,
}: KPICardProps) {
    const TrendIcon =
        trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    return (
        <Card className={cn('relative', className)}>
            <CardContent className="p-6">
                {/* Label with tooltip */}
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>

                {/* Value */}
                <div className="mt-2 flex items-baseline gap-2">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    <span className="text-3xl font-bold tracking-tight">{value}</span>
                </div>

                {/* Delta / Trend */}
                {delta && (
                    <div className="mt-2 flex items-center gap-1">
                        <TrendIcon
                            className={cn(
                                'h-4 w-4',
                                trend === 'up' && 'text-success',
                                trend === 'down' && 'text-danger',
                                trend === 'neutral' && 'text-muted-foreground'
                            )}
                        />
                        <span
                            className={cn(
                                'text-sm font-medium',
                                trend === 'up' && 'text-success',
                                trend === 'down' && 'text-danger',
                                trend === 'neutral' && 'text-muted-foreground'
                            )}
                        >
                            {delta}
                        </span>
                        {subtitle && (
                            <span className="text-sm text-muted-foreground">{subtitle}</span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
