import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// POST /api/admin/migrate/modpack-url
// Run this once to add modpack_url column
export async function POST() {
  try {
    // Add modpack_url column for direct modpack download links
    await sql`
      ALTER TABLE servers
      ADD COLUMN IF NOT EXISTS modpack_url TEXT
    `;

    return NextResponse.json({ success: true, message: 'modpack_url column added' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
