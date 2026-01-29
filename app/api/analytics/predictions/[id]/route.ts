/**
 * Analytics Predictions API
 * Returns predicted player counts based on historical averages
 * Groups by hour of day and day of week for more accurate predictions
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

    // Calculate how far back to look for historical data (at least 2 weeks)
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

    // Get historical averages grouped by hour of day and day of week
    // This gives us a prediction for "Mondays at 3pm" based on past Mondays at 3pm
    const result = await sql`
      SELECT
        EXTRACT(DOW FROM timestamp) as day_of_week,
        EXTRACT(HOUR FROM timestamp) as hour_of_day,
        ROUND(AVG(CASE WHEN online THEN player_count ELSE 0 END), 1) as avg_players,
        COUNT(*) as sample_count
      FROM server_analytics
      WHERE server_id = ${id}
        AND timestamp > NOW() - INTERVAL '30 days'
        AND online = true
      GROUP BY EXTRACT(DOW FROM timestamp), EXTRACT(HOUR FROM timestamp)
      ORDER BY day_of_week, hour_of_day
    `;

    // Build a lookup map for predictions
    const predictionMap: Record<string, number> = {};
    for (const row of result.rows) {
      const key = `${row.day_of_week}-${row.hour_of_day}`;
      predictionMap[key] = parseFloat(row.avg_players);
    }

    // Generate prediction points for the requested time range
    // Include future predictions (~20% of the range into the future)
    const now = new Date();
    const predictions: Array<{ timestamp: string; predicted_players: number }> = [];

    // Generate prediction points: 80% past + 20% future
    const pastHours = Math.floor(hoursBack * 0.8);
    const futureHours = Math.ceil(hoursBack * 0.2);
    const startTime = new Date(now.getTime() - pastHours * 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + futureHours * 60 * 60 * 1000);

    for (let time = new Date(startTime); time <= endTime; time.setHours(time.getHours() + 1)) {
      const dayOfWeek = time.getDay();
      const hourOfDay = time.getHours();
      const key = `${dayOfWeek}-${hourOfDay}`;

      // Round up to whole players
      const predictedPlayers = Math.ceil(predictionMap[key] ?? 0);

      predictions.push({
        timestamp: time.toISOString(),
        predicted_players: predictedPlayers,
      });
    }

    // Also calculate overall stats
    const overallResult = await sql`
      SELECT
        ROUND(AVG(CASE WHEN online THEN player_count ELSE 0 END), 1) as overall_avg,
        MAX(CASE WHEN online THEN player_count ELSE 0 END) as peak_players
      FROM server_analytics
      WHERE server_id = ${id}
        AND timestamp > NOW() - INTERVAL '30 days'
    `;

    return NextResponse.json({
      server_id: id,
      range,
      predictions,
      stats: {
        overall_avg: parseFloat(overallResult.rows[0]?.overall_avg || '0'),
        peak_players: overallResult.rows[0]?.peak_players || 0,
        data_points: result.rows.length,
      },
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
