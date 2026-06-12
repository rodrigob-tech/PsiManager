import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import PatientForm from "../components/appointments/PatientForm";
import PatientList from "../components/appointments/PatientList";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";
import { getUserToken, getUserData } from "../storages/userAuthStorage";
import { getPatientFile } from "../services/documentService";

import { sendPatientReminderEmail } from "../services/reminder.service";

export default function AdminPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);

  const admin = getUserData();
  const canAccessMedicalRecord = admin?.role !== "RECEPTIONIST";
  const [selectedReminderPatient, setSelectedReminderPatient] = useState(null);
  const [reminderSubject, setReminderSubject] = useState("Lembrete de atendimento");
  const [reminderMessage, setReminderMessage] = useState(
    "Olá, passando para lembrar do seu atendimento. Em caso de dúvidas, entre em contato com a clínica."
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  async function loadPatients() {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const response = await getPatients(authHeaders);
      setPatients(response.data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      alert("Erro ao carregar pacientes");
    }
  }

  async function handleSubmitPatient(formData) {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (editingPatient) {
        await updatePatient(editingPatient.id, formData, authHeaders);
        alert("Paciente atualizado com sucesso");
        setEditingPatient(null);
        setShowPatientForm(false);
      } else {
        await createPatient(formData, authHeaders);
        alert("Paciente criado com sucesso");
        setShowPatientForm(false);
      }

      await loadPatients();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      const message = error.response?.data?.error || "Erro ao salvar paciente";
      alert(message);
    }
  }

  async function handleDeletePatient(id) {
    const confirmed = window.confirm("Deseja realmente excluir este paciente?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await deletePatient(id, authHeaders);
      await loadPatients();

      alert("Paciente removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover paciente:", error);
      const message = error.response?.data?.error || "Erro ao remover paciente";
      alert(message);
    }
  }
  async function handleOpenPatientFile(patientId) {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const response = await getPatientFile(patientId, authHeaders);

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Erro ao gerar ficha do paciente:", error);

      const message =
        error.response?.data?.error || "Erro ao gerar ficha do paciente";

      alert(message);
    }
  }


  function handleOpenReminderModal(patient) {
    if (!patient.email) {
      alert("Este paciente não possui e-mail cadastrado.");
      return;
    }

    setSelectedReminderPatient(patient);
    setReminderSubject("Lembrete de atendimento");
    setReminderMessage(
      "Olá, passando para lembrar do seu atendimento. Em caso de dúvidas, entre em contato com a clínica."
    );
  }

  function handleCloseReminderModal() {
    if (sendingReminder) return;

    setSelectedReminderPatient(null);
    setReminderSubject("Lembrete de atendimento");
    setReminderMessage(
      "Olá, passando para lembrar do seu atendimento. Em caso de dúvidas, entre em contato com a clínica."
    );
  }

  async function handleSendReminderEmail() {
    try {
      if (!selectedReminderPatient) {
        return;
      }

      if (!reminderSubject.trim()) {
        alert("Informe o assunto do lembrete.");
        return;
      }

      if (!reminderMessage.trim()) {
        alert("Informe a mensagem do lembrete.");
        return;
      }

      setSendingReminder(true);

      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      await sendPatientReminderEmail(
        selectedReminderPatient.id,
        {
          subject: reminderSubject.trim(),
          message: reminderMessage.trim(),
        },
        authHeaders
      );

      alert("Lembrete enviado com sucesso.");

      handleCloseReminderModal();
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error);

      const message =
        error.response?.data?.error || "Erro ao enviar lembrete por e-mail.";

      alert(message);
    } finally {
      setSendingReminder(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return true;

    return (
      patient.name?.toLowerCase().includes(term) ||
      patient.email?.toLowerCase().includes(term) ||
      patient.phone?.toLowerCase().includes(term) ||
      patient.cpf?.toLowerCase().includes(term)
    );
  });
  return (
    <DashboardLayout
      title="Pacientes"
      subtitle="Gerencie dados, status clínico e informações dos pacientes."
      current="pacientes"
    >
      <div className="premium-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div className="input-group" style={{ maxWidth: 420 }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-pill">
              <i className="bi bi-search"></i>
            </span>

            <input
              className="form-control border-start-0 rounded-end-pill"
              placeholder="Buscar paciente"
              aria-label="Buscar paciente"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          
          <button
            type="button"
            className={`btn ${showPatientForm ? "btn-danger" : "btn-pm-primary"
              } rounded-pill py-2`}
            onClick={() => {
              setEditingPatient(null);
              setShowPatientForm((prev) => !prev);
            }}
          >
            <i
              className={`bi ${showPatientForm ? "bi-x-lg" : "bi-plus-lg"
                } me-2`}
            ></i>
            {showPatientForm ? "Fechar cadastro" : "Criar paciente"}
          </button>
        </div>

        {(showPatientForm || editingPatient) && (
          <div className="soft-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h2 className="h5 fw-bold mb-1">
                  {editingPatient ? "Editar paciente" : "Novo paciente"}
                </h2>
                <p className="text-secondary mb-0">
                  Preencha os dados cadastrais e clínicos do paciente.
                </p>
              </div>


            </div>

            <PatientForm
              onSubmit={handleSubmitPatient}
              editingPatient={editingPatient}
              onCancelEdit={() => {
                setEditingPatient(null);
                setShowPatientForm(false);
              }}
            />
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h2 className="h5 fw-bold mb-1">Lista de pacientes</h2>
            <p className="text-secondary mb-0">
              {filteredPatients.length} paciente(s) encontrado(s).
            </p>
          </div>
        </div>

        <PatientList
          patients={filteredPatients}
          onEdit={(patient) => {
            setEditingPatient(patient);
            setShowPatientForm(true);
          }}
          onDelete={handleDeletePatient}
          canAccessMedicalRecord={canAccessMedicalRecord}
          onOpenMedicalRecord={(patient) =>
            navigate(`/patients/${patient.id}/prontuario`)
          }
          onOpenPatientFile={handleOpenPatientFile}
          onSendReminder={handleOpenReminderModal}
        />
      </div>

      {selectedReminderPatient && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1055,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div className="modal-dialog modal-dialog-centered"
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title mb-0">Enviar lembrete</h5>
                  <small className="text-secondary">
                    Paciente: {selectedReminderPatient.name}
                  </small>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseReminderModal}
                  disabled={sendingReminder}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">E-mail do paciente</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedReminderPatient.email || ""}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Assunto</label>
                  <input
                    type="text"
                    className="form-control"
                    value={reminderSubject}
                    onChange={(event) => setReminderSubject(event.target.value)}
                    disabled={sendingReminder}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mensagem</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={reminderMessage}
                    onChange={(event) => setReminderMessage(event.target.value)}
                    disabled={sendingReminder}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseReminderModal}
                  disabled={sendingReminder}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn btn-pm-primary"
                  onClick={handleSendReminderEmail}
                  disabled={sendingReminder}
                >
                  {sendingReminder ? "Enviando..." : "Enviar lembrete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}