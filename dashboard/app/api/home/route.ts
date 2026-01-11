import { NextRequest, NextResponse } from 'next/server';
import { getHomeData } from '@/lib/queries/home';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filters = {
            vertical: searchParams.get('vertical') ?? undefined,
            region: searchParams.get('region') ?? undefined,
            timeframe: searchParams.get('timeframe') ?? undefined,
        };

        const data = await getHomeData(filters);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Home API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch home data' },
            { status: 500 }
        );
    }
}
