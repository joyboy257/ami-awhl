import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

/**
 * Score badge with color coding based on score value
 * - 80+: Excellent (green)
 * - 60-79: Good (blue)  
 * - 40-59: Fair (amber)
 * - <40: Needs work (red)
 */
export function ScoreBadge({ score, size = 'md', showLabel = false }: ScoreBadgeProps) {
    const tier = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

    const colorClasses = {
        excellent: 'bg-success/15 text-success border-success/30',
        good: 'bg-primary/15 text-primary border-primary/30',
        fair: 'bg-warning/15 text-warning border-warning/30',
        poor: 'bg-danger/15 text-danger border-danger/30',
    };

    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-sm px-2 py-0.5',
        lg: 'text-base px-3 py-1',
    };

    const labels = {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Needs Work',
    };

    return (
        <Badge
            variant="outline"
            className={cn(colorClasses[tier], sizeClasses[size], 'font-semibold')}
        >
            {score}
            {showLabel && <span className="ml-1 font-normal">({labels[tier]})</span>}
        </Badge>
    );
}
