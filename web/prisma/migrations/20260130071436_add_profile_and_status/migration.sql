-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('BRIDE', 'GROOM');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_PROFILE', 'PENDING_PAYMENT', 'PENDING_REVIEW', 'ACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING_PROFILE';

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "height" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "salary" TEXT,
    "location" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "subCaste" TEXT,
    "hasHoroscope" BOOLEAN NOT NULL,
    "parentContact" TEXT NOT NULL,
    "profilePhoto" TEXT NOT NULL,
    "additionalPhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
