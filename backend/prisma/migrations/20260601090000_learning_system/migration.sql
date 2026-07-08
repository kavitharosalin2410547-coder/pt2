-- CreateEnum
CREATE TYPE "DsaDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "DsaProblemStatus" AS ENUM ('SOLVED', 'PENDING', 'REVISION_NEEDED');

-- CreateEnum
CREATE TYPE "CoreCSSubject" AS ENUM ('OS', 'DBMS', 'CN', 'OOP');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVISION_NEEDED');

-- CreateEnum
CREATE TYPE "FullStackTechnology" AS ENUM ('REACT', 'ANGULAR', 'SPRING_BOOT', 'DOTNET');

-- CreateEnum
CREATE TYPE "StudySessionCategory" AS ENUM ('DSA', 'CORE_CS', 'FULL_STACK', 'APTITUDE');

-- CreateTable
CREATE TABLE "dsa_problems" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "DsaDifficulty" NOT NULL,
    "status" "DsaProblemStatus" NOT NULL DEFAULT 'PENDING',
    "leetcodeLink" TEXT,
    "youtubeLink" TEXT,
    "notes" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "lastSolvedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsa_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core_cs_progress" (
    "id" TEXT NOT NULL,
    "subject" "CoreCSSubject" NOT NULL,
    "topic" TEXT NOT NULL,
    "status" "LearningStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "core_cs_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "full_stack_progress" (
    "id" TEXT NOT NULL,
    "technology" "FullStackTechnology" NOT NULL,
    "status" "LearningStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "full_stack_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "category" "StudySessionCategory" NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dsa_problems_userId_topic_idx" ON "dsa_problems"("userId", "topic");

-- CreateIndex
CREATE INDEX "dsa_problems_userId_status_idx" ON "dsa_problems"("userId", "status");

-- CreateIndex
CREATE INDEX "dsa_problems_userId_difficulty_idx" ON "dsa_problems"("userId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "core_cs_progress_userId_subject_topic_key" ON "core_cs_progress"("userId", "subject", "topic");

-- CreateIndex
CREATE INDEX "core_cs_progress_userId_subject_idx" ON "core_cs_progress"("userId", "subject");

-- CreateIndex
CREATE INDEX "core_cs_progress_userId_status_idx" ON "core_cs_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "full_stack_progress_userId_technology_key" ON "full_stack_progress"("userId", "technology");

-- CreateIndex
CREATE INDEX "full_stack_progress_userId_status_idx" ON "full_stack_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "study_sessions_userId_date_idx" ON "study_sessions"("userId", "date");

-- CreateIndex
CREATE INDEX "study_sessions_userId_category_idx" ON "study_sessions"("userId", "category");

-- AddForeignKey
ALTER TABLE "dsa_problems" ADD CONSTRAINT "dsa_problems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_cs_progress" ADD CONSTRAINT "core_cs_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "full_stack_progress" ADD CONSTRAINT "full_stack_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
