/**
 * Database Seed Script
 *
 * This script seeds the database with:
 * 1. Existing server data from lib/servers.ts
 * 2. Initial admin user (default credentials)
 *
 * Usage:
 *   npx ts-node lib/db/seed.ts
 *   or
 *   node --loader ts-node/esm lib/db/seed.ts
 */

import { sql } from './client';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ========================================================================
    // 1. SEED SERVERS
    // ========================================================================
    console.log('📡 Seeding servers...');

    const servers = [
      {
        id: 'atm10',
        name: 'All the Mods 10',
        short_name: 'ATM10',
        ip: 'atm10.sennerd.com',
        port: 25565,
        description: 'Experience the ultimate kitchen sink modpack with over 500 mods.',
        long_description:
          'All the Mods 10 is the latest iteration of the popular kitchen sink modpack series. Featuring over 500 carefully curated mods, ATM10 offers an unparalleled Minecraft experience with tech, magic, exploration, and automation at your fingertips.',
        features: [
          '500+ Carefully Curated Mods',
          'Regular Updates & Bug Fixes',
          'Active Community Support',
          'Custom Quests & Progression',
          'Performance Optimized',
        ],
        modpack_version: '1.0.0',
        minecraft_version: '1.21.1',
        display_order: 1,
      },
      {
        id: 'sens-additions',
        name: "Sen's Additions",
        short_name: 'Sens',
        ip: 'sens.sennerd.com',
        port: 25567,
        description: 'A custom modpack experience crafted by Sen with unique content.',
        long_description:
          "Sen's Additions is a hand-crafted modpack that combines the best mods with custom content created specifically for this server. Experience unique gameplay mechanics, custom items, and exclusive features you won't find anywhere else.",
        features: [
          'Custom Exclusive Content',
          'Unique Gameplay Experience',
          'Balanced Progression System',
          'Regular Content Updates',
          'Community-Driven Development',
        ],
        modpack_version: '1.0.0',
        minecraft_version: '1.21.1',
        display_order: 2,
      },
    ];

    for (const server of servers) {
      await sql`
        INSERT INTO servers (
          id, name, short_name, ip, port, description, long_description,
          features, modpack_version, minecraft_version, display_order, is_active
        )
        VALUES (
          ${server.id},
          ${server.name},
          ${server.short_name},
          ${server.ip},
          ${server.port},
          ${server.description},
          ${server.long_description},
          ${JSON.stringify(server.features)}::jsonb,
          ${server.modpack_version},
          ${server.minecraft_version},
          ${server.display_order},
          true
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          short_name = EXCLUDED.short_name,
          ip = EXCLUDED.ip,
          port = EXCLUDED.port,
          description = EXCLUDED.description,
          long_description = EXCLUDED.long_description,
          features = EXCLUDED.features,
          modpack_version = EXCLUDED.modpack_version,
          minecraft_version = EXCLUDED.minecraft_version,
          display_order = EXCLUDED.display_order,
          updated_at = CURRENT_TIMESTAMP
      `;
      console.log(`  ✅ Seeded server: ${server.name}`);
    }

    // ========================================================================
    // 2. SEED INITIAL ADMIN USER
    // ========================================================================
    console.log('\n👤 Seeding admin user...');

    const defaultUsername = 'admin';
    const defaultPassword = 'changeme123'; // User MUST change this!
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    await sql`
      INSERT INTO admin_users (username, password_hash, email, is_active)
      VALUES (${defaultUsername}, ${passwordHash}, 'admin@example.com', true)
      ON CONFLICT (username) DO NOTHING
    `;

    console.log(`  ✅ Created admin user: ${defaultUsername}`);
    console.log(`  🔐 Default password: ${defaultPassword}`);
    console.log(`  ⚠️  IMPORTANT: Change this password after first login!\n`);

    // ========================================================================
    // 3. SEED SAMPLE ANNOUNCEMENT
    // ========================================================================
    console.log('📰 Seeding sample announcement...');

    await sql`
      INSERT INTO announcements (
        title, content, author, type, is_published, is_pinned, published_at
      )
      VALUES (
        'Welcome to Sen''s Network!',
        'We''re excited to launch our new website with a fresh design and powerful admin dashboard. Stay tuned for updates on server events, maintenance, and new features!',
        'Sen',
        'general',
        true,
        true,
        CURRENT_TIMESTAMP
      )
    `;

    console.log('  ✅ Created welcome announcement\n');

    // ========================================================================
    // COMPLETE
    // ========================================================================
    console.log('✅ Database seeding completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Set environment variables (POSTGRES_URL, SESSION_SECRET, CRON_SECRET)');
    console.log('2. Log in to /admin/login with username: admin, password: changeme123');
    console.log('3. Change the default password immediately');
    console.log('4. Start building the admin dashboard\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { seed };
