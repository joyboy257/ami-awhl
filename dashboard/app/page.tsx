import { Suspense } from 'react';
import { KPICard } from '@/components/kpi-card';
import { ThreatList } from '@/components/threat-list';
import { OpportunityList } from '@/components/opportunity-list';
import { Skeleton } from '@/components/ui/skeleton';
import { getHomeData } from '@/lib/queries/home';
import { Eye, PieChart, TrendingUp, DollarSign, MessageCircle } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{ vertical?: string; region?: string; timeframe?: string }>;
}

async function HomeContent({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const data = await getHomeData({
    vertical: params.vertical,
    region: params.region,
    timeframe: params.timeframe,
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground">
          Understand your market position in 60 seconds
        </p>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          label="Visibility Score"
          value={data.kpis.visibilityScore.toFixed(1)}
          delta="+5.3%"
          trend="up"
          subtitle="vs last period"
          icon={<Eye className="h-4 w-4" />}
        />
        <KPICard
          label="Share of Voice"
          value={`${data.kpis.shareOfVoice}%`}
          delta="+2.1%"
          trend="up"
          subtitle="vs last period"
          icon={<PieChart className="h-4 w-4" />}
        />
        <KPICard
          label="Biggest Movers"
          value={data.kpis.biggestMovers}
          delta="-1"
          trend="down"
          subtitle="vs last period"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KPICard
          label="Median Trial Price"
          value={data.kpis.medianTrialPrice ? `S$${data.kpis.medianTrialPrice}` : '—'}
          subtitle="across all verticals"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          label="WhatsApp CTAs"
          value={`${data.kpis.whatsappCTAs}%`}
          delta="+12%"
          trend="up"
          subtitle="vs last period"
          icon={<MessageCircle className="h-4 w-4" />}
        />
      </div>

      {/* Threats and Opportunities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ThreatList threats={data.threats} />
        <OpportunityList opportunities={data.opportunities} />
      </div>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function HomePage(props: HomePageProps) {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent {...props} />
    </Suspense>
  );
}
