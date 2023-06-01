-- CreateTable
CREATE TABLE "PortalRelationship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildIdA" TEXT NOT NULL,
    "guildIdB" TEXT NOT NULL,
    "channelA" TEXT NOT NULL,
    "channelB" TEXT NOT NULL
);
