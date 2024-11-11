/*
  Warnings:

  - The primary key for the `ViewSort` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ViewSort` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ViewSort` table. All the data in the column will be lost.
  - Added the required column `desc` to the `ViewSort` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ViewSort" DROP CONSTRAINT "ViewSort_pkey",
DROP COLUMN "id",
DROP COLUMN "order",
ADD COLUMN     "desc" BOOLEAN NOT NULL,
ADD CONSTRAINT "ViewSort_pkey" PRIMARY KEY ("viewId", "columnId");
