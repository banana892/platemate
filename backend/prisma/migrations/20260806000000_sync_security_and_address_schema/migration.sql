-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT', 'PASSWORD_CHANGED', 'ACCOUNT_LOCKED', 'TOKEN_REVOKED', 'ADMIN_ACTION', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED', 'UPLOAD_REJECTED', 'PERMISSION_DENIED');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIALLY_REFUNDED';

-- DropIndex
DROP INDEX IF EXISTS "payments_transaction_id_key";

-- AlterTable
ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "formatted_address" TEXT,
ADD COLUMN IF NOT EXISTS "house_number" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "recipient_name" TEXT,
ALTER COLUMN "street" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cuisines" ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "public_id" TEXT;

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "public_id" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN IF EXISTS "gateway_response",
DROP COLUMN IF EXISTS "paid_at",
DROP COLUMN IF EXISTS "transaction_id",
ADD COLUMN IF NOT EXISTS "failure_reason" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB,
ADD COLUMN IF NOT EXISTS "provider_order_id" TEXT,
ADD COLUMN IF NOT EXISTS "provider_payment_id" TEXT,
ADD COLUMN IF NOT EXISTS "provider_signature" TEXT,
ADD COLUMN IF NOT EXISTS "refund_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS "user_id" TEXT;

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "banner_public_id" TEXT,
ADD COLUMN IF NOT EXISTS "banner_url" TEXT,
ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "public_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "public_id" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "promo_banners" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "image_url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "request_id" TEXT,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "ip" TEXT,
    "user_agent" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_user_time" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_action_time" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_severity_time" ON "audit_logs"("severity", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_password_history_user" ON "password_history"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payments_provider_payment_id_key" ON "payments"("provider_payment_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payments_provider_order_id_key" ON "payments"("provider_order_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_payment_user" ON "payments"("user_id");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_fkey') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_history_user_id_fkey') THEN
        ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
