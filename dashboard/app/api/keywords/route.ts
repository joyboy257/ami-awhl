import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsData } from '@/lib/queries/keywords';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = {
            vertical: searchParams.get('vertical') ?? undefined,
            tier: searchParams.get('tier') ?? undefined,
            page: parseInt(searchParams.get('page') ?? '1', 10),
            pageSize: parseInt(searchParams.get('pageSize') ?? '20', 10),
        };

        const data = await getKeywordsData(params);

        return NextResponse.json({
            meta: {
                page: params.page,
                pageSize: params.pageSize,
                totalCount: data.totalCount,
                freshness: data.freshness,
            },
            data: data.keywords,
        });
    } catch (error) {
        console.error('Keywords API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch keywords data' },
            { status: 500 }
        );
    }
}
