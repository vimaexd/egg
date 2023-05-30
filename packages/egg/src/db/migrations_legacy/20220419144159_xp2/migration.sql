/*
  Warnings:

  - Added the required column `userId` to the `GuildMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "GuildMember_id_key";

-- AlterTable
ALTER TABLE "GuildMember" ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id");
