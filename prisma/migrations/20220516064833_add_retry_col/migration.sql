-- AlterTable
ALTER TABLE "Symbol" ADD COLUMN     "retry" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "update_at" SET DEFAULT '2000-01-01 00:00:00 +02:00',
ALTER COLUMN "get_at" SET DEFAULT '2000-01-01 00:00:00 +02:00';