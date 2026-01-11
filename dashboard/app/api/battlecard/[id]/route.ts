import { NextRequest, NextResponse } from 'next/server';
import { getBattlecardData } from '@/lib/queries/battlecard';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Clinic ID is required' },
                { status: 400 }
            );
        }

        const data = await getBattlecardData(id);

        if (!data) {
            return NextResponse.json(
                { error: 'Clinic not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            meta: {
                freshness: data.freshness,
            },
            data,
        });
    } catch (error) {
        console.error('Battlecard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch battlecard data' },
            { status: 500 }
        );
    }
}
