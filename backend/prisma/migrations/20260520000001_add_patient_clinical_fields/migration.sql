-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Patient"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "phone" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "cpf" TEXT,
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "gender" TEXT,
  ADD COLUMN "emergencyName" TEXT,
  ADD COLUMN "emergencyPhone" TEXT,
  ADD COLUMN "guardianName" TEXT,
  ADD COLUMN "guardianPhone" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE';
