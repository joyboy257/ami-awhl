import { NextResponse } from 'next/server';
import { getDataHealthData } from '@/lib/queries/data-health';

export async function GET() {
    try {
        const data = await getDataHealthData();

        return NextResponse.json({
            meta: {
                freshness: data.freshness,
            },
            data,
        });
    } catch (error) {
        console.error('Data Health API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data health' },
            { status: 500 }
        );
    }
}
