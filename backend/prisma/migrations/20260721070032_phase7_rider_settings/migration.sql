-- CreateEnum
CREATE TYPE "RiderStatus" AS ENUM ('ONLINE', 'OFFLINE', 'BUSY', 'ON_BREAK');

-- CreateTable
CREATE TABLE "delivery_partner_settings" (
    "id" TEXT NOT NULL,
    "delivery_partner_id" TEXT NOT NULL,
    "rider_status" "RiderStatus" NOT NULL DEFAULT 'OFFLINE',
    "emergency_contact" TEXT,
    "earnings_per_delivery" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonus_earnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_partner_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_partner_settings_delivery_partner_id_key" ON "delivery_partner_settings"("delivery_partner_id");

-- CreateIndex
CREATE INDEX "idx_rider_settings_status" ON "delivery_partner_settings"("rider_status");

-- AddForeignKey
ALTER TABLE "delivery_partner_settings" ADD CONSTRAINT "delivery_partner_settings_delivery_partner_id_fkey" FOREIGN KEY ("delivery_partner_id") REFERENCES "delivery_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
