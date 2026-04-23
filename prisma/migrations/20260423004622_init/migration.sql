-- CreateEnum
CREATE TYPE "IncomeFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'irregular');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('approved', 'approved_with_risk', 'denied');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_data" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "reference_month" DATE NOT NULL,
    "monthly_income" DECIMAL(12,2) NOT NULL,
    "income_frequency" "IncomeFrequency" NOT NULL,
    "monthly_expenses" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score_id" UUID NOT NULL,
    "status" "DecisionStatus" NOT NULL,
    "credit_limit" DECIMAL(12,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "financial_data_user_id_idx" ON "financial_data"("user_id");

-- CreateIndex
CREATE INDEX "financial_data_reference_month_idx" ON "financial_data"("reference_month");

-- CreateIndex
CREATE UNIQUE INDEX "financial_data_user_id_reference_month_key" ON "financial_data"("user_id", "reference_month");

-- CreateIndex
CREATE INDEX "scores_user_id_idx" ON "scores"("user_id");

-- CreateIndex
CREATE INDEX "decisions_user_id_idx" ON "decisions"("user_id");

-- CreateIndex
CREATE INDEX "decisions_score_id_idx" ON "decisions"("score_id");

-- AddForeignKey
ALTER TABLE "financial_data" ADD CONSTRAINT "financial_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_score_id_fkey" FOREIGN KEY ("score_id") REFERENCES "scores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
