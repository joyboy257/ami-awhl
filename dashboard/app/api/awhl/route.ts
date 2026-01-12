import { NextResponse } from 'next/server';
import { getAWHLDashboardData } from '@/lib/queries/awhl';

export async function GET() {
    try {
        const data = await getAWHLDashboardData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('AWHL Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch AWHL dashboard data' },
            { status: 500 }
        );
    }
}
