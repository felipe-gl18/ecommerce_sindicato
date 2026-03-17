/*
  Warnings:

  - A unique constraint covering the columns `[cpfCnpj]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cpfCnpj` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cpfCnpj" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_cpfCnpj_key" ON "User"("cpfCnpj");
