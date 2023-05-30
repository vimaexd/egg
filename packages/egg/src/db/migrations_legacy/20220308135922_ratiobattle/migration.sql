-- CreateTable
CREATE TABLE "RatioBattleResult" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "insults" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RatioBattleResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RatioBattleResult" ADD CONSTRAINT "RatioBattleResult_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
