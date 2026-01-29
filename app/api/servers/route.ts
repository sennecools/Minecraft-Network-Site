/**
 * Servers API - List and Create
 * GET /api/servers - List all active servers (public) or all servers (admin)
 * POST /api/servers - Create a new server (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Check if admin is requesting all servers
    const session = await getCurrentSession();
    const isAdmin = session !== null;

    let result;

    const includeClosed = searchParams.get('includeClosed') === 'true';

    if (includeInactive && isAdmin) {
      // Admin can see all servers including inactive
      result = await sql`
        SELECT * FROM servers
        ORDER BY display_order ASC, name ASC
      `;
    } else if (includeClosed) {
      // Include closed servers (for servers listing page)
      result = await sql`
        SELECT * FROM servers
        WHERE is_active = true
        ORDER BY is_closed ASC, display_order ASC, name ASC
      `;
    } else {
      // Public: only active, non-closed servers (for footer, homepage, etc.)
      result = await sql`
        SELECT * FROM servers
        WHERE is_active = true AND is_closed = false
        ORDER BY display_order ASC, name ASC
      `;
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      short_name,
      ip,
      port = 25565,
      description,
      long_description,
      features = [],
      modpack_version,
      minecraft_version,
      modpack_url,
      display_order = 0,
      is_active = true,
      is_closed = false,
      world_download_url,
      season = 1,
    } = body;

    // Validate required fields
    if (!id || !name || !ip || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, ip, description' },
        { status: 400 }
      );
    }

    // Insert new server
    const result = await sql`
      INSERT INTO servers (
        id, name, short_name, ip, port, description, long_description,
        features, modpack_version, minecraft_version, modpack_url, display_order, is_active,
        is_closed, world_download_url, season
      )
      VALUES (
        ${id},
        ${name},
        ${short_name || null},
        ${ip},
        ${port},
        ${description},
        ${long_description || null},
        ${JSON.stringify(features)}::jsonb,
        ${modpack_version || null},
        ${minecraft_version || null},
        ${modpack_url || null},
        ${display_order},
        ${is_active},
        ${is_closed},
        ${world_download_url || null},
        ${season}
      )
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating server:', error);

    // Handle duplicate ID
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Server with this ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create server' },
      { status: 500 }
    );
  }
}
