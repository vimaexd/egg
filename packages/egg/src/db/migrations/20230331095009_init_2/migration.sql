-- CreateTable
CREATE TABLE "GuildRoleMenuOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "GuildRoleMenuOption_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RatioBattleResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "loserId" TEXT NOT NULL,
    "insults" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "RatioBattleResult_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rbEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rwEnabled" BOOLEAN NOT NULL DEFAULT false,
    "rwDjEnabled" BOOLEAN NOT NULL DEFAULT false,
    "xpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "xpMinChar" INTEGER NOT NULL DEFAULT 0,
    "xpMaxMsgPerMin" INTEGER NOT NULL DEFAULT 5,
    "xpGuildMult" REAL NOT NULL DEFAULT 1.0,
    "xpStreakMsgReq" INTEGER NOT NULL DEFAULT 500,
    "xpStreakCombo" REAL NOT NULL DEFAULT 0.1,
    "xpBoostEnabled" BOOLEAN NOT NULL DEFAULT true,
    "xpBoostMsgAmnt" BIGINT NOT NULL DEFAULT 100,
    "xpBoostMin" INTEGER NOT NULL DEFAULT 50,
    "xpBoostMax" INTEGER NOT NULL DEFAULT 100,
    "xpRbEnabled" BOOLEAN NOT NULL DEFAULT true,
    "xpRbAmount" INTEGER NOT NULL DEFAULT 50,
    "aaRoleId" TEXT NOT NULL DEFAULT '',
    "lgChReact" TEXT NOT NULL DEFAULT '',
    "lgChJoin" TEXT NOT NULL DEFAULT '',
    "bannerEnabled" BOOLEAN NOT NULL DEFAULT false,
    "bannerAlbumId" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" BIGINT NOT NULL DEFAULT 0,
    "xpMessages" BIGINT NOT NULL DEFAULT 0,
    "xpBanned" BOOLEAN NOT NULL DEFAULT false,
    "rbEnabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildMemberAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memberId" TEXT NOT NULL,
    "achId" TEXT NOT NULL,
    CONSTRAINT "GuildMemberAchievement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GuildMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildXPRoleReward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    CONSTRAINT "GuildXPRoleReward_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuildXPBlacklistedChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    CONSTRAINT "GuildXPBlacklistedChannel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
