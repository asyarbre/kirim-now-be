/*
  Warnings:

  - Added the required column `type` to the `employee_branches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."employee_branches" ADD COLUMN     "type" TEXT NOT NULL;
