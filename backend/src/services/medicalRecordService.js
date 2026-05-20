import prisma from "../prisma/client.js";

const includeRelations = {
  patient: true,
  psychologist: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  sessionNotes: {
    orderBy: {
      sessionDate: "desc"
    }
  }
};

export const createMedicalRecord = (data) =>
  prisma.medicalRecord.create({
    data,
    include: includeRelations
  });

export const getMedicalRecords = () =>
  prisma.medicalRecord.findMany({
    include: includeRelations,
    orderBy: {
      updatedAt: "desc"
    }
  });

export const getMedicalRecordById = (id) =>
  prisma.medicalRecord.findUnique({
    where: { id },
    include: includeRelations
  });

export const getMedicalRecordByPatientId = (patientId) =>
  prisma.medicalRecord.findUnique({
    where: { patientId },
    include: includeRelations
  });

export const updateMedicalRecord = (id, data) =>
  prisma.medicalRecord.update({
    where: { id },
    data,
    include: includeRelations
  });
