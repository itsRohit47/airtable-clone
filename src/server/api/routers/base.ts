import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import z from "zod";

export const baseRouter = createTRPCRouter({
  getAllBases: protectedProcedure.query(({ ctx }) => {
    return ctx.db.base.findMany({ where: { userId: ctx.session.user?.id } });
  }),

  createBase: protectedProcedure.mutation(async ({ input, ctx }) => {
    return ctx.db.base.create({
      data: { name: "Untitles Base", userId: ctx.session.user?.id },
    });
  }),
});
