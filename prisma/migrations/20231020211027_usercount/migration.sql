-- AlterTable
ALTER TABLE "Live" ADD COLUMN     "viewers" TEXT[] DEFAULT ARRAY[]::TEXT[];
