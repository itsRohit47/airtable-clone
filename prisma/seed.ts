import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tableId = "cm3d6s5yp001jr93ciokx3aiv";
  const rows = Array.from({ length: 100000 }, (_, i) => ({
    tableId,
    order: i + 1,
  }));

  await prisma.row.createMany({
    data: rows,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
