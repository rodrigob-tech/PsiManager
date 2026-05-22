-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "psychologistId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_psychologistId_fkey" FOREIGN KEY ("psychologistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
