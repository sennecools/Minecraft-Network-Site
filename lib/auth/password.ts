/**
 * Password Utilities
 *
 * Functions for hashing and verifying passwords using bcrypt.
 * Uses a cost factor of 12 for strong security.
 */

import * as bcrypt from 'bcryptjs';

/**
 * Hash a plaintext password
 * @param password - The plaintext password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plaintext password against a hash
 * @param password - The plaintext password to check
 * @param hash - The hashed password to compare against
 * @returns True if the password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
