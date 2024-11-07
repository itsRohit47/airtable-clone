/*
  Warnings:

  - Added the required column `color` to the `Base` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Base" ADD COLUMN     "color" TEXT NOT NULL;
