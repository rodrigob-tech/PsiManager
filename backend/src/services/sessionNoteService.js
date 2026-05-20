import prisma from "../prisma/client.js";

const includeRelations = {
  psychologist: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  appointment: {
    include: {
      patient: true,
      space: true
    }
  }
};

export const createSessionNote = (data) =>
  prisma.sessionNote.create({
    data,
    include: includeRelations
  });

export const getSessionNotesByMedicalRecordId = (medicalRecordId) =>
  prisma.sessionNote.findMany({
    where: { medicalRecordId },
    include: includeRelations,
    orderBy: {
      sessionDate: "desc"
    }
  });

export const getSessionNoteById = (id) =>
  prisma.sessionNote.findUnique({
    where: { id },
    include: includeRelations
  });

export const updateSessionNote = (id, data) =>
  prisma.sessionNote.update({
    where: { id },
    data,
    include: includeRelations
  });

export const deleteSessionNote = (id) =>
  prisma.sessionNote.delete({
    where: { id }
  });
