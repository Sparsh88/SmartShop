const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Testing database connection to Neon...");
  try {
    await prisma.$connect();
    console.log("Success! Connected to database.");
    const count = await prisma.product.count();
    console.log("Total products in database:", count);
  } catch (err) {
    console.error("Database connection error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
