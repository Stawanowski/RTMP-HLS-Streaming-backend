/*
  Warnings:

  - You are about to drop the column `isLive` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isLive";

-- CreateTable
CREATE TABLE "Live" (
    "id" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,

    CONSTRAINT "Live_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Live_id_key" ON "Live"("id");

-- AddForeignKey
ALTER TABLE "Live" ADD CONSTRAINT "Live_channelName_fkey" FOREIGN KEY ("channelName") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
