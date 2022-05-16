/*
  Warnings:

  - You are about to drop the column `expense` on the `SymbolExplain` table. All the data in the column will be lost.
  - You are about to drop the column `yield` on the `SymbolExplain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Symbol" ALTER COLUMN "update_at" SET DEFAULT '2000-01-01 00:00:00 +02:00',
ALTER COLUMN "get_at" SET DEFAULT '2000-01-01 00:00:00 +02:00';

-- AlterTable
ALTER TABLE "SymbolExplain" DROP COLUMN "expense",
DROP COLUMN "yield",
ADD COLUMN     "expense_per" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "yield_per" DECIMAL(5,2) DEFAULT 0;
