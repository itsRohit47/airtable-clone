import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Create a Base and Table with 6 Columns
  const base = await prisma.base.create({
    data: {
      name: "Nam's Base",
      user: {
        connect: { id: "cm3eagsbf0000yjesef0903s6" }, // Replace with actual User ID
      },
      tables: {
        create: [
          {
            name: "Sample Table",
            columns: {
              create: Array.from({ length: 6 }, (_, i) => ({
                name: `Column ${i + 1}`,
                type: "text",
                order: i + 1,
              })),
            },
          },
        ],
      },
    },
    include: {
      tables: {
        include: { columns: true },
      },
    },
  });

  const table = base.tables[0];
  if (!table) {
    throw new Error("Table not found");
  }
  const columnIds = table.columns.map((col) => col.id);

  // 2. Create 1,000 Rows without Cells
  const rowData = Array.from({ length: 15000 }, (_, i) => ({
    order: i + 1,
    tableId: table.id,
  }));

  await prisma.row.createMany({
    data: rowData,
  });

  // 3. Fetch Rows and Create Cells
  const rows = await prisma.row.findMany({
    where: { tableId: table.id },
    select: { id: true, order: true },
  });

  const cellData = rows.flatMap((row) =>
    columnIds.map((columnId, colIndex) => ({
      rowId: row.id,
      columnId: columnId,
      value: `Value Row${row.order} Col${colIndex + 1}`,
      tableId: table.id,
    })),
  );

  for (let i = 0; i < cellData.length; i += 100) {
    await prisma.cell.createMany({
      data: cellData.slice(i, i + 100),
    });
  }

  // 4. Create Views, Filters, and Sorts
  const viewsData = Array.from({ length: 3 }, (_, i) => ({
    name: `Sample View ${i + 1}`,
    tableId: table.id,
    filters: {
      create: [
        {
          columnId: columnIds[i % columnIds.length]!, // Cycle through columns for filters
          operator: "equals",
          value: `FilterValue${i + 1}`,
        },
      ],
    },
    sorts: {
      create: [
        {
          columnId: columnIds[i % columnIds.length]!,
          desc: i % 2 === 0,
        },
      ],
    },
  }));

  for (const viewData of viewsData) {
    await prisma.view.create({
      data: viewData,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
