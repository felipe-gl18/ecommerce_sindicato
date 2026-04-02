/*
  Warnings:

  - You are about to drop the column `asaasPaymentId` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[asaasSubscriptionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `asaasSubscriptionId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Payment_asaasPaymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "asaasPaymentId",
ADD COLUMN     "asaasSubscriptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_asaasSubscriptionId_key" ON "Payment"("asaasSubscriptionId");
