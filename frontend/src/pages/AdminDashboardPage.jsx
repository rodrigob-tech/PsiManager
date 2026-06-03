import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getAppointments
} from "../services/appointmentService";
import {
  getPatients
} from "../services/patientService";
import {
  getSpaces
} from "../services/spaceService";

import { getBlockedTimes } from "../services/blockedTime.service";
import { getUserToken, getUserData } from "../storages/userAuthStorage";

function MetricCard({ icon, label, value, helper }) {
  return (
    <div className="premium-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start">
        <div className="metric-icon">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>

      <div className="fs-2 fw-bold mt-3">{value}</div>
      <div className="text-secondary">{label}</div>

      {helper && (
        <div className="small text-secondary mt-2">
          {helper}
        </div>
      )}
    </div>
  );
}

function formatDateTime(dateValue) {
  if (!dateValue) return "Data não informada";

  return new Date(dateValue).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminDashboardPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getUserData();

  async function loadDashboardData() {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [
        appointmentsResponse,
        patientsResponse,
        spacesResponse,
        blockedTimesResponse,
      ] = await Promise.all([
        getAppointments(authHeaders),
        getPatients(authHeaders),
        getSpaces(authHeaders),
        getBlockedTimes(authHeaders),
      ]);

      setAppointments(appointmentsResponse.data || []);
      setPatients(patientsResponse.data || []);
      setSpaces(spacesResponse.data || []);
      setBlockedTimes(blockedTimesResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      alert("Erro ao carregar dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayAppointments = useMemo(() => {
    const today = new Date();

    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);

      return (
        appointmentDate.getFullYear() === today.getFullYear() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getDate() === today.getDate()
      );
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return appointments
      .filter((appointment) => new Date(appointment.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [appointments]);

  const activePatients = useMemo(() => {
    return patients.filter((patient) => patient.status !== "INACTIVE").length;
  }, [patients]);

  const scheduledAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.status === "scheduled" ||
        appointment.status === "SCHEDULED"
    ).length;
  }, [appointments]);

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Resumo operacional da clínica."
      current="dashboard"
    >
      {loading ? (
        <div className="premium-card p-4">
          <p className="mb-0 text-secondary">Carregando dados...</p>
        </div>
      ) : (
        <>
          <div className="premium-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <span className="status-pill">PsiManager</span>
                <h2 className="h4 fw-bold mt-3 mb-1">
                  Bem-vindo{user?.name ? `, ${user.name}` : ""}
                </h2>
                <p className="text-secondary mb-0">
                  Perfil: {user?.role || "Usuário interno"}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-pm-primary rounded-pill px-4"
                onClick={loadDashboardData}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Atualizar
              </button>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-people"
                label="Pacientes ativos"
                value={activePatients}
                helper={`${patients.length} pacientes cadastrados`}
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-calendar-check"
                label="Agendamentos hoje"
                value={todayAppointments.length}
                helper={`${appointments.length} agendamentos no total`}
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-clock-history"
                label="Agendados"
                value={scheduledAppointments}
                helper="Sessões pendentes na agenda"
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-building"
                label="Espaços"
                value={spaces.length}
                helper={`${blockedTimes.length} bloqueios cadastrados`}
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-xl-7">
              <div className="premium-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Próximos agendamentos</h2>
                    <p className="text-secondary mb-0">
                      Atendimentos mais próximos na agenda.
                    </p>
                  </div>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <div className="soft-card p-3">
                    <p className="mb-0 text-secondary">
                      Nenhum agendamento futuro encontrado.
                    </p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="soft-card p-3 d-flex align-items-center justify-content-between gap-3 flex-wrap"
                      >
                        <div>
                          <div className="fw-bold">
                            {appointment.patient?.name || "Paciente não informado"}
                          </div>
                          <div className="text-secondary small">
                            {formatDateTime(appointment.date)}
                            {appointment.psychologist?.name
                              ? ` · ${appointment.psychologist.name}`
                              : ""}
                            {appointment.space?.name
                              ? ` · ${appointment.space.name}`
                              : ""}
                          </div>
                        </div>

                        <span className="status-pill">
                          {appointment.status || "Sem status"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-5">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-3">Resumo da operação</h2>

                <div className="d-grid gap-3">
                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Pacientes cadastrados</span>
                    <strong>{patients.length}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Agendamentos totais</span>
                    <strong>{appointments.length}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Espaços cadastrados</span>
                    <strong>{spaces.length}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Bloqueios de agenda</span>
                    <strong>{blockedTimes.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}