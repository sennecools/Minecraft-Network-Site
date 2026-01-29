/**
 * Database Migration Script
 *
 * Runs the SQL schema to create all tables and indexes
 */

import { sql } from './client';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons to execute each statement separately
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('COMMENT')) {
        await sql.query(statement);
        continue;
      }

      try {
        await sql.query(statement);

        // Log progress for major operations
        if (statement.includes('CREATE TABLE')) {
          const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/);
          if (match) {
            console.log(`  ✅ Created table: ${match[1]}`);
          }
        } else if (statement.includes('CREATE INDEX')) {
          const match = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/);
          if (match) {
            console.log(`  📊 Created index: ${match[1]}`);
          }
        } else if (statement.includes('CREATE TRIGGER')) {
          const match = statement.match(/CREATE TRIGGER (\w+)/);
          if (match) {
            console.log(`  🎯 Created trigger: ${match[1]}`);
          }
        } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          const match = statement.match(/CREATE OR REPLACE FUNCTION (\w+)/);
          if (match) {
            console.log(`  ⚙️  Created function: ${match[1]}`);
          }
        }
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.code === '42710') {
          // Table or function already exists - this is fine
          continue;
        }
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { migrate };
