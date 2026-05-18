-- CreateTable
CREATE TABLE "GdpData" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GdpData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GdpData_countryId_year_key" ON "GdpData"("countryId", "year");

-- AddForeignKey
ALTER TABLE "GdpData" ADD CONSTRAINT "GdpData_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
