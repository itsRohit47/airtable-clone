import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import z from "zod";

export const baseRouter = createTRPCRouter({
  getAllBases: protectedProcedure.query(({ ctx }) => {
    return ctx.db.base.findMany({ where: { userId: ctx.session.user?.id } });
  }),

  createBase: protectedProcedure.mutation(async ({ input, ctx }) => {
    const base = await ctx.db.base.create({
      data: { name: "Untitled Base", userId: ctx.session.user?.id },
    });

    await ctx.db.table.create({
      data: {
        name: `Table ${(await ctx.db.table.count({ where: { baseId: base.id } })) + 1}`,
        baseId: base.id,

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
    return base;
  }),
});
