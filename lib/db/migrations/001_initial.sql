-- Minecraft Network Site - Database Schema
-- Version: 1.0.0
-- Description: Complete database schema for servers, analytics, announcements, and admin authentication

-- ============================================================================
-- SERVERS TABLE
-- Replaces hardcoded lib/servers.ts with database-driven server configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS servers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50),
  ip VARCHAR(255) NOT NULL,
  port INTEGER NOT NULL DEFAULT 25565,
  description TEXT NOT NULL,
  long_description TEXT,
  modpack_version VARCHAR(50),
  minecraft_version VARCHAR(50),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying active servers
CREATE INDEX IF NOT EXISTS idx_servers_active ON servers(is_active, display_order);

-- ============================================================================
-- SERVER ANALYTICS TABLE
-- Time-series data for tracking server status, player counts, and performance
-- Collected every 5 minutes via Vercel Cron Job
-- ============================================================================

CREATE TABLE IF NOT EXISTS server_analytics (
  id SERIAL PRIMARY KEY,
  server_id VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  online BOOLEAN NOT NULL,
  player_count INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 0,
  latency INTEGER,
  version VARCHAR(100),
  CONSTRAINT fk_analytics_server FOREIGN KEY (server_id)
    REFERENCES servers(id) ON DELETE CASCADE
);

-- Indexes for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_analytics_server_time ON server_analytics(server_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON server_analytics(timestamp DESC);

-- ============================================================================
-- ANNOUNCEMENTS TABLE
-- News, updates, maintenance notices, and event announcements
-- ============================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100) NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_published BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  server_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  CONSTRAINT fk_announcement_server FOREIGN KEY (server_id)
    REFERENCES servers(id) ON DELETE SET NULL
);

-- Index for querying published announcements
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned, is_published);

-- ============================================================================
-- ADMIN USERS TABLE
-- Simple authentication for admin dashboard access
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for username lookups during login
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- ============================================================================
-- ADMIN SESSIONS TABLE
-- Session management for admin authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR(255) PRIMARY KEY,
  admin_user_id INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (admin_user_id)
    REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Indexes for session validation and cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON admin_sessions(admin_user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to servers table
DROP TRIGGER IF EXISTS update_servers_updated_at ON servers;
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to announcements table
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up expired sessions (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < CURRENT_TIMESTAMP;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE servers IS 'Minecraft servers configuration and metadata';
COMMENT ON TABLE server_analytics IS 'Time-series data for server status and player counts';
COMMENT ON TABLE announcements IS 'News and updates for the community';
COMMENT ON TABLE admin_users IS 'Admin accounts for dashboard access';
COMMENT ON TABLE admin_sessions IS 'Active admin sessions for authentication';

COMMENT ON COLUMN servers.features IS 'JSON array of server features/highlights';
COMMENT ON COLUMN servers.display_order IS 'Order for displaying servers (lower = first)';
COMMENT ON COLUMN announcements.type IS 'Type: general, server-update, maintenance, event';
COMMENT ON COLUMN announcements.is_pinned IS 'Pinned announcements appear at the top';
