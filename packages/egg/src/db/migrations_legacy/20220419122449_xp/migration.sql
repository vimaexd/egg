-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "xpBoostEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "xpBoostMax" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "xpBoostMin" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "xpBoostMsgAmnt" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "xpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "xpMaxMsgPerMin" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "xpMinChar" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "xpRbAmount" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "xpRbEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" BIGINT NOT NULL DEFAULT 0,
    "xpBanned" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GuildXPRoleReward" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "GuildXPRoleReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_id_key" ON "GuildMember"("id");

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildXPRoleReward" ADD CONSTRAINT "GuildXPRoleReward_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
