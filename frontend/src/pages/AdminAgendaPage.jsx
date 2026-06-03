import { useEffect, useState } from "react";
import AppointmentCalendar from "../components/appointments/AppointmentCalendar";


import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../services/appointmentService";

import {
  mapAppointmentsToEvents,
  mapBlockedTimesToEvents
} from "/src/utils/appointmentMapper";

import {
  getBlockedTimes,
  createBlockedTime,
  deleteBlockedTime
} from "../services/blockedTime.service";

import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patientService";
import {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace
} from "../services/spaceService";
import { getUserToken} from "../storages/userAuthStorage";
import { getPsychologists } from "../services/userService";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function AdminAgendaPage() {
     const [events, setEvents] = useState([]);
     const [spaces, setSpaces] = useState([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
    const [selectedSpaceFilter, setSelectedSpaceFilter] = useState("all");
    const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);

    async function loadData() {
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
            setEvents([...appointmentEvents, ...blockedEvents]);
            setSpaces(spacesResponse.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    }
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

    useEffect(() => {
        loadData();
    }, []);
    return (
        <DashboardLayout>
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
        </DashboardLayout>
    );
}