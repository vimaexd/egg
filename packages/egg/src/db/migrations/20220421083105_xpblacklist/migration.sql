-- CreateTable
CREATE TABLE "GuildXPBlacklistedChannel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "GuildXPBlacklistedChannel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuildXPBlacklistedChannel" ADD CONSTRAINT "GuildXPBlacklistedChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
