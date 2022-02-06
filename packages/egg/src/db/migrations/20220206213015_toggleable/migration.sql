-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "rbEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rwEnabled" BOOLEAN NOT NULL DEFAULT false;
