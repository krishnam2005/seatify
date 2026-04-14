const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create 40 Designated Seats and 10 Floating Seats
  const seats = [];
  for (let i = 1; i <= 40; i++) {
    seats.push({ name: `D${i}`, type: 'DESIGNATED' });
  }
  for (let i = 1; i <= 10; i++) {
    seats.push({ name: `F${i}`, type: 'FLOATING' });
  }

  await prisma.seat.createMany({
    data: seats,
    skipDuplicates: true,
  });

  // Create Users (10 squads, 8 members per squad, 2 batches)
  const users = [];
  let userCount = 1;
  for (let squadId = 1; squadId <= 10; squadId++) {
    // 5 squads batch 1, 5 squads batch 2
    const batchId = squadId <= 5 ? 1 : 2;
    for (let member = 1; member <= 8; member++) {
      users.push({
        name: `User ${userCount}`,
        email: `user${userCount}@smartbooking.com`,
        squadId,
        batchId,
      });
      userCount++;
    }
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log('Seeded successfully: 50 seats, 80 users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
