/**
 * Announcement API - Individual Operations
 * GET /api/announcements/[id] - Get announcement by ID
 * PUT /api/announcements/[id] - Update announcement (admin only)
 * DELETE /api/announcements/[id] - Delete announcement (admin only)
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
    const session = await getCurrentSession();
    const isAdmin = session !== null;

    let result;

    if (isAdmin) {
      // Admin can see any announcement
      result = await sql`
        SELECT * FROM announcements WHERE id = ${id}
      `;
    } else {
      // Public can only see published announcements
      result = await sql`
        SELECT * FROM announcements
        WHERE id = ${id} AND is_published = true
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
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
      title,
      content,
      type,
      is_published,
      is_pinned,
      server_id,
    } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (is_published !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      values.push(is_published);

      // Set published_at when publishing
      if (is_published) {
        updates.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }
    if (is_pinned !== undefined) {
      updates.push(`is_pinned = $${paramIndex++}`);
      values.push(is_pinned);
    }
    if (server_id !== undefined) {
      updates.push(`server_id = $${paramIndex++}`);
      values.push(server_id);
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
      `UPDATE announcements SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating announcement:', error);

    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Invalid server_id' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update announcement' },
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

    const result = await sql`
      DELETE FROM announcements WHERE id = ${id} RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
