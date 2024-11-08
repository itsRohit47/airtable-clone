/*
  Warnings:

  - You are about to drop the column `color` on the `Base` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_tableId_fkey";

-- DropForeignKey
ALTER TABLE "ViewFilter" DROP CONSTRAINT "ViewFilter_viewId_fkey";

-- DropForeignKey
ALTER TABLE "ViewSort" DROP CONSTRAINT "ViewSort_viewId_fkey";

-- AlterTable
ALTER TABLE "Base" DROP COLUMN "color";

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewFilter" ADD CONSTRAINT "ViewFilter_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViewSort" ADD CONSTRAINT "ViewSort_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;
