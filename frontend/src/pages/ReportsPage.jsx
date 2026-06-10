import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import MetricCard from "../components/metrics/MetricCard";
import { getUserToken } from "../storages/userAuthStorage";
import { getReports } from "../services/reportService";
import { getFinancialReportPdf } from "../services/documentService";
function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateTime(value) {
  if (!value) return "Não informado";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusLabel(status) {
  const labels = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    pending: "Pendente",
    canceled: "Cancelado",
    done: "Realizado",
    SCHEDULED: "Agendado",
    CONFIRMED: "Confirmado",
    PENDING: "Pendente",
    CANCELED: "Cancelado",
    DONE: "Realizado",
    PAID: "Pago",
  };

  return labels[status] || status || "Sem status";
}

function getPaymentStatusLabel(status) {
  const labels = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return labels[status] || status || "Sem status";
}

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  async function loadReports(customFilters = filters) {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const params = {};

      if (customFilters.startDate) {
        params.startDate = customFilters.startDate;
      }

      if (customFilters.endDate) {
        params.endDate = customFilters.endDate;
      }

      const response = await getReports(params, authHeaders);

      setReport(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      const message =
        error.response?.data?.error || "Erro ao carregar relatórios";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmitFilters(event) {
    event.preventDefault();
    loadReports(filters);
  }

  function handleClearFilters() {
    const cleanFilters = {
      startDate: "",
      endDate: "",
    };

    setFilters(cleanFilters);
    loadReports(cleanFilters);
  }
  async function handleOpenFinancialReportPdf() {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const params = {};

      if (filters.startDate) {
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        params.endDate = filters.endDate;
      }

      const response = await getFinancialReportPdf(params, authHeaders);

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Erro ao gerar relatório financeiro em PDF:", error);

      const message =
        error.response?.data?.error ||
        "Erro ao gerar relatório financeiro em PDF";

      alert(message);
    }
  }
  useEffect(() => {
    loadReports();
  }, []);

  const totals = report?.totals || {};
  const appointmentsByStatus = report?.appointmentsByStatus || {};
  const revenueByPsychologist = report?.revenueByPsychologist || [];
  const recentAppointments = report?.recentAppointments || [];
  const recentPayments = report?.recentPayments || [];

  const completionRate = useMemo(() => {
    if (!totals.appointments) return 0;

    return Math.round(
      (Number(totals.completedAppointments || 0) /
        Number(totals.appointments || 1)) *
      100
    );
  }, [totals]);

  return (
    <DashboardLayout
      current="relatorios"
      title="Relatórios"
      subtitle="Acompanhe indicadores operacionais e financeiros da clínica."
    >
      <div className="premium-card p-4 mb-4">
        <form
          onSubmit={handleSubmitFilters}
          className="row g-3 align-items-end"
        >
          <div className="col-md-4">
            <label className="form-label fw-semibold">Data inicial</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Data final</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-4 d-flex gap-2">
            <button
              type="submit"
              className="btn btn-pm-primary rounded-pill px-4"
            >
              Filtrar
            </button>

            <button
              type="button"
              className="btn btn-pm-ghost rounded-pill px-4"
              onClick={handleClearFilters}
            >
              Limpar
            </button>
            <button
              type="button"
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={handleOpenFinancialReportPdf}
            >
              Exportar PDF
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="premium-card p-4">
          <p className="mb-0 text-secondary">Carregando relatórios...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-people"
                label="Pacientes ativos"
                value={totals.activePatients || 0}
                trend={`${totals.patients || 0} cadastrados`}
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-calendar-check"
                label="Agendamentos"
                value={totals.appointments || 0}
                trend={`${totals.scheduledAppointments || 0} agendados`}
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-cash-stack"
                label="Receita recebida"
                value={formatCurrency(totals.totalReceived)}
                trend="Pagamentos pagos"
              />
            </div>

            <div className="col-md-6 col-xl-3">
              <MetricCard
                icon="bi-hourglass-split"
                label="A receber"
                value={formatCurrency(totals.totalPending)}
                trend="Pagamentos pendentes"
              />
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-3">Status dos agendamentos</h2>

                <div className="d-grid gap-3">
                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Agendados</span>
                    <strong>{appointmentsByStatus.scheduled || 0}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Realizados</span>
                    <strong>{appointmentsByStatus.done || 0}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Cancelados</span>
                    <strong>{appointmentsByStatus.canceled || 0}</strong>
                  </div>

                  <div className="soft-card p-3 d-flex justify-content-between">
                    <span className="text-secondary">Taxa de realização</span>
                    <strong>{completionRate}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-3">Receita por psicólogo</h2>

                {revenueByPsychologist.length === 0 ? (
                  <div className="soft-card p-3">
                    <p className="mb-0 text-secondary">
                      Nenhum dado de receita por psicólogo encontrado.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="text-secondary">
                          <th>Psicólogo</th>
                          <th>Agendamentos</th>
                          <th>Receita</th>
                        </tr>
                      </thead>

                      <tbody>
                        {revenueByPsychologist.map((item) => (
                          <tr key={item.psychologistId}>
                            <td>
                              <strong>{item.psychologistName}</strong>
                            </td>
                            <td>{item.appointmentsCount}</td>
                            <td>
                              <strong>{formatCurrency(item.revenue)}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-xl-6">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-3">Agendamentos recentes</h2>

                {recentAppointments.length === 0 ? (
                  <div className="soft-card p-3">
                    <p className="mb-0 text-secondary">
                      Nenhum agendamento encontrado no período.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="text-secondary">
                          <th>Paciente</th>
                          <th>Data</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentAppointments.map((appointment) => (
                          <tr key={appointment.id}>
                            <td>
                              <strong>
                                {appointment.patient?.name ||
                                  "Paciente não informado"}
                              </strong>
                              <div className="text-secondary small">
                                {appointment.psychologist?.name ||
                                  "Psicólogo não informado"}
                              </div>
                            </td>

                            <td>{formatDateTime(appointment.date)}</td>

                            <td>
                              <span className="status-pill">
                                {getStatusLabel(appointment.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-6">
              <div className="premium-card p-4 h-100">
                <h2 className="h5 fw-bold mb-3">Pagamentos recentes</h2>

                {recentPayments.length === 0 ? (
                  <div className="soft-card p-3">
                    <p className="mb-0 text-secondary">
                      Nenhum pagamento encontrado no período.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="text-secondary">
                          <th>Paciente</th>
                          <th>Valor</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              <strong>
                                {payment.appointment?.patient?.name ||
                                  "Paciente não informado"}
                              </strong>
                              <div className="text-secondary small">
                                {formatDateTime(payment.appointment?.date)}
                              </div>
                            </td>

                            <td>
                              <strong>{formatCurrency(payment.amount)}</strong>
                            </td>

                            <td>
                              <span className="status-pill">
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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