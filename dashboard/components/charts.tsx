'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

// Chart wrapper with consistent styling
interface ChartCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );
}

// Color palette matching Figma
const CHART_COLORS = [
    'oklch(0.62 0.21 255)',  // Primary blue
    'oklch(0.72 0.19 145)',  // Success green
    'oklch(0.78 0.16 75)',   // Warning amber
    'oklch(0.63 0.24 25)',   // Danger red
    'oklch(0.65 0.18 300)',  // Purple
];

// Price Distribution Bar Chart
interface PriceDistributionData {
    service: string;
    avgPrice: number;
    count: number;
}

interface PriceDistributionChartProps {
    data: PriceDistributionData[];
}

export function PriceDistributionChart({ data }: PriceDistributionChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">No pricing data available.</p>
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                        type="number"
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                        tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis
                        type="category"
                        dataKey="service"
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                        width={70}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                        }}
                        formatter={(value) => [`$${Number(value ?? 0).toFixed(0)}`, 'Avg Price']}
                    />
                    <Bar dataKey="avgPrice" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// CTA Mix Donut Chart
interface CTAMixData {
    type: string;
    count: number;
    [key: string]: string | number;
}

interface CTAMixChartProps {
    data: CTAMixData[];
}

export function CTAMixChart({ data }: CTAMixChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">No CTA data available.</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="type"
                        label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                        }}
                        formatter={(value, name) => [
                            `${value} (${((Number(value ?? 0) / total) * 100).toFixed(1)}%)`,
                            name,
                        ]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Trial Leaderboard
interface TrialLeaderboardData {
    name: string;
    price: number;
}

interface TrialLeaderboardProps {
    data: TrialLeaderboardData[];
}

export function TrialLeaderboard({ data }: TrialLeaderboardProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">No trial offers found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map((item, i) => (
                <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                i === 0
                                    ? 'bg-warning/20 text-warning'
                                    : 'bg-muted text-muted-foreground'
                            )}
                        >
                            {i + 1}
                        </span>
                        <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-warning">S${item.price}</span>
                </div>
            ))}
        </div>
    );
}
