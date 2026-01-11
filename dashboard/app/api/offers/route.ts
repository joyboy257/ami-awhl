import { NextRequest, NextResponse } from 'next/server';
import { getOffersData } from '@/lib/queries/offers';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = {
            vertical: searchParams.get('vertical') ?? undefined,
            region: searchParams.get('region') ?? undefined,
        };

        const data = await getOffersData(params);

        return NextResponse.json({
            meta: {
                freshness: data.freshness,
            },
            data,
        });
    } catch (error) {
        console.error('Offers API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch offers data' },
            { status: 500 }
        );
    }
}
