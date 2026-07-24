-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "is_hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL,
    "platform_name" TEXT NOT NULL DEFAULT 'PlateMate',
    "platform_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    "default_delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 30.00,
    "support_email" TEXT NOT NULL DEFAULT 'support@platemate.com',
    "support_phone" TEXT NOT NULL DEFAULT '+919876543210',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "terms_url" TEXT,
    "privacy_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
