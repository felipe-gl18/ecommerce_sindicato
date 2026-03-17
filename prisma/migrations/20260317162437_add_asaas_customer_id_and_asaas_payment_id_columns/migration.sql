/*
  Warnings:

  - A unique constraint covering the columns `[asaasCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[asaasPaymentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `asaasCustomerId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `asaasPaymentId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "asaasCustomerId" TEXT NOT NULL,
ADD COLUMN     "asaasPaymentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_asaasCustomerId_key" ON "User"("asaasCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_asaasPaymentId_key" ON "User"("asaasPaymentId");
