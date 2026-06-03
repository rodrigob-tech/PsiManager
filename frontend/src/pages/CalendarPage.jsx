import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentCalendar from "../components/appointments/AppointmentCalendar";
import AppointmentList from "../components/appointments/AppointmentList";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../services/appointmentService";

import {
  mapAppointmentsToEvents,
  mapBlockedTimesToEvents
} from "../utils/appointmentMapper";
import BlockedTimeForm from "../components/appointments/BlockedTimeForm";
import BlockedTimeList from "../components/appointments/BlockedTimeList";
import {
  getBlockedTimes,
  createBlockedTime,
  deleteBlockedTime
} from "../services/blockedTime.service";
import PatientForm from "../components/appointments/PatientForm";
import PatientList from "../components/appointments/PatientList";
import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patientService";

import SpaceForm from "../components/appointments/SpaceForm";
import SpaceList from "../components/appointments/SpaceList";
import {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace
} from "../services/spaceService";
import { getUserToken, getUserData, clearUserAuth } from "../storages/userAuthStorage";
import { getPsychologists } from "../services/userService";
import DashboardLayout from "../components/layout/DashboardLayout";




const sectionCardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState("all");
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [activeSection, setActiveSection] = useState("appointments");
  const [psychologists, setPsychologists] = useState([]);
  const admin = getUserData();
  const canAccessMedicalRecord = admin?.role !== "RECEPTIONIST";

  const loadData = async () => {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      const [
        appointmentsResponse,
        patientsResponse,
        blockedTimesResponse,
        spacesResponse,
        psychologistResponse
      ] = await Promise.all([
        getAppointments(authHeaders),
        getPatients(authHeaders),
        getBlockedTimes(authHeaders),
        getSpaces(authHeaders),
        getPsychologists(authHeaders)
      ]);

      const appointmentEvents = mapAppointmentsToEvents(appointmentsResponse.data);
      const blockedEvents = mapBlockedTimesToEvents(blockedTimesResponse.data);

      setAppointments(appointmentsResponse.data);
      setEvents([...appointmentEvents, ...blockedEvents]);
      setPatients(patientsResponse.data);
      setBlockedTimes(blockedTimesResponse.data);
      setSpaces(spacesResponse.data);
      setPsychologists(psychologistResponse.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSubmitAppointment = async (formData) => {
    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData, authHeaders);
        alert("Agendamento atualizado com sucesso");
        setEditingAppointment(null);
      } else {
        await createAppointment(formData, authHeaders);
        alert("Agendamento criado com sucesso");
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
        Authorization: `Bearer ${token}`
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

  const handleSubmitPatient = async (formData) => {
    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      if (editingPatient) {
        await updatePatient(editingPatient.id, formData, authHeaders);
        alert("Paciente atualizado com sucesso");
        setEditingPatient(null);
        await loadData();
      } else {
        await createPatient(formData, authHeaders);
        alert("Paciente criado com sucesso");
        await loadData();
      }
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);

      const message =
        error.response?.data?.error || "Erro ao salvar paciente";

      alert(message);
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
  };
  const handleDeletePatient = async (id) => {
    const confirmed = window.confirm("Deseja realmente excluir este paciente?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await deletePatient(id, authHeaders);
      await loadData();
      alert("Paciente removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover paciente:", error);

      const message =
        error.response?.data?.error || "Erro ao remover paciente";

      alert(message);
    }
  };

  const handleSubmitSpace = async (formData) => {
    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      if (editingSpace) {
        await updateSpace(editingSpace.id, formData, authHeaders);
        alert("Espaço atualizado com sucesso");
        setEditingSpace(null);
      } else {
        await createSpace(formData, authHeaders);
        alert("Espaço criado com sucesso");
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao salvar espaço:", error);

      const message =
        error.response?.data?.error || "Erro ao salvar espaço";

      alert(message);
    }
  };

  const handleDeleteSpace = async (id) => {
    const confirmed = window.confirm("Deseja realmente excluir este espaço?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await deleteSpace(id, authHeaders);
      await loadData();
      alert("Espaço removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover espaço:", error);

      const message =
        error.response?.data?.error || "Erro ao remover espaço";

      alert(message);
    }
  };

  const handleCreateBlockedTime = async (formData) => {
    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await createBlockedTime(formData, authHeaders);
      await loadData();
      alert("Bloqueio criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao criar bloqueio";

      alert(message);
    }
  };

  const handleDeleteBlockedTime = async (id) => {
    const confirmed = window.confirm("Deseja realmente excluir este bloqueio?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await deleteBlockedTime(id, authHeaders);
      await loadData();
      alert("Bloqueio removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao remover bloqueio";

      alert(message);
    }
  };

  const filteredEvents = events.filter((event) => {
    const isBlocked = event.extendedProps?.type === "blockedTime";

    if (isBlocked) {
      if (selectedStatusFilter !== "all" && selectedStatusFilter !== "blocked") {
        return false;
      }

      if (selectedSpaceFilter !== "all") {
        return false;
      }

      return true;
    }

    const eventStatus = event.extendedProps?.status;
    const eventSpace = event.extendedProps?.spaceName;

    const matchesStatus =
      selectedStatusFilter === "all" || eventStatus === selectedStatusFilter;

    const matchesSpace =
      selectedSpaceFilter === "all" || eventSpace === selectedSpaceFilter;

    return matchesStatus && matchesSpace;
  });
  
  const getTabButtonStyle = (section) => ({
    border: "none",
    background: activeSection === section ? "#1976d2" : "#e9eef8",
    color: activeSection === section ? "#fff" : "#334155",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s ease"
  });
  useEffect(() => {
    loadData();
  }, []);

  return (
    
  

   <DashboardLayout
    title="Agenda"
    subtitle="Gerencie pacientes, espaços, agendamentos e bloqueios."
    current="agenda"
  >
    {<div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "24px 16px"
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          display: "grid",
          gap: "24px"
        }}
      >
        <div className="card app-card mb-4">
          <h2 style={{ marginTop: 0 }}>Calendário geral</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px"
            }}
          >
            <select
              className="form-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              
            >
              <option value="all">Todos os status</option>
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendente</option>
              <option value="canceled">Cancelado</option>
              <option value="done">Concluído</option>
              <option value="blocked">Bloqueios</option>
            </select>

            <select
            className="form-select"
              value={selectedSpaceFilter}
              onChange={(e) => setSelectedSpaceFilter(e.target.value)}
             
            >
              <option value="all">Todos os espaços</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.name}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          <AppointmentCalendar
            events={filteredEvents}
            onEventClick={setSelectedCalendarEvent}
          />

          {selectedCalendarEvent && (
            <div
              style={{
                marginTop: "20px",
                background: "#f8faff",
                border: "1px solid #e1e8f5",
                borderRadius: "14px",
                padding: "18px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  alignItems: "flex-start"
                }}
              >
                <div style={{ display: "grid", gap: "8px" }}>
                  <h3 style={{ margin: 0 }}>Detalhes do evento</h3>

                  {selectedCalendarEvent.extendedProps?.type === "blockedTime" ? (
                    <>
                      <div>
                        <strong>Tipo:</strong> Horário bloqueado
                      </div>
                      <div>
                        <strong>Início:</strong>{" "}
                        {new Date(selectedCalendarEvent.start).toLocaleString("pt-BR")}
                      </div>
                      <div>
                        <strong>Fim:</strong>{" "}
                        {selectedCalendarEvent.end
                          ? new Date(selectedCalendarEvent.end).toLocaleString("pt-BR")
                          : "Não informado"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>Paciente:</strong>{" "}
                        {selectedCalendarEvent.extendedProps?.patientName}
                      </div>
                      <div>
                        <strong>Email:</strong>{" "}
                        {selectedCalendarEvent.extendedProps?.patientEmail || "Não informado"}
                      </div>
                      <div>
                        <strong>Espaço:</strong>{" "}
                        {selectedCalendarEvent.extendedProps?.spaceName}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        {selectedCalendarEvent.extendedProps?.status}
                      </div>
                      <div>
                        <strong>Data/Hora:</strong>{" "}
                        {new Date(selectedCalendarEvent.start).toLocaleString("pt-BR")}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCalendarEvent(null)}
                  style={{
                    border: "1px solid #d0d7e2",
                    background: "#fff",
                    color: "#333",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card app-card mb-4">
          <h2 style={{ marginTop: 0 }}>Gerenciamento</h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "24px"
            }}
          >
            <button
              type="button"
              className={`btn ${activeSection === "patients" ? "btn-primary" : "btn-outline-primary"
                }`} onClick={() => setActiveSection("patients")}
            >
              Pacientes
            </button>

            <button
              type="button"
              className={`btn ${
    activeSection === "patients" ? "btn-primary" : "btn-outline-primary"
  }`}
              onClick={() => setActiveSection("spaces")}
              
            >
              Espaços
            </button>

            <button
              type="button"
              className={`btn ${
    activeSection === "patients" ? "btn-primary" : "btn-outline-primary"
  }`}
              onClick={() => setActiveSection("appointments")}
              
            >
              Agendamentos
            </button>

            <button
              type="button"
              className={`btn ${
    activeSection === "patients" ? "btn-primary" : "btn-outline-primary"
  }`}
              onClick={() => setActiveSection("blockedTimes")}
              
            >
              Bloqueios
            </button>
          </div>

          {activeSection === "patients" && (
            <div>
              <h3 style={{ marginTop: 0 }}>Pacientes</h3>

              <PatientForm
                onSubmit={handleSubmitPatient}
                editingPatient={editingPatient}
                onCancelEdit={() => setEditingPatient(null)}
              />

              <PatientList
                patients={patients}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                canAccessMedicalRecord={canAccessMedicalRecord}
                onOpenMedicalRecord={(patient) =>
                  navigate(`/patients/${patient.id}/prontuario`)
                }
              />
            </div>
          )}

          {activeSection === "spaces" && (
            <div>
              <h3 style={{ marginTop: 0 }}>Espaços</h3>
              <SpaceForm
                onSubmit={handleSubmitSpace}
                editingSpace={editingSpace}
                onCancelEdit={() => setEditingSpace(null)}
              />
              <SpaceList
                spaces={spaces}
                onEdit={setEditingSpace}
                onDelete={handleDeleteSpace}
              />
            </div>
          )}

          {activeSection === "appointments" && (
            <div>
              <h3 style={{ marginTop: 0 }}>Agendamentos</h3>
              <AppointmentForm
                patients={patients}
                spaces={spaces}
                psychologists={psychologists}
                onSubmit={handleSubmitAppointment}
                editingAppointment={editingAppointment}
                onCancelEdit={() => setEditingAppointment(null)}
              />
              <AppointmentList
                appointments={appointments}
                onDelete={handleDeleteAppointment}
                onEdit={setEditingAppointment}
              />
            </div>
          )}

          {activeSection === "blockedTimes" && (
            <div>
              <h3 style={{ marginTop: 0 }}>Bloqueios de horário</h3>
              <BlockedTimeForm onSubmit={handleCreateBlockedTime} />
              <BlockedTimeList
                blockedTimes={blockedTimes}
                onDelete={handleDeleteBlockedTime}
              />
            </div>
          )}
        </div>
      </div>
    </div>}
  </DashboardLayout>
);
}
