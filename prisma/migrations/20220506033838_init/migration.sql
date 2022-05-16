-- CreateTable
CREATE TABLE "Symbol" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT E'en_etf',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01 00:00:00 +02:00',
    "get_at" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01 00:00:00 +02:00',

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymbolExplain" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "summary" TEXT,
    "comment" TEXT,
    "tags" TEXT,
    "issuer" TEXT,
    "yield" DECIMAL(5,2) DEFAULT 0,
    "expense" DECIMAL(5,2) DEFAULT 0,
    "competing_etf" TEXT,

    CONSTRAINT "SymbolExplain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymbolCountry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "per" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "SymbolCountry_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "SymbolHold" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "per" DECIMAL(5,2) NOT NULL,
    "holdId" TEXT,

    CONSTRAINT "SymbolHold_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "SymbolSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "per" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "SymbolSection_pkey" PRIMARY KEY ("id","name")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "nextId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id","order")
);

-- AddForeignKey
ALTER TABLE "SymbolExplain" ADD CONSTRAINT "SymbolExplain_id_fkey" FOREIGN KEY ("id") REFERENCES "Symbol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymbolCountry" ADD CONSTRAINT "SymbolCountry_id_fkey" FOREIGN KEY ("id") REFERENCES "Symbol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymbolHold" ADD CONSTRAINT "SymbolHold_id_fkey" FOREIGN KEY ("id") REFERENCES "Symbol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymbolSection" ADD CONSTRAINT "SymbolSection_id_fkey" FOREIGN KEY ("id") REFERENCES "Symbol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_id_fkey" FOREIGN KEY ("id") REFERENCES "Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
