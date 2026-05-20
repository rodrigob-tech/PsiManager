/*
  Warnings:

  - Made the column `spaceId` on table `Appointment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_spaceId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "googleCalendarId" TEXT,
ADD COLUMN     "googleEventId" TEXT,
ADD COLUMN     "googleSyncError" TEXT,
ADD COLUMN     "googleSyncStatus" TEXT,
ADD COLUMN     "syncedAt" TIMESTAMP(3),
ALTER COLUMN "spaceId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleCalendarEmail" TEXT,
ADD COLUMN     "googleConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
