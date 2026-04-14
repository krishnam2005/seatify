const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestHoliday() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  try {
    await prisma.holiday.upsert({
      where: { date: tomorrow },
      update: {},
      create: {
        date: tomorrow,
        name: "Spring Tech Festival"
      }
    });

    console.log(`Successfully injected test holiday for ${tomorrow.toDateString()}!`);
  } catch (error) {
    console.error("Error adding holiday:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestHoliday();
