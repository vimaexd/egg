-- AlterTable
ALTER TABLE "Guild" ALTER COLUMN "xpBoostMsgAmnt" SET DEFAULT 100,
ALTER COLUMN "xpBoostMsgAmnt" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "GuildMember" ADD COLUMN     "rbEnabled" BOOLEAN NOT NULL DEFAULT true;
