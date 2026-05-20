ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_clientId_fkey";

ALTER TABLE "Client" RENAME TO "Patient";

ALTER TABLE "Patient" RENAME CONSTRAINT "Client_pkey" TO "Patient_pkey";

ALTER INDEX "Client_email_key" RENAME TO "Patient_email_key";

ALTER TABLE "Appointment" RENAME COLUMN "clientId" TO "patientId";

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
