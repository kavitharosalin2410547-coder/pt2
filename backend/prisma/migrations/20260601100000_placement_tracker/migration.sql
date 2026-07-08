-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('WISHLIST', 'APPLIED', 'OA_SCHEDULED', 'OA_CLEARED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_CLEARED', 'SELECTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlacementRound" AS ENUM ('NONE', 'OA', 'TECHNICAL_1', 'TECHNICAL_2', 'MANAGERIAL', 'HR', 'FINAL');

-- CreateTable
CREATE TABLE "placement_applications" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "packageLPA" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "deadlineDate" TIMESTAMP(3) NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'WISHLIST',
    "round" "PlacementRound" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "jobLink" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placement_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "placement_applications_userId_status_idx" ON "placement_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "placement_applications_userId_companyName_idx" ON "placement_applications"("userId", "companyName");

-- CreateIndex
CREATE INDEX "placement_applications_userId_role_idx" ON "placement_applications"("userId", "role");

-- CreateIndex
CREATE INDEX "placement_applications_userId_location_idx" ON "placement_applications"("userId", "location");

-- CreateIndex
CREATE INDEX "placement_applications_userId_deadlineDate_idx" ON "placement_applications"("userId", "deadlineDate");

-- AddForeignKey
ALTER TABLE "placement_applications" ADD CONSTRAINT "placement_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
