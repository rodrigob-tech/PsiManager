import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import { getPatientById } from "../services/patientService";
import {
  createMedicalRecord,
  getMedicalRecordByPatientId,
  updateMedicalRecord,
} from "../services/medicalRecordService";
import {
  createSessionNote,
  getSessionNotesByMedicalRecordId,
} from "../services/sessionNoteService";
import { getUserData, getUserToken } from "../storages/userAuthStorage";

const recordInitialState = {
  mainComplaint: "",
  diagnosisHypothesis: "",
  clinicalNotes: "",
  status: "OPEN",
};

const noteInitialState = {
  sessionDate: "",
  content: "",
  conduct: "",
  privateNotes: "",
};

function formatDateTimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(dateString) {
  if (!dateString) return "Não informado";

  return new Date(dateString).toLocaleDateString("pt-BR");
}

function formatDateTime(dateString) {
  if (!dateString) return "Não informado";

  return new Date(dateString).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getRecordStatusLabel(status) {
  const labels = {
    OPEN: "Aberto",
    CLOSED: "Fechado",
    ARCHIVED: "Arquivado",
  };

  return labels[status] || status || "Não informado";
}

export default function MedicalRecordPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const user = getUserData();

  const [patient, setPatient] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [recordForm, setRecordForm] = useState(recordInitialState);
  const [noteForm, setNoteForm] = useState({
    ...noteInitialState,
    sessionDate: formatDateTimeLocal(new Date().toISOString()),
  });

  const [loading, setLoading] = useState(true);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState("");

  const canAccessMedicalRecord = user?.role !== "RECEPTIONIST";

  function authHeaders() {
    return {
      Authorization: `Bearer ${getUserToken()}`,
    };
  }

  async function loadSessionNotes(recordId) {
    const response = await getSessionNotesByMedicalRecordId(
      recordId,
      authHeaders()
    );

    setSessionNotes(response.data || []);
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const patientResponse = await getPatientById(patientId, authHeaders());
      setPatient(patientResponse.data);

      try {
        const recordResponse = await getMedicalRecordByPatientId(
          patientId,
          authHeaders()
        );

        setMedicalRecord(recordResponse.data);

        setRecordForm({
          mainComplaint: recordResponse.data.mainComplaint || "",
          diagnosisHypothesis:
            recordResponse.data.diagnosisHypothesis || "",
          clinicalNotes: recordResponse.data.clinicalNotes || "",
          status: recordResponse.data.status || "OPEN",
        });

        await loadSessionNotes(recordResponse.data.id);
      } catch (recordError) {
        if (recordError.response?.status !== 404) {
          throw recordError;
        }

        setMedicalRecord(null);
        setRecordForm(recordInitialState);
        setSessionNotes([]);
      }
    } catch (loadError) {
      setError(
        loadError.response?.data?.error || "Erro ao carregar prontuário"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canAccessMedicalRecord) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  function handleRecordChange(event) {
    const { name, value } = event.target;

    setRecordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNoteChange(event) {
    const { name, value } = event.target;

    setNoteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveRecord(event) {
    event.preventDefault();

    if (
      !recordForm.mainComplaint.trim() ||
      !recordForm.diagnosisHypothesis.trim()
    ) {
      alert("Por favor, preencha queixa principal e hipótese diagnóstica.");
      return;
    }

    try {
      setSavingRecord(true);
      setError("");

      const payload = {
        ...recordForm,
        patientId,
        psychologistId: user?.role === "PSYCHOLOGIST" ? user.id : null,
      };

      const response = medicalRecord
        ? await updateMedicalRecord(medicalRecord.id, payload, authHeaders())
        : await createMedicalRecord(payload, authHeaders());

      setMedicalRecord(response.data);

      setRecordForm({
        mainComplaint: response.data.mainComplaint || "",
        diagnosisHypothesis: response.data.diagnosisHypothesis || "",
        clinicalNotes: response.data.clinicalNotes || "",
        status: response.data.status || "OPEN",
      });

      await loadSessionNotes(response.data.id);

      alert("Prontuário salvo com sucesso.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.error || "Erro ao salvar prontuário"
      );
    } finally {
      setSavingRecord(false);
    }
  }

  async function handleCreateSessionNote(event) {
    event.preventDefault();

    if (!medicalRecord) {
      setError("Crie o prontuário antes de registrar evoluções.");
      return;
    }

    if (
      !noteForm.sessionDate ||
      !noteForm.content.trim() ||
      !noteForm.conduct.trim()
    ) {
      alert("Por favor, preencha data, evolução da sessão e conduta.");
      return;
    }

    try {
      setSavingNote(true);
      setError("");

      await createSessionNote(
        {
          ...noteForm,
          medicalRecordId: medicalRecord.id,
          psychologistId: user?.role === "PSYCHOLOGIST" ? user.id : null,
        },
        authHeaders()
      );

      setNoteForm({
        ...noteInitialState,
        sessionDate: formatDateTimeLocal(new Date().toISOString()),
      });

      await loadSessionNotes(medicalRecord.id);

      alert("Evolução registrada com sucesso.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.error || "Erro ao registrar evolução"
      );
    } finally {
      setSavingNote(false);
    }
  }

  if (!canAccessMedicalRecord) {
    return (
      <DashboardLayout
        current="pacientes"
        title="Acesso restrito"
        subtitle="Seu perfil não possui permissão para acessar prontuários."
      >
        <div className="premium-card p-4">
          <h2 className="h5 fw-bold mb-2">Acesso restrito</h2>
          <p className="pm-text-muted mb-4">
            Seu perfil não possui permissão para acessar prontuários.
          </p>

          <button
            type="button"
            className="btn btn-warning rounded-pill"
            onClick={() => navigate("/admin/pacientes")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Voltar para pacientes
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      current="pacientes"
      title="Prontuário do paciente"
      subtitle={
        patient
          ? `Gerencie dados clínicos e evolução de atendimento de ${patient.name}.`
          : "Gerencie dados clínicos e evolução de atendimento."
      }
    >
      <div className="row g-4 mb-4">
        <div className="col-12">
          <button
            type="button"
            className="btn btn-pm-ghost rounded-pill"
            onClick={() => navigate("/admin/pacientes")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Voltar para pacientes
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="premium-card p-4">
          <p className="pm-text-muted mb-0">Carregando prontuário...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-lg-7">
              <div className="premium-card p-4">
                <h2 className="h5 fw-bold mb-4">Prontuário principal</h2>

                <form onSubmit={handleSaveRecord}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="status-select"
                    >
                      Status
                    </label>

                    <select
                      id="status-select"
                      name="status"
                      className="form-select"
                      value={recordForm.status}
                      onChange={handleRecordChange}
                    >
                      <option value="OPEN">Aberto</option>
                      <option value="CLOSED">Fechado</option>
                      <option value="ARCHIVED">Arquivado</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="main-complaint"
                    >
                      Queixa principal
                    </label>

                    <textarea
                      id="main-complaint"
                      name="mainComplaint"
                      className="form-control"
                      rows="3"
                      placeholder="Descreva a queixa principal do paciente..."
                      value={recordForm.mainComplaint}
                      onChange={handleRecordChange}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="diagnosis-hypothesis"
                    >
                      Hipótese diagnóstica
                    </label>

                    <textarea
                      id="diagnosis-hypothesis"
                      name="diagnosisHypothesis"
                      className="form-control"
                      rows="3"
                      placeholder="Indique a hipótese diagnóstica baseada na avaliação clínica..."
                      value={recordForm.diagnosisHypothesis}
                      onChange={handleRecordChange}
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="clinical-notes"
                    >
                      Notas clínicas
                    </label>

                    <textarea
                      id="clinical-notes"
                      name="clinicalNotes"
                      className="form-control"
                      rows="4"
                      placeholder="Observações clínicas gerais, antecedentes, medicação em uso, etc..."
                      value={recordForm.clinicalNotes}
                      onChange={handleRecordChange}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-pm-primary rounded-pill w-100 py-2"
                    disabled={savingRecord}
                  >
                    {savingRecord ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-2"></i>
                        Salvar prontuário
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-4">Prontuário atual</h2>

                {medicalRecord ? (
                  <div>
                    <div className="soft-card p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="fw-bold pm-text-muted small mb-2">
                            Status
                          </div>

                          <span className="status-pill">
                            {getRecordStatusLabel(medicalRecord.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="soft-card p-3 mb-3">
                      <div className="fw-bold pm-text-muted small mb-2">
                        Queixa principal
                      </div>

                      <p className="mb-0">
                        {medicalRecord.mainComplaint || "Não informado"}
                      </p>
                    </div>

                    <div className="soft-card p-3 mb-3">
                      <div className="fw-bold pm-text-muted small mb-2">
                        Hipótese diagnóstica
                      </div>

                      <p className="mb-0">
                        {medicalRecord.diagnosisHypothesis ||
                          "Não informado"}
                      </p>
                    </div>

                    <div className="soft-card p-3">
                      <div className="fw-bold pm-text-muted small mb-2">
                        Notas clínicas
                      </div>

                      <p className="mb-0">
                        {medicalRecord.clinicalNotes || "Sem notas"}
                      </p>
                    </div>

                    <div className="pm-text-muted small mt-3">
                      <i className="bi bi-calendar me-1"></i>
                      Atualizado em{" "}
                      {formatDate(
                        medicalRecord.updatedAt || medicalRecord.createdAt
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="soft-card p-4 text-center">
                    <i className="bi bi-file-earmark-medical fs-2 text-muted mb-2 d-block"></i>

                    <p className="pm-text-muted mb-0">
                      Nenhum prontuário criado ainda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="premium-card p-4">
                <h2 className="h5 fw-bold mb-4">Registrar evolução</h2>

                <form onSubmit={handleCreateSessionNote}>
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="session-date"
                    >
                      Data da sessão
                    </label>

                    <input
                      id="session-date"
                      type="datetime-local"
                      name="sessionDate"
                      className="form-control"
                      value={noteForm.sessionDate}
                      onChange={handleNoteChange}
                      disabled={!medicalRecord || savingNote}
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="session-content"
                    >
                      Evolução da sessão
                    </label>

                    <textarea
                      id="session-content"
                      name="content"
                      className="form-control"
                      rows="3"
                      placeholder="Descreva o progresso e as observações da sessão..."
                      value={noteForm.content}
                      onChange={handleNoteChange}
                      disabled={!medicalRecord || savingNote}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="conduct"
                    >
                      Conduta
                    </label>

                    <textarea
                      id="conduct"
                      name="conduct"
                      className="form-control"
                      rows="3"
                      placeholder="Indique a conduta clínica adotada..."
                      value={noteForm.conduct}
                      onChange={handleNoteChange}
                      disabled={!medicalRecord || savingNote}
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="private-notes"
                    >
                      Notas privadas
                    </label>

                    <textarea
                      id="private-notes"
                      name="privateNotes"
                      className="form-control"
                      rows="3"
                      placeholder="Observações pessoais para arquivo interno..."
                      value={noteForm.privateNotes}
                      onChange={handleNoteChange}
                      disabled={!medicalRecord || savingNote}
                    ></textarea>
                  </div>

                  {!medicalRecord && (
                    <div className="soft-card p-3 mb-4">
                      <div className="pm-text-muted small">
                        <i className="bi bi-info-circle me-2"></i>
                        Salve o prontuário principal antes de registrar
                        evoluções.
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-pm-primary rounded-pill w-100 py-2"
                    disabled={!medicalRecord || savingNote}
                  >
                    {savingNote ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Registrar evolução
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="premium-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h5 fw-bold mb-0">
                    Evoluções registradas
                  </h2>

                  <span className="badge bg-primary rounded-pill">
                    {sessionNotes.length}
                  </span>
                </div>

                {sessionNotes.length === 0 ? (
                  <div className="soft-card p-4 text-center">
                    <i className="bi bi-graph-up fs-2 text-muted mb-2 d-block"></i>

                    <p className="pm-text-muted mb-0">
                      Nenhuma evolução registrada ainda.
                    </p>
                  </div>
                ) : (
                  <div
                    className="d-grid gap-3"
                    style={{ maxHeight: "500px", overflowY: "auto" }}
                  >
                    {sessionNotes.map((note) => (
                      <div
                        className="soft-card p-3"
                        key={note.id}
                        style={{
                          borderLeft: "4px solid var(--pm-accent)",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h3 className="h6 fw-bold mb-1">
                              <i className="bi bi-calendar me-2"></i>
                              {formatDateTime(note.sessionDate)}
                            </h3>

                            <p className="pm-text-muted small mb-2">
                              {note.content}
                            </p>

                            {note.conduct && (
                              <div className="small">
                                <strong>Conduta:</strong> {note.conduct}
                              </div>
                            )}

                            {note.privateNotes && (
                              <div className="small text-muted mt-2">
                                <i className="bi bi-lock me-1"></i>
                                <strong>Notas:</strong> {note.privateNotes}
                              </div>
                            )}

                            <div className="pm-text-muted small mt-2">
                              Profissional:{" "}
                              {note.psychologist?.name ||
                                "Profissional não informado"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}