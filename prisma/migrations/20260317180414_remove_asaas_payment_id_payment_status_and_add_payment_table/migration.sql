/*
  Warnings:

  - You are about to drop the column `asaasPaymentId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_asaasPaymentId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "asaasPaymentId",
DROP COLUMN "paymentStatus",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "asaasPaymentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
