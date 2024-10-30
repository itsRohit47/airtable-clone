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
});
