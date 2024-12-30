import { skip } from "node:test";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { get } from "http";

export const tableRouter = createTRPCRouter({
  // for the base layout
  getTablesByBaseId: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
        include: { rows: false, columns: false },
      });
    }),

  // given a tableid, get total records
  getTableCount: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.row.count({
        where: { tableId: input.tableId },
      });
    }),

  // to add a new column to a table
  addField: protectedProcedure
    .input(z.object({ tableId: z.string(), type: z.string() }))
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
            name: "Untitled Column",
            defaultValue: "",
            type: input.type,
            order: (lastColumn?.order ?? -1) + 1, // If no columns exist, start at 0
            tableId: input.tableId,
          },
        });

        // Create cells with default values for all existing rows
        if (existingRows.length > 0) {
          await tx.cell.createMany({
            data: existingRows.map((row) => ({
              value: "",
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
          name: `Untitled Table`,
          baseId: input.baseId,
          columns: {
            create: [
              {
                name: "Untitled Column",
                defaultValue: "",
                type: "text",
                order: 0,
              },
              {
                name: "Untitled Column",
                defaultValue: "",
                type: "number",
                order: 1,
              },
            ],
          },
          views: {
            create: [
              {
                name: "Grid View",
                filters: {
                  create: [],
                },
                sorts: {
                  create: [],
                },
              },
            ],
          },
        },
      });
    }),

  // to get views for a table
  getViewsByTableId: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.view.findMany({
        where: { tableId: input.tableId },
      });
    }),

  // to get a view by id
  getViewById: protectedProcedure
    .input(z.object({ viewId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.view.findUnique({
        where: { id: input.viewId },
      });
    }),

  // to create a new view for a table
  addView: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const viewCount = await ctx.db.view.count({
        where: { tableId: input.tableId },
      });
      return ctx.db.view.create({
        data: {
          name: `Grid View ${viewCount + 1}`,
          tableId: input.tableId,
          filters: {
            create: [],
          },
          sorts: {
            create: [],
          },
        },
      });
    }),

  // to update col name
  updateColumnName: protectedProcedure
    .input(z.object({ columnId: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.column.update({
        where: { id: input.columnId },
        data: { name: input.name },
      });
    }),

  updateTableName: protectedProcedure
    .input(z.object({ tableId: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.table.update({
        where: { id: input.tableId },
        data: { name: input.name },
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
        const newRow = await tx.row.create({
          data: {
            tableId: input.tableId,
            order: (lastRow?.order ?? -1) + 1,
          },
        });

        // Create all cells at once using createMany
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

  // to add 10k rows to a table
  add10kRows: protectedProcedure
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

      // Create the rows with default values in a transaction
      return ctx.db.$transaction(async (tx) => {
        const newRows = [];
        for (let i = 0; i < 10000; i++) {
          const newRow = await tx.row.create({
            data: {
              tableId: input.tableId,
              order: (lastRow?.order ?? -1) + 1 + i,
            },
          });

          await tx.cell.createMany({
            data: columns.map((column) => ({
              value: column.type === "number" ? "" : "",
              rowId: newRow.id,
              columnId: column.id,
              tableId: input.tableId,
            })),
          });

          newRows.push(newRow);
        }

        return newRows;
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
        cursor: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortDesc: z.boolean().optional().default(false),
        pageSize: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
        orderBy: { order: "asc" },
      });

      // Get rows with cells
      const rows = await ctx.db.row.findMany({
        where: {
          tableId: input.tableId,
          cells: {
            some: {
              value: {
                contains: input.search,
              },
            },
          },
        },
        include: {
          cells: {
            include: {
              column: true,
            },
          },
        },
        take: input.pageSize,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
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
        nextCursor: rows[rows.length - 1]?.id,
        hasNextPage: rows.length === input.pageSize,
      };
    }),

  getTotalRowsGivenTableId: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.row.count({
        where: { tableId: input.tableId },
      });
    }),

  getColumnsByTableId: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
    }),

  // to sorts for a view
  getViewSorts: protectedProcedure
    .input(z.object({ viewId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.viewSort.findMany({
        where: { viewId: input.viewId },
      });
    }),

  // to delete a sort for a view
  deleteSort: protectedProcedure
    .input(z.object({ viewId: z.string(), columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewSort.delete({
        where: {
          viewId_columnId: {
            viewId: input.viewId,
            columnId: input.columnId,
          },
        },
      });
    }),

  // to add a sort for a view
  addSort: protectedProcedure
    .input(
      z.object({ viewId: z.string(), columnId: z.string(), desc: z.boolean() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewSort.create({
        data: {
          viewId: input.viewId,
          columnId: input.columnId,
          desc: input.desc,
        },
      });
    }),

  // to update a sort for a view
  updateSort: protectedProcedure
    .input(
      z.object({ viewId: z.string(), columnId: z.string(), desc: z.boolean() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewSort.update({
        where: {
          viewId_columnId: {
            viewId: input.viewId,
            columnId: input.columnId,
          },
        },
        data: {
          desc: input.desc,
        },
      });
    }),

  // to get filters for a view
  getViewFilters: protectedProcedure
    .input(z.object({ viewId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.viewFilter.findMany({
        where: { viewId: input.viewId },
      });
    }),

  // to delete a filter for a view
  deleteFilter: protectedProcedure
    .input(z.object({ viewId: z.string(), columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewFilter.delete({
        where: {
          viewId_columnId: {
            viewId: input.viewId,
            columnId: input.columnId,
          },
        },
      });
    }),

  // to add a filter for a view
  addFilter: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
        value: z.string(),
        operator: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewFilter.create({
        data: {
          viewId: input.viewId,
          columnId: input.columnId,
          operator: input.operator ?? undefined,
          value: input.value,
        },
      });
    }),

  // to update a filter for a view
  updateFilter: protectedProcedure
    .input(
      z.object({
        viewId: z.string(),
        columnId: z.string(),
        value: z.string(),
        operator: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.viewFilter.update({
        where: {
          viewId_columnId: {
            viewId: input.viewId,
            columnId: input.columnId,
          },
        },
        data: {
          value: input.value,
          operator: input.operator ?? undefined,
        },
      });
    }),
});
