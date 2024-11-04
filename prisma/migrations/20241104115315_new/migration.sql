/*
  Warnings:

  - Made the column `defaultValue` on table `Column` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "defaultValue" SET NOT NULL;
