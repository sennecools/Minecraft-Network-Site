import { NextRequest, NextResponse } from 'next/server';
import { status, statusLegacy } from 'minecraft-server-util';
import { sql } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const serverId = searchParams.get('id');

  if (!serverId) {
    return NextResponse.json(
      { error: 'Server ID is required' },
      { status: 400 }
    );
  }

  // Fetch server from database
  const result = await sql`
    SELECT id, ip, port FROM servers WHERE id = ${serverId}
  `;

  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: 'Server not found' },
      { status: 404 }
    );
  }

  const server = result.rows[0];

  // Try modern protocol first, then fall back to legacy
  try {
    const response = await status(server.ip, server.port, {
      timeout: 5000,
      enableSRV: true,
    });

    return NextResponse.json({
      online: true,
      playerCount: response.players.online,
      maxPlayers: response.players.max,
      version: response.version.name,
      motd: response.motd.clean,
      latency: response.roundTripLatency,
    });
  } catch (modernError) {
    // Modern protocol failed, try legacy protocol
    try {
      const legacyResponse = await statusLegacy(server.ip, server.port, {
        timeout: 5000,
        enableSRV: true,
      });

      return NextResponse.json({
        online: true,
        playerCount: legacyResponse.players.online,
        maxPlayers: legacyResponse.players.max,
        version: legacyResponse.version?.name || 'Unknown',
        motd: legacyResponse.motd.clean,
        latency: null, // Legacy protocol doesn't provide latency
      });
    } catch (legacyError) {
      console.error(`Error fetching status for ${server.id}:`, modernError);

      return NextResponse.json({
        online: false,
        playerCount: 0,
        maxPlayers: 0,
        version: null,
        motd: null,
        latency: null,
      });
    }
  }
}
