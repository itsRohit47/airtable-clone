/*
  Warnings:

  - The `value` column on the `Cell` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Cell" DROP COLUMN "value",
ADD COLUMN     "value" JSONB;

-- DropEnum
DROP TYPE "CellType";

-- CreateIndex
CREATE INDEX "Cell_value_idx" ON "Cell"("value");
