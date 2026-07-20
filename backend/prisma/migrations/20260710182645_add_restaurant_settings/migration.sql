-- CreateTable
CREATE TABLE "restaurant_settings" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "auto_accept_orders" BOOLEAN NOT NULL DEFAULT false,
    "accept_cash_on_delivery" BOOLEAN NOT NULL DEFAULT true,
    "accept_scheduled_orders" BOOLEAN NOT NULL DEFAULT false,
    "preparation_buffer_time" INTEGER NOT NULL DEFAULT 5,
    "estimated_preparation_time" INTEGER NOT NULL DEFAULT 20,
    "max_concurrent_orders" INTEGER NOT NULL DEFAULT 10,
    "default_packaging_charge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "restaurant_announcement" TEXT,
    "is_temporarily_closed" BOOLEAN NOT NULL DEFAULT false,
    "temporary_closure_reason" TEXT,
    "auto_pause_when_busy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_settings_restaurant_id_key" ON "restaurant_settings"("restaurant_id");

-- AddForeignKey
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
