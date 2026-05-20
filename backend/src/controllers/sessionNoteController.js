import {
  createSessionNote,
  deleteSessionNote,
  getSessionNoteById,
  getSessionNotesByMedicalRecordId,
  updateSessionNote
} from "../services/sessionNoteService.js";

const normalizeOptionalString = (value) => {
  if (typeof value !== "string") return value ?? null;

  const trimmed = value.trim();
  return trimmed || null;
};

const buildSessionNoteData = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body, "medicalRecordId")) {
    data.medicalRecordId = body.medicalRecordId;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "appointmentId")) {
    data.appointmentId = body.appointmentId || null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "psychologistId")) {
    data.psychologistId = body.psychologistId || null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "sessionDate")) {
    data.sessionDate = body.sessionDate ? new Date(body.sessionDate) : null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body, "content")) {
    data.content = typeof body.content === "string" ? body.content.trim() : body.content;
  }

  ["conduct", "privateNotes"].forEach((field) => {
    if (!partial || Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = normalizeOptionalString(body[field]);
    }
  });

  return data;
};

const validateSessionNoteData = (data, { creating = false } = {}) => {
  if (creating && !data.medicalRecordId) {
    return "medicalRecordId é obrigatório";
  }

  if (!data.sessionDate) {
    return "Data da sessão é obrigatória";
  }

  if (data.sessionDate && Number.isNaN(data.sessionDate.getTime())) {
    return "Data da sessão inválida";
  }

  if (!data.content) {
    return "Conteúdo da evolução é obrigatório";
  }

  return null;
};

export const createSessionNoteController = async (req, res) => {
  try {
    const data = buildSessionNoteData(req.body);
    const validationError = validateSessionNoteData(data, { creating: true });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const sessionNote = await createSessionNote(data);
    res.status(201).json(sessionNote);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({
        error: "Prontuário, agendamento ou psicólogo não encontrado"
      });
    }

    res.status(500).json({ error: "Erro ao criar evolução de sessão" });
  }
};

export const getSessionNotesByMedicalRecordController = async (req, res) => {
  try {
    const sessionNotes = await getSessionNotesByMedicalRecordId(
      req.params.medicalRecordId
    );

    res.json(sessionNotes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar evoluções de sessão" });
  }
};

export const getSessionNoteByIdController = async (req, res) => {
  try {
    const sessionNote = await getSessionNoteById(req.params.id);

    if (!sessionNote) {
      return res.status(404).json({ error: "Evolução de sessão não encontrada" });
    }

    res.json(sessionNote);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar evolução de sessão" });
  }
};

export const updateSessionNoteController = async (req, res) => {
  try {
    const existingSessionNote = await getSessionNoteById(req.params.id);

    if (!existingSessionNote) {
      return res.status(404).json({ error: "Evolução de sessão não encontrada" });
    }

    const data = buildSessionNoteData(req.body, { partial: true });
    const validationError = validateSessionNoteData({
      ...existingSessionNote,
      ...data
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const sessionNote = await updateSessionNote(req.params.id, data);
    res.json(sessionNote);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({
        error: "Prontuário, agendamento ou psicólogo não encontrado"
      });
    }

    res.status(500).json({ error: "Erro ao atualizar evolução de sessão" });
  }
};

export const deleteSessionNoteController = async (req, res) => {
  try {
    const existingSessionNote = await getSessionNoteById(req.params.id);

    if (!existingSessionNote) {
      return res.status(404).json({ error: "Evolução de sessão não encontrada" });
    }

    await deleteSessionNote(req.params.id);
    res.json({ message: "Evolução de sessão removida com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover evolução de sessão" });
  }
};
