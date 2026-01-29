/**
 * Announcements API - List and Create
 * GET /api/announcements - List published announcements (public) or all (admin)
 * POST /api/announcements - Create announcement (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // filter by type
    const serverId = searchParams.get('serverId'); // filter by server

    // Check if admin
    const session = await getCurrentSession();
    const isAdmin = session !== null;

    let query;
    const params: any[] = [];

    if (isAdmin) {
      // Admin can see all announcements
      query = `
        SELECT *
        FROM announcements
        WHERE 1=1
      `;
    } else {
      // Public can only see published announcements
      query = `
        SELECT *
        FROM announcements
        WHERE is_published = true
      `;
    }

    // Add filters
    if (type) {
      query += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    if (serverId) {
      query += ` AND server_id = $${params.length + 1}`;
      params.push(serverId);
    }

    // Order by pinned first, then by published_at
    query += `
      ORDER BY is_pinned DESC, published_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    const result = await sql.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM announcements
      WHERE ${isAdmin ? '1=1' : 'is_published = true'}
    `;
    const countParams: any[] = [];

    if (type) {
      countQuery += ` AND type = $${countParams.length + 1}`;
      countParams.push(type);
    }

    if (serverId) {
      countQuery += ` AND server_id = $${countParams.length + 1}`;
      countParams.push(serverId);
    }

    const countResult = await sql.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      announcements: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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
      title,
      content,
      type = 'general',
      is_published = false,
      is_pinned = false,
      server_id = null,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      );
    }

    // Set published_at if publishing
    const published_at = is_published ? new Date().toISOString() : null;

    // Insert new announcement
    const result = await sql`
      INSERT INTO announcements (
        title, content, author, type, is_published, is_pinned,
        server_id, published_at
      )
      VALUES (
        ${title},
        ${content},
        ${session.username},
        ${type},
        ${is_published},
        ${is_pinned},
        ${server_id},
        ${published_at}
      )
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating announcement:', error);

    // Handle foreign key constraint (invalid server_id)
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Invalid server_id' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
