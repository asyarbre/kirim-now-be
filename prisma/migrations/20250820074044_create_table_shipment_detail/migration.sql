-- CreateTable
CREATE TABLE "public"."shipment_details" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pickup_address_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "delivery_type" TEXT NOT NULL,
    "destination_address" TEXT NOT NULL,
    "package_type" TEXT NOT NULL,
    "pickup_proof" TEXT,
    "receipt_proof" TEXT,
    "destination_latitude" DOUBLE PRECISION,
    "destination_longitude" DOUBLE PRECISION,
    "recipient_name" TEXT,
    "recipient_phone" TEXT,
    "base_price" DOUBLE PRECISION,
    "distance_price" DOUBLE PRECISION,
    "weight_price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."shipment_details" ADD CONSTRAINT "shipment_details_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_details" ADD CONSTRAINT "shipment_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_details" ADD CONSTRAINT "shipment_details_pickup_address_id_fkey" FOREIGN KEY ("pickup_address_id") REFERENCES "public"."user_adresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
