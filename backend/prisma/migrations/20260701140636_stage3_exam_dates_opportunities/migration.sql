-- CreateEnum
CREATE TYPE "ExamDateType" AS ENUM ('PLACEMENT', 'EXAM', 'INTERVIEW', 'CONTEST');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('HACKATHON', 'INTERNSHIP', 'CONTEST', 'FELLOWSHIP');

-- CreateTable
CREATE TABLE "exam_dates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ExamDateType" NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "link" TEXT NOT NULL,
    "prizePool" TEXT,
    "teamSize" TEXT,
    "mode" TEXT,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_dates_userId_date_idx" ON "exam_dates"("userId", "date");

-- CreateIndex
CREATE INDEX "opportunities_userId_type_idx" ON "opportunities"("userId", "type");

-- CreateIndex
CREATE INDEX "opportunities_userId_registrationDeadline_idx" ON "opportunities"("userId", "registrationDeadline");

-- AddForeignKey
ALTER TABLE "exam_dates" ADD CONSTRAINT "exam_dates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
