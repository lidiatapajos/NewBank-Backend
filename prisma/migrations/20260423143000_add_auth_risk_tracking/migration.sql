-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "users"
    ALTER COLUMN "cpf" DROP NOT NULL,
    ADD COLUMN "cpf_hash" TEXT,
    ADD COLUMN "cpf_encrypted" TEXT,
    ADD COLUMN "password_hash" TEXT,
    ADD COLUMN "risk_level" "RiskLevel" NOT NULL DEFAULT 'low',
    ADD COLUMN "risk_flagged_at" TIMESTAMP(3),
    ADD COLUMN "last_login_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "login_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "ip" TEXT NOT NULL,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'low',
    "risk_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ips" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ip" TEXT NOT NULL,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "login_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_ips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_hash_key" ON "users"("cpf_hash");

-- CreateIndex
CREATE INDEX "login_events_ip_created_at_idx" ON "login_events"("ip", "created_at");

-- CreateIndex
CREATE INDEX "login_events_user_id_created_at_idx" ON "login_events"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_ips_user_id_ip_key" ON "user_ips"("user_id", "ip");

-- CreateIndex
CREATE INDEX "user_ips_ip_last_seen_at_idx" ON "user_ips"("ip", "last_seen_at");

-- CreateIndex
CREATE INDEX "user_ips_user_id_last_seen_at_idx" ON "user_ips"("user_id", "last_seen_at");

-- AddForeignKey
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ips" ADD CONSTRAINT "user_ips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
