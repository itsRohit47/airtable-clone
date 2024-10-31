import { createTRPCRouter, protectedProcedure } from "../trpc";
import z, { ZodRecord } from "zod";

export const tableRouter = createTRPCRouter({
  // for the dashboard
  getTablesByBaseId: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
        include: { rows: true, columns: true },
      });
    }),

  // to add a new column to a table
  addField: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.column.create({
        data: {
          name: "New Column",
          type: "text",
          order: 0,
          tableId: input.tableId,
        },
      });
    }),

  // to add a new table to a base
  addTable: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.table.create({
        data: {
          name: `Table ${(await ctx.db.table.count({ where: { baseId: input.baseId } })) + 1}`,
          baseId: input.baseId,
          columns: {
            create: [
              {
                name: "Column 1",
                type: "text",
                order: 0,
              },
              {
                name: "Column 2",
                type: "number",
                order: 1,
              },
            ],
          },
        },
      });
    }),

  // to delete a table from a base
  deleteTable: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.table.delete({ where: { id: input.tableId } });
    }),

  // to delete a column from a table
  deleteColumn: protectedProcedure
    .input(z.object({ columnId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.column.delete({ where: { id: input.columnId } });
    }),

  // to add a new row to a table
  addRow: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get all columns for this table
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });

      // Get the highest order number for rows
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      // Create the row with default values in a transaction
      return ctx.db.$transaction(async (tx) => {
        // Create the row
        const newRow = await tx.row.create({
          data: {
            tableId: input.tableId,
            order: (lastRow?.order ?? -1) + 1,
          },
        });

        // Create cells with default values
        await tx.cell.createMany({
          data: columns.map((column) => ({
            value: column.type === "number" ? "0" : "New Entry",
            rowId: newRow.id,
            columnId: column.id,
            tableId: input.tableId,
          })),
        });

        return newRow;
      });
    }),

  // to delete a row from a table
  deleteRow: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        rowId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.row.delete({
        where: { id: input.rowId },
      });
    }),

  // server/routers/table.ts
  getData: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        page: z.number().optional().default(0),
        pageSize: z.number().optional().default(50),
        sortBy: z.string().optional(),
        sortDesc: z.boolean().optional().default(false),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify table access
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: { base: true },
      });

      if (!table || table.base.userId !== ctx.session.user.id) {
        throw new Error("Table not found or unauthorized");
      }

      // Get columns first
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });

      // Build the where clause for search
      const searchCondition = input.search
        ? {
            cells: {
              some: {
                value: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            },
          }
        : {};

      // Get total count for pagination
      const totalRows = await ctx.db.row.count({
        where: {
          tableId: input.tableId,
          ...searchCondition,
        },
      });

      // Get rows with pagination
      const rows = await ctx.db.row.findMany({
        where: {
          tableId: input.tableId,
          ...searchCondition,
        },
        include: {
          cells: {
            include: {
              column: true,
            },
          },
        },
        orderBy: {
          [input.sortBy ?? "order"]: input.sortDesc ? "desc" : "asc",
        },
        skip: input.page * input.pageSize,
        take: input.pageSize,
      });

      // Transform the data into a flat structure
      const data = rows.map((row) => {
        const rowData: Record<string, string | number> = { id: row.id };
        columns.forEach((column) => {
          const cell = row.cells.find((c) => c.column.id === column.id);
          rowData[column.id] = cell?.value ?? "";
        });
        return rowData;
      });

      return {
        data,
        columns,
        pagination: {
          totalRows,
          totalPages: Math.ceil(totalRows / input.pageSize),
          page: input.page,
          pageSize: input.pageSize,
        },
      };
    }),
});
