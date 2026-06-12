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
import { getUserToken } from "../storages/userAuthStorage";
import { getPsychologists } from "../services/userService";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function AdminAgendaPage() {
    const [events, setEvents] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
    const [selectedSpaceFilter, setSelectedSpaceFilter] = useState("all");
    const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
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
    function getStatusLabel(status) {
            const statusLabels = {
                scheduled: "Agendado",
                confirmed: "Confirmado",
                pending: "Pendente",
                canceled: "Cancelado",
                done: "Concluído",
            };

            return statusLabels[status] || status || "Não informado";
        }
    return (
        <DashboardLayout
            title="Calendário Geral"
            subtitle="Visualize agendamentos e bloqueios da clínica."
            current="agenda"
            showSidebar={showSidebar}
        >
            <div className="premium-card p-4 mb-4">


                <div

                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "12px",
                            flexWrap: "wrap",
                            marginBottom: "20px"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap"
                            }}
                        >
                            <select
                                className="form-select"
                                style={{ width: "220px" }}
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
                                style={{ width: "220px" }}
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
                            <button
                                type="button"
                                class="btn btn-info rounded-pill px-4"
                                onClick={() => setShowSidebar((current) => !current)}
                            >
                                <i className={`bi ${showSidebar ? "bi-arrows-fullscreen" : "bi-layout-sidebar"} me-1`}></i>
                                {showSidebar ? "Expandir calendário" : "Mostrar menu lateral"}
                            </button>
                        </div>


                    </div>
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
                                            {getStatusLabel(selectedCalendarEvent.extendedProps?.status)}
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
                                class="btn btn-danger rounded-pill"
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