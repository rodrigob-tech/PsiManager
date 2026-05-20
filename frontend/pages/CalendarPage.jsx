import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import ClientForm from "../components/appointments/ClientForm";
import ClientList from "../components/appointments/ClientList";
import { getClients, createClient,updateClient, deleteClient } from "../services/clientService";

import SpaceForm from "../components/appointments/SpaceForm";
import SpaceList from "../components/appointments/SpaceList";
import {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace
} from "../services/spaceService";
import { getUserToken, getUserData, clearUserAuth } from "../src/services/userAuthStorage";






const sectionCardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState("all");
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [activeSection, setActiveSection] = useState("appointments");
  

  const admin = getUserData();

  const loadData = async () => {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      const [
        appointmentsResponse,
        clientsResponse,
        blockedTimesResponse,
        spacesResponse
      ] = await Promise.all([
        getAppointments(authHeaders),
        getClients(authHeaders),
        getBlockedTimes(authHeaders),
        getSpaces(authHeaders)
      ]);

      const appointmentEvents = mapAppointmentsToEvents(appointmentsResponse.data);
      const blockedEvents = mapBlockedTimesToEvents(blockedTimesResponse.data);

      setAppointments(appointmentsResponse.data);
      setEvents([...appointmentEvents, ...blockedEvents]);
      setClients(clientsResponse.data);
      setBlockedTimes(blockedTimesResponse.data);
      setSpaces(spacesResponse.data);
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

const handleSubmitClient = async (formData) => {
  try {
    const token = getUserToken();
    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    if (editingClient) {
      await updateClient(editingClient.id, formData, authHeaders);
      alert("Cliente atualizado com sucesso");
      setEditingClient(null);
      await loadData();
    }
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);

    const message =
      error.response?.data?.error || "Erro ao salvar cliente";

    alert(message);
  }
};

  const handleEditClient = (client) => {
  setEditingClient(client);
};
const handleDeleteClient = async (id) => {
  const confirmed = window.confirm("Deseja realmente excluir este cliente?");
  if (!confirmed) return;

  try {
    const token = getUserToken();
    const authHeaders = {
      Authorization: `Bearer ${token}`
    };

    await deleteClient(id, authHeaders);
    await loadData();
    alert("Cliente removido com sucesso");
  } catch (error) {
    console.error("Erro ao remover cliente:", error);

    const message =
      error.response?.data?.error || "Erro ao remover cliente";

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
    <div
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
                <div style={sectionCardStyle}>
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
      value={selectedStatusFilter}
      onChange={(e) => setSelectedStatusFilter(e.target.value)}
      style={{
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #d0d7e2",
        background: "#fff"
      }}
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
      value={selectedSpaceFilter}
      onChange={(e) => setSelectedSpaceFilter(e.target.value)}
      style={{
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #d0d7e2",
        background: "#fff"
      }}
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
                <strong>Cliente:</strong>{" "}
                {selectedCalendarEvent.extendedProps?.clientName}
              </div>
              <div>
                <strong>Email:</strong>{" "}
                {selectedCalendarEvent.extendedProps?.clientEmail || "Não informado"}
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

<div style={sectionCardStyle}>
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
      onClick={() => setActiveSection("clients")}
      style={getTabButtonStyle("clients")}
    >
      Clientes
    </button>

    <button
      type="button"
      onClick={() => setActiveSection("spaces")}
      style={getTabButtonStyle("spaces")}
    >
      Espaços
    </button>

    <button
      type="button"
      onClick={() => setActiveSection("appointments")}
      style={getTabButtonStyle("appointments")}
    >
      Agendamentos
    </button>

    <button
      type="button"
      onClick={() => setActiveSection("blockedTimes")}
      style={getTabButtonStyle("blockedTimes")}
    >
      Bloqueios
    </button>
  </div>

  {activeSection === "clients" && (
  <div>
    <h3 style={{ marginTop: 0 }}>Clientes</h3>

    {editingClient && (
      <div style={{ marginBottom: "20px" }}>
        <ClientForm
          onSubmit={handleSubmitClient}
          editingClient={editingClient}
          onCancelEdit={() => setEditingClient(null)}
        />
      </div>
    )}

    <ClientList
      clients={clients}
      onEdit={handleEditClient}
      onDelete={handleDeleteClient}
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
        clients={clients}
        spaces={spaces}
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
    </div>
  );
}
