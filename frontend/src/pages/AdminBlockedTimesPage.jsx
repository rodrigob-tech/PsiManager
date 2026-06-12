import { useEffect, useState } from "react";
import { getUserToken } from "../storages/userAuthStorage";
import {
  getBlockedTimes,
  createBlockedTime,
  deleteBlockedTime,
} from "../services/blockedTime.service";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function AdminBlockedTimesPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadBlockedTimes() {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const response = await getBlockedTimes(authHeaders);
      setBlockedTimes(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar os bloqueios:", error);
      alert("Erro ao carregar os bloqueios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlockedTimes();
  }, []);

  function buildStartDateTime(date) {
    return `${date}T00:00`;
  }

  function buildEndDateTime(date) {
    return `${date}T23:59`;
  }

  async function handleCreateBlockedTime(event) {
    event.preventDefault();

    if (!startDate || !endDate) {
      alert("Por favor, preencha as datas de início e fim.");
      return;
    }

    const start = buildStartDateTime(startDate);
    const end = buildEndDateTime(endDate);

    if (new Date(start) > new Date(end)) {
      alert("A data de início não pode ser maior que a data de fim.");
      return;
    }

    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await createBlockedTime(
        {
          start,
          end,
        },
        authHeaders
      );

      setStartDate("");
      setEndDate("");

      await loadBlockedTimes();

      alert("Bloqueio criado com sucesso.");
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao criar bloqueio.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBlockedTime(blockedTimeId) {
    const confirmed = window.confirm("Deseja realmente excluir este bloqueio?");
    if (!confirmed) return;

    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await deleteBlockedTime(blockedTimeId, authHeaders);

      await loadBlockedTimes();

      alert("Bloqueio removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao remover bloqueio.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  function formatDateRange(start, end) {
    if (!start || !end) return "Período não informado";

    const initialDate = new Date(start);
    const finalDate = new Date(end);

    const sameDay =
      initialDate.toDateString() === finalDate.toDateString();

    if (sameDay) {
      return `${initialDate.toLocaleDateString("pt-BR")} (dia todo)`;
    }

    return `${initialDate.toLocaleDateString(
      "pt-BR"
    )} a ${finalDate.toLocaleDateString("pt-BR")}`;
  }

  function getBlockedDays(start, end) {
    if (!start || !end) return 0;

    const initialDate = new Date(start);
    const finalDate = new Date(end);

    const diffInMs = finalDate - initialDate;
    const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return Math.max(days, 1);
  }

  return (
    <DashboardLayout
      current="bloqueios"
      title="Bloqueio de horários"
      subtitle="Bloqueie períodos de indisponibilidade para consultas."
    >
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="premium-card p-4">
            <h2 className="h5 fw-bold mb-4">Criar novo bloqueio</h2>

            <form onSubmit={handleCreateBlockedTime}>
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  htmlFor="block-start"
                >
                  Data de início
                </label>

                <input
                  id="block-start"
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  htmlFor="block-end"
                >
                  Data de fim
                </label>

                <input
                  id="block-end"
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="soft-card p-3 mb-4">
                <div className="pm-text-muted small">
                  <i className="bi bi-info-circle me-2"></i>
                  Use esse bloqueio para férias, eventos, manutenção ou
                  períodos de indisponibilidade.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-pm-primary rounded-pill w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Bloqueando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-x me-2"></i>
                    Criar bloqueio
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h5 fw-bold mb-0">Horários bloqueados</h2>

              <span className="badge bg-danger rounded-pill">
                {blockedTimes.length}
              </span>
            </div>

            {blockedTimes.length === 0 ? (
              <div className="soft-card p-4 text-center">
                <i className="bi bi-calendar-check fs-2 text-muted mb-2 d-block"></i>

                <p className="pm-text-muted mb-0">
                  Nenhum bloqueio criado. Sua agenda está completamente
                  disponível.
                </p>
              </div>
            ) : (
              <div className="d-grid gap-3">
                {blockedTimes.map((blockedTime) => {
                  const days = getBlockedDays(
                    blockedTime.start,
                    blockedTime.end
                  );

                  return (
                    <div
                      className="soft-card p-3"
                      key={blockedTime.id}
                      style={{
                        borderLeft: "4px solid var(--pm-primary)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <h3 className="h6 fw-bold mb-1 d-flex align-items-center gap-2">
                            <i className="bi bi-calendar-x"></i>
                            {formatDateRange(
                              blockedTime.start,
                              blockedTime.end
                            )}
                          </h3>

                          <div className="pm-text-muted small">
                            {days} dia{days > 1 ? "s" : ""} bloqueado
                            {days > 1 ? "s" : ""}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-pill"
                          onClick={() =>
                            handleDeleteBlockedTime(blockedTime.id)
                          }
                          disabled={loading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}