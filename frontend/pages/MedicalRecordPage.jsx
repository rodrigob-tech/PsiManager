import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPatientById } from "../services/patientService";
import {
  createMedicalRecord,
  getMedicalRecordByPatientId,
  updateMedicalRecord
} from "../services/medicalRecordService";
import {
  createSessionNote,
  getSessionNotesByMedicalRecordId
} from "../services/sessionNoteService";
import { getUserData, getUserToken } from "../src/services/userAuthStorage";

const recordInitialState = {
  mainComplaint: "",
  diagnosisHypothesis: "",
  clinicalNotes: "",
  status: "OPEN"
};

const noteInitialState = {
  sessionDate: "",
  content: "",
  conduct: "",
  privateNotes: ""
};

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Não informado";

  return new Date(dateString).toLocaleString("pt-BR");
};

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
    sessionDate: formatDateTimeLocal(new Date().toISOString())
  });
  const [loading, setLoading] = useState(true);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState("");

  const canAccessMedicalRecord = user?.role !== "RECEPTIONIST";

  const authHeaders = () => ({
    Authorization: `Bearer ${getUserToken()}`
  });

  const loadSessionNotes = async (recordId) => {
    const response = await getSessionNotesByMedicalRecordId(recordId, authHeaders());
    setSessionNotes(response.data);
  };

  const loadData = async () => {
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
          diagnosisHypothesis: recordResponse.data.diagnosisHypothesis || "",
          clinicalNotes: recordResponse.data.clinicalNotes || "",
          status: recordResponse.data.status || "OPEN"
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
      setError(loadError.response?.data?.error || "Erro ao carregar prontuário");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccessMedicalRecord) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const handleRecordChange = (event) => {
    const { name, value } = event.target;

    setRecordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNoteChange = (event) => {
    const { name, value } = event.target;

    setNoteForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveRecord = async (event) => {
    event.preventDefault();

    try {
      setSavingRecord(true);
      setError("");

      const payload = {
        ...recordForm,
        patientId,
        psychologistId: user?.role === "PSYCHOLOGIST" ? user.id : null
      };

      const response = medicalRecord
        ? await updateMedicalRecord(medicalRecord.id, payload, authHeaders())
        : await createMedicalRecord(payload, authHeaders());

      setMedicalRecord(response.data);
      setRecordForm({
        mainComplaint: response.data.mainComplaint || "",
        diagnosisHypothesis: response.data.diagnosisHypothesis || "",
        clinicalNotes: response.data.clinicalNotes || "",
        status: response.data.status || "OPEN"
      });
      await loadSessionNotes(response.data.id);
      alert("Prontuário salvo com sucesso");
    } catch (saveError) {
      setError(saveError.response?.data?.error || "Erro ao salvar prontuário");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleCreateSessionNote = async (event) => {
    event.preventDefault();

    if (!medicalRecord) {
      setError("Crie o prontuário antes de registrar evoluções");
      return;
    }

    try {
      setSavingNote(true);
      setError("");

      await createSessionNote(
        {
          ...noteForm,
          medicalRecordId: medicalRecord.id,
          psychologistId: user?.role === "PSYCHOLOGIST" ? user.id : null
        },
        authHeaders()
      );

      setNoteForm({
        ...noteInitialState,
        sessionDate: formatDateTimeLocal(new Date().toISOString())
      });
      await loadSessionNotes(medicalRecord.id);
      alert("Evolução registrada com sucesso");
    } catch (saveError) {
      setError(saveError.response?.data?.error || "Erro ao registrar evolução");
    } finally {
      setSavingNote(false);
    }
  };

  if (!canAccessMedicalRecord) {
    return (
      <div style={pageStyle}>
        <div style={sectionCardStyle}>
          <h2 style={{ marginTop: 0 }}>Acesso restrito</h2>
          <p style={mutedTextStyle}>
            Seu perfil não possui permissão para acessar prontuários.
          </p>
          <button type="button" onClick={() => navigate("/")} style={secondaryButton}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0 }}>Prontuário</h1>
            <p style={mutedTextStyle}>
              {patient ? patient.name : "Carregando paciente..."}
            </p>
          </div>

          <button type="button" onClick={() => navigate("/")} style={secondaryButton}>
            Voltar
          </button>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {loading ? (
          <div style={sectionCardStyle}>Carregando prontuário...</div>
        ) : (
          <>
            <form onSubmit={handleSaveRecord} style={sectionCardStyle}>
              <h2 style={{ marginTop: 0 }}>Dados principais</h2>

              <select
                name="status"
                value={recordForm.status}
                onChange={handleRecordChange}
                className="form-select"
              >
                <option value="OPEN">Aberto</option>
                <option value="CLOSED">Fechado</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>

              <textarea
                name="mainComplaint"
                placeholder="Queixa principal"
                value={recordForm.mainComplaint}
                onChange={handleRecordChange}
                rows={3}
                className="form-control"
              />

              <textarea
                name="diagnosisHypothesis"
                placeholder="Hipótese diagnóstica"
                value={recordForm.diagnosisHypothesis}
                onChange={handleRecordChange}
                rows={3}
                className="form-control"
              />

              <textarea
                name="clinicalNotes"
                placeholder="Notas clínicas"
                value={recordForm.clinicalNotes}
                onChange={handleRecordChange}
                rows={5}
                className="form-control"
              />

              <button type="submit" disabled={savingRecord} style={primaryButton}>
                {savingRecord ? "Salvando..." : "Salvar prontuário"}
              </button>
            </form>

            <form onSubmit={handleCreateSessionNote} style={sectionCardStyle}>
              <h2 style={{ marginTop: 0 }}>Nova evolução</h2>

              <input
                type="datetime-local"
                name="sessionDate"
                value={noteForm.sessionDate}
                onChange={handleNoteChange}
                required
                className="form-control"
              />

              <textarea
                name="content"
                placeholder="Evolução da sessão"
                value={noteForm.content}
                onChange={handleNoteChange}
                rows={4}
                required
                disabled={!medicalRecord}
                className="form-control"
              />

              <textarea
                name="conduct"
                placeholder="Conduta"
                value={noteForm.conduct}
                onChange={handleNoteChange}
                rows={3}
                disabled={!medicalRecord}
                className="form-control"
              />

              <textarea
                name="privateNotes"
                placeholder="Notas privadas"
                value={noteForm.privateNotes}
                onChange={handleNoteChange}
                rows={3}
                disabled={!medicalRecord}
                className="form-control"
              />

              <button
                type="submit"
                disabled={!medicalRecord || savingNote}
                style={primaryButton}
              >
                {savingNote ? "Registrando..." : "Registrar evolução"}
              </button>
            </form>

            <section style={sectionCardStyle}>
              <h2 style={{ marginTop: 0 }}>Evoluções</h2>

              {!sessionNotes.length ? (
                <p style={mutedTextStyle}>Nenhuma evolução registrada.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {sessionNotes.map((note) => (
                    <article key={note.id} style={noteCardStyle}>
                      <div style={noteHeaderStyle}>
                        <strong>{formatDateTime(note.sessionDate)}</strong>
                        <span style={mutedTextStyle}>
                          {note.psychologist?.name || "Profissional não informado"}
                        </span>
                      </div>

                      <p style={noteTextStyle}>{note.content}</p>

                      {note.conduct && (
                        <p style={noteTextStyle}>
                          <strong>Conduta:</strong> {note.conduct}
                        </p>
                      )}

                      {note.privateNotes && (
                        <p style={noteTextStyle}>
                          <strong>Notas privadas:</strong> {note.privateNotes}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "24px 16px"
};

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  display: "grid",
  gap: "20px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  flexWrap: "wrap"
};

const sectionCardStyle = {
  display: "grid",
  gap: "12px",
  background: "#ffffff",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
};



const primaryButton = {
  border: "none",
  background: "#1976d2",
  color: "#fff",
  padding: "11px 15px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  width: "fit-content"
};

const secondaryButton = {
  border: "1px solid #d0d7e2",
  background: "#fff",
  color: "#333",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
};

const errorStyle = {
  background: "#fdecea",
  color: "#b42318",
  border: "1px solid #f5c2c7",
  borderRadius: "10px",
  padding: "12px"
};

const mutedTextStyle = {
  margin: 0,
  color: "#64748b"
};

const noteCardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  background: "#fff"
};

const noteHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap"
};

const noteTextStyle = {
  margin: "10px 0 0",
  lineHeight: 1.5
};
