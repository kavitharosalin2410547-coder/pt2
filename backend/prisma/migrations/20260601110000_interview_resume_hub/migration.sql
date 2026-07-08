-- CreateEnum
CREATE TYPE "InterviewCategory" AS ENUM ('HR_INTERVIEW', 'BEHAVIORAL', 'DSA_INTERVIEW', 'CORE_CS_INTERVIEW', 'SYSTEM_DESIGN', 'FULL_STACK_INTERVIEW');

-- CreateEnum
CREATE TYPE "InterviewDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "InterviewQuestionStatus" AS ENUM ('NOT_STARTED', 'PRACTICED', 'MASTERED');

-- CreateEnum
CREATE TYPE "MockInterviewType" AS ENUM ('HR_INTERVIEW', 'BEHAVIORAL', 'DSA_INTERVIEW', 'CORE_CS_INTERVIEW', 'SYSTEM_DESIGN', 'FULL_STACK_INTERVIEW');

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" "InterviewCategory" NOT NULL,
    "difficulty" "InterviewDifficulty" NOT NULL,
    "answerNotes" TEXT,
    "userNotes" TEXT,
    "status" "InterviewQuestionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "interviewType" "MockInterviewType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_versions" (
    "id" TEXT NOT NULL,
    "resumeName" TEXT NOT NULL,
    "resumeVersion" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "lastUpdatedDate" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT,
    "fileMimeType" TEXT,
    "fileData" TEXT,
    "checklistProjects" BOOLEAN NOT NULL DEFAULT false,
    "checklistSkills" BOOLEAN NOT NULL DEFAULT false,
    "checklistEducation" BOOLEAN NOT NULL DEFAULT false,
    "checklistExperience" BOOLEAN NOT NULL DEFAULT false,
    "checklistAchievements" BOOLEAN NOT NULL DEFAULT false,
    "checklistCertifications" BOOLEAN NOT NULL DEFAULT false,
    "atsContactInformation" BOOLEAN NOT NULL DEFAULT false,
    "atsSkillsSection" BOOLEAN NOT NULL DEFAULT false,
    "atsProjectsSection" BOOLEAN NOT NULL DEFAULT false,
    "atsKeywords" BOOLEAN NOT NULL DEFAULT false,
    "atsFormatting" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_questions_userId_category_idx" ON "interview_questions"("userId", "category");

-- CreateIndex
CREATE INDEX "interview_questions_userId_status_idx" ON "interview_questions"("userId", "status");

-- CreateIndex
CREATE INDEX "interview_questions_userId_difficulty_idx" ON "interview_questions"("userId", "difficulty");

-- CreateIndex
CREATE INDEX "mock_interviews_userId_date_idx" ON "mock_interviews"("userId", "date");

-- CreateIndex
CREATE INDEX "mock_interviews_userId_interviewType_idx" ON "mock_interviews"("userId", "interviewType");

-- CreateIndex
CREATE INDEX "resume_versions_userId_targetRole_idx" ON "resume_versions"("userId", "targetRole");

-- CreateIndex
CREATE INDEX "resume_versions_userId_lastUpdatedDate_idx" ON "resume_versions"("userId", "lastUpdatedDate");

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
