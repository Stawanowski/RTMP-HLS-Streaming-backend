/*
  Warnings:

  - Added the required column `pid2` to the `Live` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Live" ADD COLUMN     "pid2" INTEGER NOT NULL;
