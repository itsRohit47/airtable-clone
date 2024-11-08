import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import z from "zod";

export const baseRouter = createTRPCRouter({
  // for the dashboard
  getAllBases: protectedProcedure.query(({ ctx }) => {
    return ctx.db.base.findMany({
      where: { userId: ctx.session.user?.id },
      include: { tables: { select: { id: true } } },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Base id to base name
  baseIdToName: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .query(({ input, ctx }) => {
      const data = ctx.db.base.findUnique({
        where: { id: input.baseId },
      });
      return data;
    }),

  // to create a new base for the user to work with tables
  createBase: protectedProcedure.mutation(async ({ input, ctx }) => {
    const base = await ctx.db.base.create({
      data: {
        name: "Untitled Base",
        userId: ctx.session.user?.id ?? "",
      },
    });

    const table = await ctx.db.table.create({
      data: {
        name: `Table ${(await ctx.db.table.count({ where: { baseId: base.id } })) + 1}`,
        baseId: base.id,
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

    const columns = await ctx.db.column.findMany({
      where: { tableId: table.id },
    });

    await ctx.db.row.create({
      data: {
        tableId: table.id,
        order: 0,
        cells: {
          create: [
            { value: "", columnId: columns[0]?.id ?? "", tableId: table.id },
            { value: "", columnId: columns[1]?.id ?? "", tableId: table.id },
          ],
        },
      },
    });
    return { base, firstTableId: table.id };
  }),

  // to delete a base and all its tables and columns and rows from the database
  deleteBase: protectedProcedure
    .input(z.object({ baseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.base.delete({ where: { id: input.baseId } });
    }),
});
