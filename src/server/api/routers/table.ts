import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";

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
      // First get the highest order number from existing columns
      const lastColumn = await ctx.db.column.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      // Get all existing rows for this table
      const existingRows = await ctx.db.row.findMany({
        where: { tableId: input.tableId },
      });

      // Create the new column and cells in a transaction
      return ctx.db.$transaction(async (tx) => {
        // Create the new column with order = last + 1
        const newColumn = await tx.column.create({
          data: {
            name: "New Column",
            type: "text",
            order: (lastColumn?.order ?? -1) + 1, // If no columns exist, start at 0
            tableId: input.tableId,
          },
        });

        // Create cells with default values for all existing rows
        if (existingRows.length > 0) {
          await tx.cell.createMany({
            data: existingRows.map((row) => ({
              value: newColumn.type === "number" ? "0" : "New Entry",
              rowId: row.id,
              columnId: newColumn.id,
              tableId: input.tableId,
            })),
          });
        }

        return newColumn;
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
            value: column.type === "number" ? "" : "",
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

  // update a cell value
  updateCell: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
        columnId: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cell.update({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        data: {
          value: input.value,
        },
      });
    }),

  // get table data
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
        rows,
        pagination: {
          totalRows,
          totalPages: Math.ceil(totalRows / input.pageSize),
          page: input.page,
          pageSize: input.pageSize,
        },
      };
    }),
});
