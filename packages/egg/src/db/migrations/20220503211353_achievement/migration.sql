-- CreateTable
CREATE TABLE "GuildMemberAchievement" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "achId" TEXT NOT NULL,

    CONSTRAINT "GuildMemberAchievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GuildMemberAchievement" ADD CONSTRAINT "GuildMemberAchievement_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "GuildMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
