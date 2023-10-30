/*
  Warnings:

  - You are about to drop the column `followingSince` on the `Mod` table. All the data in the column will be lost.
  - You are about to drop the column `followingSince` on the `Vip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mod" DROP COLUMN "followingSince",
ADD COLUMN     "modSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vip" DROP COLUMN "followingSince",
ADD COLUMN     "vipSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
