-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "payment_method" TEXT,
    "status" TEXT,
    "expiration_date" TIMESTAMP(3),
    "external_id" TEXT,
    "invoice_id" TEXT,
    "invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipment_branch_logs" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "scanned_by_user_id" TEXT NOT NULL,
    "scan_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_branch_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_branch_logs" ADD CONSTRAINT "shipment_branch_logs_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_branch_logs" ADD CONSTRAINT "shipment_branch_logs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_branch_logs" ADD CONSTRAINT "shipment_branch_logs_scanned_by_user_id_fkey" FOREIGN KEY ("scanned_by_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
