-- CreateEnum
CREATE TYPE "SellerPaymentProvider" AS ENUM ('ASAASTransfer');

-- CreateTable
CREATE TABLE "SellerPaymentAccount" (
    "id" TEXT NOT NULL,
    "provider" "SellerPaymentProvider" NOT NULL DEFAULT 'ASAASTransfer',
    "userId" TEXT NOT NULL,
    "encryptedApiKey" TEXT NOT NULL,

    CONSTRAINT "SellerPaymentAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SellerPaymentAccount" ADD CONSTRAINT "SellerPaymentAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
