-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "system_audit_logs" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(36) NOT NULL,
    "user_id" UUID,
    "method" VARCHAR(10) NOT NULL,
    "url" TEXT NOT NULL,
    "route" TEXT,
    "status_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "request_body" JSONB,
    "response_body" JSONB,
    "error_message" TEXT,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_audit_logs_user_id_idx" ON "system_audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "system_audit_logs_method_idx" ON "system_audit_logs"("method");

-- CreateIndex
CREATE INDEX "system_audit_logs_status_code_idx" ON "system_audit_logs"("status_code");

-- CreateIndex
CREATE INDEX "system_audit_logs_level_idx" ON "system_audit_logs"("level");

-- CreateIndex
CREATE INDEX "system_audit_logs_created_at_idx" ON "system_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "system_audit_logs_request_id_idx" ON "system_audit_logs"("request_id");
