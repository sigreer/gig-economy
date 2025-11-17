/**
 * Migration Script from JSON to PostgreSQL
 * Migrates data from frontend/db.json to PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting migration from JSON to PostgreSQL...\n');

  // Read db.json
  const dbPath = path.join(__dirname, '../../frontend/db.json');

  if (!fs.existsSync(dbPath)) {
    console.error('❌ db.json not found at:', dbPath);
    process.exit(1);
  }

  const jsonData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const gigs = jsonData.gigs || [];

  console.log(`📖 Found ${gigs.length} gigs in db.json\n`);

  // Extract unique user names from "added" and "interested" fields
  const uniqueUserNames = new Set();

  gigs.forEach(gig => {
    if (gig.added?.name) {
      uniqueUserNames.add(gig.added.name);
    }
    if (gig.interested && Array.isArray(gig.interested)) {
      gig.interested.forEach(interest => {
        if (interest.name) {
          uniqueUserNames.add(interest.name);
        }
      });
    }
  });

  console.log(`👥 Found ${uniqueUserNames.size} unique users\n`);

  // Create users
  console.log('Creating users...');
  const userMap = new Map(); // Map from name to user object
  const defaultPassword = await bcrypt.hash('GigEconomy2024!', 12);

  for (const userName of uniqueUserNames) {
    const email = userName.toLowerCase().replace(/\s+/g, '.') + '@gigeconomy.local';
    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          name: userName,
          password: defaultPassword,
          initials,
          role: 'USER',
        },
      });
      userMap.set(userName, user);
      console.log(`  ✅ Created user: ${userName} (${email})`);
    } catch (error) {
      // User might already exist
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        userMap.set(userName, existingUser);
        console.log(`  ⚠️  User already exists: ${userName}`);
      } else {
        console.error(`  ❌ Failed to create user: ${userName}`, error.message);
      }
    }
  }

  console.log(`\n✅ Created/found ${userMap.size} users\n`);

  // Create gigs
  console.log('Creating gigs...');
  let gigsCreated = 0;
  let gigsSkipped = 0;

  for (const gigData of gigs) {
    try {
      // Parse date
      let gigDate;
      try {
        gigDate = new Date(gigData.date);
        if (isNaN(gigDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (e) {
        console.log(`  ⚠️  Skipping gig with invalid date: ${gigData.artist}`);
        gigsSkipped++;
        continue;
      }

      // Get added by user
      const addedByUser = gigData.added?.name ? userMap.get(gigData.added.name) : null;

      // Parse types (can be string or array)
      const types = Array.isArray(gigData.type) ? gigData.type : [gigData.type];

      // Create gig
      const gig = await prisma.gig.create({
        data: {
          artist: gigData.artist,
          date: gigDate,
          day: gigData.day,
          venue: gigData.venue,
          location: gigData.location,
          addedById: addedByUser?.id,
          types: {
            create: types.map(type => ({ type })),
          },
        },
      });

      // Create interests
      if (gigData.interested && Array.isArray(gigData.interested)) {
        for (const interest of gigData.interested) {
          const user = userMap.get(interest.name);
          if (user) {
            // Map interest_level to enum
            let interestLevel = 'INTERESTED';
            if (interest.interest_level) {
              const level = interest.interest_level.toUpperCase().replace(/\s+/g, '_');
              if (['INTERESTED', 'VERY_INTERESTED', 'GOING'].includes(level)) {
                interestLevel = level;
              }
            }

            try {
              await prisma.interest.create({
                data: {
                  gigId: gig.id,
                  userId: user.id,
                  interestLevel,
                },
              });
            } catch (e) {
              // Interest might already exist (duplicate)
              console.log(`    ⚠️  Duplicate interest skipped for ${interest.name}`);
            }
          }
        }
      }

      gigsCreated++;
      console.log(`  ✅ Created gig: ${gigData.artist} at ${gigData.venue}`);
    } catch (error) {
      console.error(`  ❌ Failed to create gig: ${gigData.artist}`, error.message);
      gigsSkipped++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Migration completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Users created: ${userMap.size}`);
  console.log(`   Gigs created: ${gigsCreated}`);
  console.log(`   Gigs skipped: ${gigsSkipped}`);
  console.log('\n📝 Default login password: GigEconomy2024!');
  console.log('   (for all migrated users)\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
