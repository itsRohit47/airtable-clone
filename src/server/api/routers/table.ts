import { skip } from "node:test";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { get } from "http";
import cuid from "cuid";
import { faker } from "@faker-js/faker";

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
          const cellData = existingRows.map((row) => {
            const numericValue = input.type === "number" ? null : null;
            return {
              value: input.type === "number" ? "" : "",
              numericValue,
              rowId: row.id,
              columnId: newColumn.id,
              tableId: input.tableId,
            };
          });
          await tx.cell.createMany({ data: cellData });
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
      // Find the baseId from the tableId
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        select: { baseId: true },
      });

      if (!table) {
        throw new Error("Table not found");
      }

      // Delete the table
      await ctx.db.table.delete({ where: { id: input.tableId } });

      // Find the latest table and view linked to the same base
      const latestTable = await ctx.db.table.findFirst({
        where: { baseId: table.baseId },
        orderBy: { createdAt: "desc" },
      });

      const latestView = await ctx.db.view.findFirst({
        where: { tableId: latestTable?.id },
        orderBy: { createdAt: "desc" },
      });

      return {
        latestTableId: latestTable?.id ?? null,
        latestViewId: latestView?.id ?? null,
      };
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
      // Get the highest order number from existing rows
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      const newRows = Array.from({ length: 5000 }).map((_, i) => ({
        id: cuid(), // Pre-generate unique ID
        tableId: input.tableId,
        order: (lastRow?.order ?? -1) + i + 1, // Continue from the last order
      }));

      const newCells = newRows.flatMap((row) =>
        columns.map((column) => {
          const value =
            column.type === "text"
              ? faker.person.fullName()
              : faker.number.int({ max: 1000000 }).toString();
          return {
            rowId: row.id,
            columnId: column.id,
            tableId: input.tableId,
            value,
            numericValue: column.type === "number" ? parseFloat(value) : null,
          };
        }),
      );

      // Step 1: Create rows
      await ctx.db.row.createMany({ data: newRows });

      // Step 2: Create cells
      await ctx.db.cell.createMany({ data: newCells });

      return newRows;
    }),

  add1Row: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        fakerData: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the highest order number from existing rows
      const lastRow = await ctx.db.row.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      const newRows = Array.from({ length: 1 }).map((_, i) => ({
        id: cuid(), // Pre-generate unique ID
        tableId: input.tableId,
        order: (lastRow?.order ?? -1) + i + 1, // Continue from the last order
      }));

      // Step 1: Create rows
      await ctx.db.row.createMany({ data: newRows });

      // Step 2: Generate cells
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      const newCells = newRows.flatMap((row, rowIndex) =>
        columns.map((column, colIndex) => {
          const v = input.fakerData ?? [];
          return {
            rowId: row.id,
            columnId: column.id,
            tableId: input.tableId,
            value: v[colIndex] ?? "",
            numericValue:
              column.type === "number" ? parseFloat(v[colIndex] ?? "0") : null,
          };
        }),
      );

      // Step 3: Create cells
      await ctx.db.cell.createMany({ data: newCells });

      return newRows;
    }),

  deteleTable: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.cell.deleteMany({
        where: { tableId: input.tableId },
      });
      await ctx.db.row.deleteMany({
        where: { tableId: input.tableId },
      });
      await ctx.db.column.deleteMany({
        where: { tableId: input.tableId },
      });
      return ctx.db.table.delete({
        where: { id: input.tableId },
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
      await ctx.db.cell.deleteMany({
        where: { rowId: input.rowId },
      });
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
      const numericValue = parseFloat(input.value);
      return ctx.db.cell.update({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
        data: {
          value: input.value,
          numericValue: isNaN(numericValue) ? null : numericValue,
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
        filters: z
          .array(
            z.object({
              columnId: z.string(),
              operator: z.string(),
              value: z.any(),
            }),
          )
          .optional(),
        sorts: z
          .array(
            z.object({
              columnId: z.string(),
              desc: z.boolean(),
            }),
          )
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build "where" from filters
      const filterConditions = (input.filters ?? []).map((f) => {
        let condition;
        switch (f.operator) {
          case "empty":
            condition = {
              OR: [
                { value: { equals: "" } },
                { value: { equals: null } },
                { numericValue: { equals: null } },
              ],
            };
            break;
          case "notEmpty":
            condition = {
              OR: [{ numericValue: { not: null } }],
            };
            break;
          case "empty2":
            condition = {
              OR: [{ value: null }, { value: "" }],
            };
            break;
          case "notEmpty2":
            condition = {
              AND: [{ value: { not: null } }, { value: { not: "" } }],
            };
            break;
          case "includesString":
            condition =
              f.value === ""
                ? {}
                : {
                    value: {
                      contains: f.value,
                      mode: "insensitive" as any,
                    },
                  };
            break;
          case "eq":
            condition = f.value === "" ? {} : { value: { equals: f.value } };
            break;
          case "gt":
            condition =
              f.value === ""
                ? {}
                : { numericValue: { gt: parseFloat(f.value) } };
            break;
          case "lt":
            condition =
              f.value === ""
                ? {}
                : { numericValue: { lt: parseFloat(f.value) } };
            break;
          default:
            condition = { value: f.value };
        }
        return {
          cells: {
            some: {
              columnId: f.columnId,
              ...(condition as any),
            },
          },
        };
      });

      // Fetch rows from the database
      const rows = await ctx.db.row.findMany({
        include: {
          cells: {
            include: {
              column: true,
            },
          },
        },
        where: {
          tableId: input.tableId,
          AND: [
            ...(input.search
              ? [
                  {
                    cells: {
                      some: {
                        value: { contains: input.search, mode: "insensitive" },
                      },
                    },
                  },
                ]
              : []),
            ...filterConditions,
          ],
        },
        take: input.pageSize,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      // Fetch columns for the table
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      // Transform the data into a flat structure
      let data = rows.map((row) => {
        const rowData: Record<string, string | number> = {
          id: row.id,
          order: row.order,
        };
        columns.forEach((column) => {
          const cell = row.cells.find((c) => c.column.id === column.id);
          rowData[column.id] =
            column.type === "number"
              ? (cell?.numericValue ?? "")
              : (cell?.value ?? "");
        });
        return rowData;
      });

      // Apply sorts if they exist
      if (input.sorts && input.sorts.length > 0) {
        data = data.sort((a, b) => {
          for (const sort of input.sorts!) {
            const aVal = a[sort.columnId];
            const bVal = b[sort.columnId];

            if (aVal === bVal) continue;

            if (typeof aVal === "number" && typeof bVal === "number") {
              return sort.desc ? bVal - aVal : aVal - bVal;
            }

            const comp = String(aVal).localeCompare(String(bVal));
            return sort.desc ? -comp : comp;
          }
          return 0;
        });
      }

      return {
        data,
        nextCursor: rows[rows.length - 1]?.id,
        hasNextPage: rows.length === input.pageSize,
      };
    }),

  getTotalRowsGivenTableId: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        filters: z
          .array(
            z.object({
              columnId: z.string(),
              operator: z.string(),
              value: z.any(),
            }),
          )
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Build "where" from filters
      const filterConditions = (input.filters ?? []).map((f) => {
        let condition;
        switch (f.operator) {
          case "empty":
            condition = {
              OR: [{ numericValue: { equals: null } }],
            };
            break;
          case "notEmpty":
            condition = {
              OR: [{ numericValue: { not: null } }],
            };
            break;
          case "empty2":
            condition = {
              OR: [{ value: null }, { value: "" }],
            };
            break;
          case "notEmpty2":
            condition = {
              OR: [{ value: { not: null } }, { value: { not: "" } }],
            };
            break;
          case "includesString":
            condition = {
              value: {
                contains: f.value,
                mode: "insensitive" as any,
              },
            };
            break;
          case "eq":
            condition = f.value === "" ? {} : { value: { equals: f.value } };
            break;
          case "gt":
            condition =
              f.value === ""
                ? {}
                : { numericValue: { gt: parseFloat(f.value) } };
            break;
          case "lt":
            condition =
              f.value === ""
                ? {}
                : { numericValue: { lt: parseFloat(f.value) } };
            break;
          default:
            condition = { value: f.value };
        }
        return {
          cells: {
            some: {
              columnId: f.columnId,
              ...(condition as any),
            },
          },
        };
      });

      return ctx.db.row.count({
        where: {
          tableId: input.tableId,
          AND: filterConditions,
        },
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

  // to get total matches for a search query
  getTotalMatches: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const totalMatches = await ctx.db.row.count({
        where: {
          tableId: input.tableId,
          cells: {
            some: {
              value: { contains: input.search, mode: "insensitive" },
            },
          },
        },
      });
      return { totalMatches };
    }),
});
