/*
  Warnings:

  - You are about to drop the column `name` on the `agents` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "agents_name_key";

-- AlterTable
ALTER TABLE "agents" DROP COLUMN "name";
