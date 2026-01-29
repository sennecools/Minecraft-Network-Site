import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// POST /api/admin/migrate/closed-servers
// Run this once to add columns for closed server support
export async function POST() {
  try {
    // Add is_closed column
    await sql`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false
    `;

    // Add world_download_url column
    await sql`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS world_download_url TEXT
    `;

    // Add closed_at timestamp
    await sql`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP
    `;

    // Add season number
    await sql`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1
    `;

    return NextResponse.json({ success: true, message: 'Closed server columns added' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
