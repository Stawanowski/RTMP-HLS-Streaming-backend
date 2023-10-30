-- CreateTable
CREATE TABLE "VeryficationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VeryficationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VeryficationCode_id_key" ON "VeryficationCode"("id");

-- AddForeignKey
ALTER TABLE "VeryficationCode" ADD CONSTRAINT "VeryficationCode_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
