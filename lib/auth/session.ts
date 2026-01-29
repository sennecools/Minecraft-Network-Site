/**
 * Session Management
 *
 * Functions for creating, validating, and destroying admin sessions.
 * Uses UUID tokens stored in database with httpOnly cookies.
 */

import { v4 as uuidv4 } from 'uuid';
import { sql } from '../db/client';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
}

export interface Session {
  id: string;
  admin_user_id: number;
  expires_at: Date;
  created_at: Date;
}

/**
 * Create a new session for a user
 * @param userId - The admin user ID
 * @returns The session token
 */
export async function createSession(userId: number): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await sql`
    INSERT INTO admin_sessions (id, admin_user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt.toISOString()})
  `;

  // Update last login
  await sql`
    UPDATE admin_users
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;

  // Set cookie
  (await cookies()).set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  });

  return sessionId;
}

/**
 * Validate a session token and return the user
 * @param sessionId - The session token to validate
 * @returns The admin user if valid, null otherwise
 */
export async function validateSession(
  sessionId: string
): Promise<AdminUser | null> {
  try {
    const result = await sql`
      SELECT
        u.id,
        u.username,
        u.email,
        u.is_active
      FROM admin_sessions s
      INNER JOIN admin_users u ON s.admin_user_id = u.id
      WHERE s.id = ${sessionId}
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = true
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as AdminUser;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Get the current session from cookies
 * @returns The admin user if authenticated, null otherwise
 */
export async function getCurrentSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  return validateSession(sessionId);
}

/**
 * Destroy a session (logout)
 * @param sessionId - The session token to destroy
 */
export async function destroySession(sessionId: string): Promise<void> {
  await sql`
    DELETE FROM admin_sessions
    WHERE id = ${sessionId}
  `;

  // Clear cookie
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

/**
 * Destroy the current session from cookies
 */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    await destroySession(sessionId);
  }
}

/**
 * Clean up expired sessions (can be called by cron job)
 * @returns Number of sessions deleted
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await sql`
    DELETE FROM admin_sessions
    WHERE expires_at < CURRENT_TIMESTAMP
  `;

  return result.rowCount || 0;
}
