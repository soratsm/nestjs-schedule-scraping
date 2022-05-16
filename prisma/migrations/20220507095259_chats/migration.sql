/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Answers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Answers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Questions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answers" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Questions" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Symbol" ALTER COLUMN "update_at" SET DEFAULT '2000-01-01 00:00:00 +02:00',
ALTER COLUMN "get_at" SET DEFAULT '2000-01-01 00:00:00 +02:00';
