/**
 * Database Migration Script (using pg)
 *
 * Runs the SQL schema to create all tables and indexes
 */

import { config } from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../../.env.local') });

async function migrate() {
  console.log('🔄 Running database migrations...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  console.log('✅ Connected to database\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Remove comments and split SQL into statements
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split by semicolons, but be aware of function bodies
    // This is a simple split - for production, use a proper SQL parser
    const statements = [];
    let current = '';
    let dollarQuoteDepth = 0;

    for (const part of cleanedSchema.split(/;/)) {
      current += part;

      // Count $$ for function bodies
      const dollarCount = (current.match(/\$\$/g) || []).length;
      dollarQuoteDepth = dollarCount % 2;

      if (dollarQuoteDepth === 0 && current.trim()) {
        statements.push(current.trim());
        current = '';
      } else {
        current += ';';
      }
    }

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        await client.query(statement);

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
      } catch (error) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.code === '42710') {
          // Table or function already exists - this is fine
          continue;
        }
        console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
