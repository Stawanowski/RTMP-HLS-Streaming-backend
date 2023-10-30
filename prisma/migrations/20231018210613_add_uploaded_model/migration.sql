-- CreateTable
CREATE TABLE "Uploaded" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "onChannel" TEXT NOT NULL,

    CONSTRAINT "Uploaded_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Uploaded_id_key" ON "Uploaded"("id");

-- AddForeignKey
ALTER TABLE "Uploaded" ADD CONSTRAINT "Uploaded_onChannel_fkey" FOREIGN KEY ("onChannel") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
