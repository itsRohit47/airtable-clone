import { skip } from "node:test";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import z from "zod";
import { get } from "http";
import cuid from "cuid";
import { faker } from "@faker-js/faker";

export const tableRouter = createTRPCRouter({
  // for the base layout

  getviewById: protectedProcedure
    .input(z.object({ viewId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.view.findUnique({
        where: { id: input.viewId },
      });
    }),

  getTablesByBaseId: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.table.findMany({
        where: { baseId: input.baseId },
        include: { rows: false, columns: false, views: true },
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
    .input(
      z.object({
        tableId: z.string(),
        type: z.string(),
        columnId: z.string(),
        cellIds: z.array(z.string()), // Accept array of cell IDs
        rows: z.array(z.string()), // Accept array of row IDs
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // First get the highest order number from existing columns
      const lastColumn = await ctx.db.column.findFirst({
        where: { tableId: input.tableId },
        orderBy: { order: "desc" },
      });

      // Create the new column with order = last + 1
      const newColumn = await ctx.db.column.create({
        data: {
          id: input.columnId,
          name: "Untitled Column",
          defaultValue: "",
          type: input.type,
          order: (lastColumn?.order ?? -1) + 1, // If no columns exist, start at 0
          tableId: input.tableId,
        },
      });

      // Create cells using provided IDs
      if (input.rows.length > 0) {
        const cellData = input.rows.map((rowId, index) => ({
          id: input.cellIds[index],
          value: input.type === "number" ? "" : "",
          numericValue: input.type === "number" ? null : null,
          rowId: rowId,
          columnId: newColumn.id,
          tableId: input.tableId,
        }));

        await ctx.db.cell.createMany({ data: cellData });
      }

      return newColumn;
    }),

  // to add a new table to a base
  addTable: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        tableId: z.string().optional(),
        viewId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.table.create({
        data: {
          id: input.tableId ?? cuid(),
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
                id: input.viewId ?? cuid(),
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
        include: {
          views: true,
        },
      });

      return {
        table: result,
        view: result.views[0],
      };
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
    .input(z.object({ tableId: z.string(), viewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const viewCount = await ctx.db.view.count({
        where: { tableId: input.tableId },
      });
      return ctx.db.view.create({
        data: {
          id: input.viewId,
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
    .input(
      z.object({
        tableId: z.string(),
        rowIds: z.array(z.string()),
        fakerData: z.array(z.array(z.string())).optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      const newRows = input.rowIds.map((id, i) => ({
        id: id,
        tableId: input.tableId,
        order: (input.order ?? 0) + i,
      }));

      const newCells = newRows.flatMap((row, rowIndex) =>
        columns.map((column, colIndex) => {
          let value: string;
          let numericValue: number | null = null;
          switch (column.type) {
            case "number":
              const numberValue =
                input.fakerData?.[rowIndex]?.[colIndex] ??
                faker.number.int({ max: 10000 });
              value = String(numberValue);
              numericValue =
                typeof numberValue === "number"
                  ? numberValue
                  : Number(numberValue);
              break;
            case "text":
            default:
              value =
                input.fakerData?.[rowIndex]?.[colIndex] ??
                faker.person.fullName();
              break;
          }
          return {
            rowId: row.id,
            columnId: column.id,
            tableId: input.tableId,
            value: value,
            numericValue: numericValue,
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
        rowId: z.string(),
        tableId: z.string(),
        fakerData: z.array(z.string()).optional(),
        order: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newRows = Array.from({ length: 1 }).map((_, i) => ({
        id: input.rowId, // Pre-generate unique ID
        tableId: input.tableId,
        order: input.order ?? 0,
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
              column.type === "number" ? parseFloat(v[colIndex] ?? "") : null,
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

  getcellsByRowId: protectedProcedure
    .input(z.object({ rowId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.cell.findMany({
        where: { rowId: input.rowId },
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
      // First check if the cell exists
      const existingCell = await ctx.db.cell.findUnique({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
      });

      // If cell doesn't exist, create it
      if (!existingCell) {
        const column = await ctx.db.column.findUnique({
          where: { id: input.columnId },
        });

        if (!column) {
          throw new Error("Column not found");
        }

        return ctx.db.cell.create({
          data: {
            rowId: input.rowId,
            columnId: input.columnId,
            value: input.value,
            numericValue:
              column.type === "number" ? parseFloat(input.value) : null,
            tableId: column.tableId,
          },
        });
      }

      // If cell exists, update it
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
        pageSize: z.number().nullish().optional(),
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

      // First, fetch all rows that match the filters
      const allRows = await ctx.db.row.findMany({
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
      });

      // Fetch columns for the table
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      // Transform all rows into flat structure
      let transformedData = allRows.map((row) => {
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

      if (input.sorts && input.sorts.length > 0) {
        transformedData = transformedData.sort((a, b) => {
          for (const sort of input.sorts!) {
            const aVal = a[sort.columnId];
            const bVal = b[sort.columnId];

            if (aVal === bVal) continue;

            if (typeof aVal === "number" && typeof bVal === "number") {
              return sort.desc ? bVal - aVal : aVal - bVal;
            }

            const comp = (aVal ?? "")
              .toString()
              .localeCompare((bVal ?? "").toString(), undefined, {
                numeric: true,
              });
            return sort.desc ? -comp : comp;
          }
          return 0;
        });
      }

      // Apply pagination after sorting
      let paginatedData = transformedData;
      if (input.cursor) {
        const cursorIndex = transformedData.findIndex(
          (row) => row.id === input.cursor,
        );
        paginatedData = transformedData.slice(cursorIndex + 1);
      }

      if (input.pageSize) {
        paginatedData = paginatedData.slice(0, input.pageSize + 1);
      }

      const hasNextPage = paginatedData.length > (input.pageSize ?? 0);
      if (hasNextPage) {
        paginatedData.pop(); // Remove the extra item we used to check for next page
      }

      return {
        data: paginatedData,
        nextCursor: hasNextPage
          ? paginatedData[paginatedData.length - 1]?.id
          : undefined,
        hasNextPage,
      };
    }),

  getTotalRowsGivenTableId: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.row.count({
        where: {
          tableId: input.tableId,
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
