-- CreateTable
CREATE TABLE "login_trial" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "trial_count" INTEGER NOT NULL DEFAULT 0,
    "device_info" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_trial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_trial_user_id_idx" ON "login_trial"("user_id");

-- CreateIndex
CREATE INDEX "login_trial_email_idx" ON "login_trial"("email");

-- AddForeignKey
ALTER TABLE "login_trial" ADD CONSTRAINT "login_trial_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
