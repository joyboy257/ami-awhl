import { cn } from '@/lib/utils';

interface VisibilityBarProps {
    percent: number;
    className?: string;
}

/**
 * SERP visibility progress bar matching Figma design
 */
export function VisibilityBar({ percent, className }: VisibilityBarProps) {
    const clampedPercent = Math.min(100, Math.max(0, percent));

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${clampedPercent}%` }}
                />
            </div>
            <span className="w-10 text-right text-sm text-muted-foreground">
                {clampedPercent}%
            </span>
        </div>
    );
}
