/**
 * Server API - Individual Operations
 * GET /api/servers/[id] - Get server by ID
 * PUT /api/servers/[id] - Update server (admin only)
 * DELETE /api/servers/[id] - Delete/deactivate server (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const result = await sql`
      SELECT * FROM servers WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching server:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require admin authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      short_name,
      ip,
      port,
      description,
      long_description,
      features,
      modpack_version,
      minecraft_version,
      modpack_url,
      display_order,
      is_active,
      is_closed,
      world_download_url,
      season,
    } = body;

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (short_name !== undefined) {
      updates.push(`short_name = $${paramIndex++}`);
      values.push(short_name);
    }
    if (ip !== undefined) {
      updates.push(`ip = $${paramIndex++}`);
      values.push(ip);
    }
    if (port !== undefined) {
      updates.push(`port = $${paramIndex++}`);
      values.push(port);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (long_description !== undefined) {
      updates.push(`long_description = $${paramIndex++}`);
      values.push(long_description);
    }
    if (features !== undefined) {
      updates.push(`features = $${paramIndex++}::jsonb`);
      values.push(JSON.stringify(features));
    }
    if (modpack_version !== undefined) {
      updates.push(`modpack_version = $${paramIndex++}`);
      values.push(modpack_version);
    }
    if (minecraft_version !== undefined) {
      updates.push(`minecraft_version = $${paramIndex++}`);
      values.push(minecraft_version);
    }
    if (modpack_url !== undefined) {
      updates.push(`modpack_url = $${paramIndex++}`);
      values.push(modpack_url || null);
    }
    if (display_order !== undefined) {
      updates.push(`display_order = $${paramIndex++}`);
      values.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    if (is_closed !== undefined) {
      updates.push(`is_closed = $${paramIndex++}`);
      values.push(is_closed);
      // Set closed_at timestamp when closing a server
      if (is_closed) {
        updates.push(`closed_at = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`closed_at = NULL`);
      }
    }
    if (world_download_url !== undefined) {
      updates.push(`world_download_url = $${paramIndex++}`);
      values.push(world_download_url || null);
    }
    if (season !== undefined) {
      updates.push(`season = $${paramIndex++}`);
      values.push(season);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await sql.query(
      `UPDATE servers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json(
      { error: 'Failed to update server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Require admin authentication
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Hard delete - permanently remove from database
      const result = await sql`
        DELETE FROM servers WHERE id = ${id} RETURNING id
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Server not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Server deleted permanently' });
    } else {
      // Soft delete - set is_active to false
      const result = await sql`
        UPDATE servers
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Server not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Server deactivated',
        server: result.rows[0],
      });
    }
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
