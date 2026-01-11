import { NextRequest, NextResponse } from 'next/server';
import { getChangeRadarData } from '@/lib/queries/change-radar';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = {
            vertical: searchParams.get('vertical') ?? undefined,
            timeframe: searchParams.get('timeframe') ?? undefined,
            eventType: searchParams.get('eventType') ?? undefined,
        };

        const data = await getChangeRadarData(params);

        return NextResponse.json({
            meta: {
                freshness: data.freshness,
            },
            data,
        });
    } catch (error) {
        console.error('Change Radar API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch change radar data' },
            { status: 500 }
        );
    }
}
