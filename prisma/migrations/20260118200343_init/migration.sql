-- CreateTable
CREATE TABLE "ServiceCenter" (
    "id" SERIAL NOT NULL,
    "centerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" TEXT NOT NULL,
    "longitude" TEXT NOT NULL,
    "categories" TEXT[],
    "imagePaths" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCenter_pkey" PRIMARY KEY ("id")
);
