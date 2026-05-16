-- CreateTable
CREATE TABLE "Country" (
    "id" SERIAL NOT NULL,
    "iso3" VARCHAR(3) NOT NULL,
    "iso2" VARCHAR(2),
    "name" TEXT NOT NULL,
    "region" TEXT,
    "incomeLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopulationData" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "value" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopulationData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_iso3_key" ON "Country"("iso3");

-- CreateIndex
CREATE UNIQUE INDEX "PopulationData_countryId_year_key" ON "PopulationData"("countryId", "year");

-- AddForeignKey
ALTER TABLE "PopulationData" ADD CONSTRAINT "PopulationData_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
