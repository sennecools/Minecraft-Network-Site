/**
 * Analytics Summary API
 * Returns overall stats for all servers
 */

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

export async function GET() {
  try {
    // Get current status of all servers (last snapshot for each)
    const result = await sql`
      WITH latest_snapshots AS (
        SELECT DISTINCT ON (server_id)
          server_id,
          online,
          player_count,
          max_players,
          timestamp
        FROM server_analytics
        ORDER BY server_id, timestamp DESC
      )
      SELECT
        s.id,
        s.name,
        ls.online,
        ls.player_count,
        ls.max_players,
        ls.timestamp
      FROM servers s
      LEFT JOIN latest_snapshots ls ON s.id = ls.server_id
      WHERE s.is_active = true
      ORDER BY s.display_order ASC, s.name ASC
    `;

    // Calculate totals
    const totalServers = result.rows.length;
    const onlineServers = result.rows.filter((r: any) => r.online).length;
    const totalPlayers = result.rows
      .filter((r: any) => r.online)
      .reduce((sum: number, r: any) => sum + (r.player_count || 0), 0);

    return NextResponse.json({
      summary: {
        total_servers: totalServers,
        online_servers: onlineServers,
        total_players: totalPlayers,
      },
      servers: result.rows,
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
}
