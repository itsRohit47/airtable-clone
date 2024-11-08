/*
  Warnings:

  - You are about to drop the column `saved` on the `View` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "View" DROP COLUMN "saved",
ADD COLUMN     "selected" BOOLEAN NOT NULL DEFAULT false;
