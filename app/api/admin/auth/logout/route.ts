/**
 * Admin Logout API
 * POST /api/admin/auth/logout - Destroy admin session
 */

import { NextResponse } from 'next/server';
import { destroyCurrentSession } from '@/lib/auth/session';

export async function POST() {
  try {
    await destroyCurrentSession();

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
