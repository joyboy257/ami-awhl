import { NextRequest, NextResponse } from 'next/server';
import { getMarketMapData } from '@/lib/queries/market-map';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = {
            vertical: searchParams.get('vertical') ?? undefined,
            region: searchParams.get('region') ?? undefined,
            sort: searchParams.get('sort') ?? undefined,
            order: (searchParams.get('order') ?? 'desc') as 'asc' | 'desc',
            page: parseInt(searchParams.get('page') ?? '1', 10),
            pageSize: parseInt(searchParams.get('pageSize') ?? '20', 10),
            hasTrialOffer: searchParams.get('hasTrialOffer') === 'true',
            hasWhatsApp: searchParams.get('hasWhatsApp') === 'true',
            topOnly: searchParams.get('topOnly') === 'true',
        };

        const data = await getMarketMapData(params);

        return NextResponse.json({
            meta: {
                page: params.page,
                pageSize: params.pageSize,
                totalCount: data.totalCount,
                freshness: data.freshness,
            },
            data: data.competitors,
        });
    } catch (error) {
        console.error('Market Map API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch market map data' },
            { status: 500 }
        );
    }
}
