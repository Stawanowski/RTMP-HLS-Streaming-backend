/*
  Warnings:

  - A unique constraint covering the columns `[channelName]` on the table `Live` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Live" ADD COLUMN     "live" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Live_channelName_key" ON "Live"("channelName");
