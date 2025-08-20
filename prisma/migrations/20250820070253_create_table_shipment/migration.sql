-- CreateTable
CREATE TABLE "public"."shipments" (
    "id" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "delivery_status" TEXT,
    "tracking_number" TEXT,
    "price" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "qr_code_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);
