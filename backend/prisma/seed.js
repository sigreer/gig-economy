/**
 * Database Seed Script
 * Seeds the database with sample data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create sample users
  console.log('Creating users...');

  const password = await bcrypt.hash('Password123', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password,
      initials: 'AJ',
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password,
      initials: 'BS',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Davis',
      password,
      initials: 'CD',
      role: 'USER',
    },
  });

  console.log(`✅ Created ${3} users\n`);

  // Create sample gigs
  console.log('Creating gigs...');

  const gig1 = await prisma.gig.create({
    data: {
      artist: 'The Midnight',
      date: new Date('2025-12-15T20:00:00Z'),
      day: 'Friday',
      venue: 'Electric Ballroom',
      location: 'London',
      addedById: user1.id,
      types: {
        create: [{ type: 'Concert' }, { type: 'Synthwave' }],
      },
    },
  });

  const gig2 = await prisma.gig.create({
    data: {
      artist: 'Amelie Lens',
      date: new Date('2025-12-20T22:00:00Z'),
      day: 'Saturday',
      venue: 'Printworks',
      location: 'London',
      addedById: user2.id,
      types: {
        create: [{ type: 'Rave' }, { type: 'Techno' }],
      },
    },
  });

  const gig3 = await prisma.gig.create({
    data: {
      artist: 'Glastonbury Festival',
      date: new Date('2026-06-24T12:00:00Z'),
      day: 'Wednesday',
      venue: 'Worthy Farm',
      location: 'Pilton, Somerset',
      addedById: user1.id,
      types: {
        create: [{ type: 'Festival' }],
      },
    },
  });

  console.log(`✅ Created ${3} gigs\n`);

  // Create sample interests
  console.log('Creating interests...');

  await prisma.interest.create({
    data: {
      gigId: gig1.id,
      userId: user2.id,
      interestLevel: 'VERY_INTERESTED',
    },
  });

  await prisma.interest.create({
    data: {
      gigId: gig1.id,
      userId: user3.id,
      interestLevel: 'INTERESTED',
    },
  });

  await prisma.interest.create({
    data: {
      gigId: gig2.id,
      userId: user1.id,
      interestLevel: 'GOING',
    },
  });

  await prisma.interest.create({
    data: {
      gigId: gig3.id,
      userId: user1.id,
      interestLevel: 'VERY_INTERESTED',
    },
  });

  await prisma.interest.create({
    data: {
      gigId: gig3.id,
      userId: user2.id,
      interestLevel: 'GOING',
    },
  });

  await prisma.interest.create({
    data: {
      gigId: gig3.id,
      userId: user3.id,
      interestLevel: 'INTERESTED',
    },
  });

  console.log(`✅ Created ${6} interests\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 Sample login credentials:');
  console.log('   Email: alice@example.com');
  console.log('   Email: bob@example.com');
  console.log('   Email: charlie@example.com');
  console.log('   Password: Password123 (for all users)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
