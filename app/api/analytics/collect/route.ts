/**
 * Analytics Collection API
 * Collects server status data and stores it in the database
 * Called by Vercel Cron Job every 5 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { status, statusLegacy } from 'minecraft-server-util';

interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
  latency: number | null;
  version: string;
}

async function getServerStatus(ip: string, port: number): Promise<ServerStatus> {
  // Try modern protocol first
  try {
    const response = await status(ip, port, {
      timeout: 5000,
      enableSRV: true,
    });

    return {
      online: true,
      players: response.players.online,
      maxPlayers: response.players.max,
      latency: response.roundTripLatency,
      version: response.version.name,
    };
  } catch {
    // Modern protocol failed, try legacy protocol
    const legacyResponse = await statusLegacy(ip, port, {
      timeout: 5000,
      enableSRV: true,
    });

    return {
      online: true,
      players: legacyResponse.players.online,
      maxPlayers: legacyResponse.players.max,
      latency: null, // Legacy protocol doesn't provide latency
      version: legacyResponse.version?.name || 'Unknown',
    };
  }
}

// Vercel Cron calls GET, so we need both handlers
export async function GET(request: NextRequest) {
  return collectAnalytics(request);
}

export async function POST(request: NextRequest) {
  return collectAnalytics(request);
}

async function collectAnalytics(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Check for Vercel's cron verification header (set automatically in production)
    // See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    // Allow if:
    // 1. CRON_SECRET is not set (for development/testing)
    // 2. Authorization header matches Bearer token
    // 3. Request is from Vercel cron (production)
    const isAuthorized =
      !cronSecret ||
      authHeader === `Bearer ${cronSecret}` ||
      isVercelCron;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active servers
    const serversResult = await sql`
      SELECT id, ip, port FROM servers WHERE is_active = true
    `;

    const servers = serversResult.rows;
    const results = [];

    // Use explicit UTC timestamp for consistency
    const nowUtc = new Date().toISOString();

    // Query each server and store results
    for (const server of servers) {
      try {
        const serverStatus = await getServerStatus(server.ip, server.port);

        // Insert analytics data with explicit UTC timestamp
        await sql`
          INSERT INTO server_analytics (
            server_id, timestamp, online, player_count, max_players, latency, version
          )
          VALUES (
            ${server.id},
            ${nowUtc}::timestamptz,
            true,
            ${serverStatus.players},
            ${serverStatus.maxPlayers},
            ${serverStatus.latency},
            ${serverStatus.version}
          )
        `;

        results.push({
          server_id: server.id,
          status: 'online',
          players: serverStatus.players,
        });
      } catch (error) {
        // Server is offline or unreachable (both protocols failed)
        await sql`
          INSERT INTO server_analytics (
            server_id, timestamp, online, player_count, max_players, latency, version
          )
          VALUES (
            ${server.id},
            ${nowUtc}::timestamptz,
            false,
            0,
            0,
            NULL,
            NULL
          )
        `;

        results.push({
          server_id: server.id,
          status: 'offline',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      collected: results.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics collection error:', error);
    return NextResponse.json(
      { error: 'Collection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
