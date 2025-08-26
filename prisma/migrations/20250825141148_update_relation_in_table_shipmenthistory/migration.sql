-- AlterTable
ALTER TABLE "public"."shipment_histories" ALTER COLUMN "branch_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;
