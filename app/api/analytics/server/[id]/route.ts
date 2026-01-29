/**
 * Server Analytics API
 * Retrieves analytics data for a specific server
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '24h';

    // Calculate time range
    let hoursBack = 24;
    switch (range) {
      case '7d':
        hoursBack = 24 * 7;
        break;
      case '30d':
        hoursBack = 24 * 30;
        break;
      case '90d':
        hoursBack = 24 * 90;
        break;
      default:
        hoursBack = 24;
    }

    // Calculate the cutoff timestamp
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Get analytics data - use AT TIME ZONE to ensure UTC
    const result = await sql`
      SELECT
        timestamp AT TIME ZONE 'UTC' AS timestamp,
        online,
        player_count,
        max_players,
        latency,
        version
      FROM server_analytics
      WHERE server_id = ${id}
        AND timestamp > ${cutoffTime}
      ORDER BY timestamp ASC
    `;

    // Calculate summary stats
    const totalSnapshots = result.rows.length;
    const onlineSnapshots = result.rows.filter((r: any) => r.online).length;
    const uptimePercent = totalSnapshots > 0 ? (onlineSnapshots / totalSnapshots) * 100 : 0;

    const playerCounts = result.rows
      .filter((r: any) => r.online)
      .map((r: any) => r.player_count);
    const avgPlayers = playerCounts.length > 0
      ? playerCounts.reduce((a: number, b: number) => a + b, 0) / playerCounts.length
      : 0;
    const peakPlayers = playerCounts.length > 0 ? Math.max(...playerCounts) : 0;

    return NextResponse.json({
      server_id: id,
      range,
      summary: {
        uptime_percent: Math.round(uptimePercent * 10) / 10,
        avg_players: Math.round(avgPlayers * 10) / 10,
        peak_players: peakPlayers,
        total_snapshots: totalSnapshots,
      },
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
