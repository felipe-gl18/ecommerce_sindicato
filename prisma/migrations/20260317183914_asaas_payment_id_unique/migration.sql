/*
  Warnings:

  - A unique constraint covering the columns `[asaasPaymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_asaasPaymentId_key" ON "Payment"("asaasPaymentId");
