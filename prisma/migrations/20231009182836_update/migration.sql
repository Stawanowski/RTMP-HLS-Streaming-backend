-- AlterTable
ALTER TABLE "Live" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Stream...';

-- CreateTable
CREATE TABLE "Vip" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "followingSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "followingSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mod" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "followingSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vip" ADD CONSTRAINT "Vip_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vip" ADD CONSTRAINT "Vip_channel_fkey" FOREIGN KEY ("channel") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_channel_fkey" FOREIGN KEY ("channel") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mod" ADD CONSTRAINT "Mod_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mod" ADD CONSTRAINT "Mod_channel_fkey" FOREIGN KEY ("channel") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
