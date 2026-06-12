
import { useEffect, useState } from "react";


import DashboardLayout from "../components/layout/DashboardLayout";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentForm from "../components/appointments/AppointmentForm";
import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from "../services/appointmentService";


import {
    getSpaces,
    createSpace,
    updateSpace,
    deleteSpace
} from "../services/spaceService";
import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patientService";
import { getPsychologists } from "../services/userService";

import { getUserToken, getUserData } from "../storages/userAuthStorage";

const statusLabel = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  pending: "Pendente",
  canceled: "Cancelado",
  done: "Concluído",
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [patients, setPatients] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [psychologists, setPsychologists] = useState([]);

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  async function loadData() {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [
        appointmentsResponse,
        patientsResponse,
        spacesResponse,
        psychologistsResponse,
      ] = await Promise.all([
        getAppointments(authHeaders),
        getPatients(authHeaders),
        getSpaces(authHeaders),
        getPsychologists(authHeaders),
      ]);

      setAppointments(appointmentsResponse.data);
      setPatients(patientsResponse.data);
      setSpaces(spacesResponse.data);
      setPsychologists(psychologistsResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados dos agendamentos:", error);
      alert("Erro ao carregar dados dos agendamentos");
    }
  }

  const handleSubmitAppointment = async (formData) => {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData, authHeaders);
        alert("Agendamento atualizado com sucesso");
        setEditingAppointment(null);
        setShowAppointmentForm(false);
      } else {
        await createAppointment(formData, authHeaders);
        alert("Agendamento criado com sucesso");
        setShowAppointmentForm(false);
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);

      const message =
        error.response?.data?.error || "Erro ao salvar agendamento";

      alert(message);
    }
  };

  const handleDeleteAppointment = async (id) => {
    const confirmed = window.confirm("Deseja realmente excluir este agendamento?");
    if (!confirmed) return;

    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      await deleteAppointment(id, authHeaders);
      await loadData();

      alert("Agendamento removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover agendamento:", error);

      const message =
        error.response?.data?.error || "Erro ao remover agendamento";

      alert(message);
    }
  };

  function handleOpenCreateForm() {
    setEditingAppointment(null);
    setShowAppointmentForm((prev) => !prev);
  }

  function handleEditAppointment(appointment) {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  }

  function handleCloseForm() {
    setEditingAppointment(null);
    setShowAppointmentForm(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const term = searchTerm.toLowerCase().trim();

    const patientName = appointment.patient?.name?.toLowerCase() || "";
    const spaceName = appointment.space?.name?.toLowerCase() || "";
    const psychologistName =
      appointment.psychologist?.name?.toLowerCase() || "";

    const matchesSearch =
      !term ||
      patientName.includes(term) ||
      spaceName.includes(term) ||
      psychologistName.includes(term);

    const matchesStatus =
      !statusFilter || appointment.status === statusFilter;

    const appointmentDate = appointment.date
      ? new Date(appointment.date).toISOString().slice(0, 10)
      : "";

    const matchesDate = !dateFilter || appointmentDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const summary = buildSummary(filteredAppointments);

  return (
    <DashboardLayout
      current="agendamentos"
      title="Agenda"
      subtitle="Visualize consultas por dia, status e profissional."
    >
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="premium-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <div>
                
                <p className="text-secondary mb-0">
                  {filteredAppointments.length} agendamento(s) encontrado(s).
                </p>
              </div>

              <button
                type="button"
                className="btn btn-success rounded-pill"
                onClick={handleOpenCreateForm}
              >
                {showAppointmentForm ? "Voltar" : "Criar agendamento"}
              </button>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                    <i className="bi bi-search"></i>
                  </span>

                  <input
                    className="form-control border-start-0 rounded-end-pill"
                    placeholder="Buscar por paciente, espaço ou psicólogo"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control rounded-pill"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                />
              </div>

              <div className="col-md-3">
                <select
                  className="form-select rounded-pill"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">Todos os status</option>
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(showAppointmentForm || editingAppointment) && (
              <div className="soft-card p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h2 className="h5 fw-bold mb-1">
                      {editingAppointment
                        ? "Editar agendamento"
                        : "Criar agendamento"}
                    </h2>

                    <p className="text-secondary mb-0">
                      Selecione paciente, psicólogo, espaço, data e status.
                    </p>
                  </div>

                  
                </div>

                <AppointmentForm
                  patients={patients}
                  spaces={spaces}
                  psychologists={psychologists}
                  onSubmit={handleSubmitAppointment}
                  editingAppointment={editingAppointment}
                  onCancelEdit={handleCloseForm}
                />
              </div>
            )}

            <AppointmentList
              appointments={filteredAppointments}
              onDelete={handleDeleteAppointment}
              onEdit={handleEditAppointment}
            />
          </div>
        </div>

        <div className="col-lg-4">
          <AgendaSummary summary={summary} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function AgendaSummary({ summary }) {
  return (
    <div className="premium-card p-4">
      <h2 className="h5 fw-bold mb-3">Resumo da agenda</h2>

      <div className="d-grid gap-3">
        

        <div className="soft-card p-3">
          <div className="text-secondary small">Confirmados</div>
          <div className="fs-4 fw-bold">{summary.confirmed}</div>
        </div>

        <div className="soft-card p-3">
          <div className="text-secondary small">Pendentes</div>
          <div className="fs-4 fw-bold">{summary.pending}</div>
        </div>

        <div className="soft-card p-3">
          <div className="text-secondary small">Cancelados</div>
          <div className="fs-4 fw-bold">{summary.canceled}</div>
        </div>

        
      </div>
    </div>
  );
}

function buildSummary(appointments) {
  return appointments.reduce(
    (acc, appointment) => {
      acc.total += 1;

      if (appointment.status === "confirmed") acc.confirmed += 1;
      if (appointment.status === "pending") acc.pending += 1;
      if (appointment.status === "canceled") acc.canceled += 1;
      if (appointment.googleSyncStatus === "synced") acc.synced += 1;

      return acc;
    },
    {
      total: 0,
      confirmed: 0,
      pending: 0,
      canceled: 0,
      synced: 0,
    }
  );
}