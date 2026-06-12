import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getAuditLogs,
  clearAuditLogs
} from "../services/auditLogService";
import { getUserToken } from "../storages/userAuthStorage";

function formatDateTime(value) {
  if (!value) return "Não informado";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getActionLabel(action) {
  const labels = {
    LOGIN_SUCCESS: "Login realizado",
    LOGIN_FAILED: "Tentativa de login inválida",

    PATIENT_CREATED: "Paciente criado",
    PATIENT_UPDATED: "Paciente atualizado",
    PATIENT_DELETED: "Paciente excluído/arquivado",

    APPOINTMENT_CREATED: "Agendamento criado",
    APPOINTMENT_UPDATED: "Agendamento atualizado",
    APPOINTMENT_DELETED: "Agendamento excluído",

    PAYMENT_CREATED: "Pagamento criado",
    PAYMENT_UPDATED: "Pagamento atualizado",
    PAYMENT_DELETED: "Pagamento excluído",

    PAYMENT_RECEIPT_GENERATED: "Recibo gerado",
    PAYMENT_RECEIPT_EMAIL_SENT: "Recibo enviado por e-mail",
    PATIENT_FILE_GENERATED: "Ficha do paciente gerada",
    FINANCIAL_REPORT_GENERATED: "Relatório financeiro gerado",

    USER_CREATED: "Usuário criado",
    USER_UPDATED: "Usuário atualizado",
    USER_STATUS_UPDATED: "Status de usuário alterado",

    CLINIC_CREATED: "Clínica criada",
    CLINIC_UPDATED: "Clínica atualizada",

    MEDICAL_RECORD_CREATED: "Prontuário criado",
    MEDICAL_RECORD_UPDATED: "Prontuário atualizado",
    MEDICAL_RECORD_DELETED: "Prontuário excluído/arquivado",

    SESSION_NOTE_CREATED: "Evolução criada",
    SESSION_NOTE_UPDATED: "Evolução atualizada",
    SESSION_NOTE_DELETED: "Evolução excluída",
  };

  return labels[action] || action || "Ação não informada";
}

function getEntityLabel(entity) {
  const labels = {
    User: "Usuário",
    Clinic: "Clínica",
    Patient: "Paciente",
    Appointment: "Agendamento",
    Payment: "Pagamento",
    MedicalRecord: "Prontuário",
    SessionNote: "Evolução",
    Report: "Relatório",
  };

  return labels[entity] || entity || "Não informado";
}

function formatMetadata(metadata) {
  if (!metadata) return "Sem detalhes";

  if (typeof metadata === "string") {
    return metadata;
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "Não foi possível exibir os detalhes";
  }
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    search: "",
  });

  async function loadAuditLogs() {
    try {
      setLoading(true);

      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const response = await getAuditLogs(authHeaders);

      setLogs(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);

      const message =
        error.response?.data?.error || "Erro ao carregar logs de auditoria";

      alert(message);
    } finally {
      setLoading(false);
    }
  }
  async function handleClearAuditLogs() {
    const confirmed = window.confirm(
      "Deseja realmente limpar todos os logs de auditoria? Essa ação não poderá ser desfeita."
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      await clearAuditLogs(authHeaders);

      setLogs([]);
      setSelectedLog(null);

      alert("Logs de auditoria limpos com sucesso.");
    } catch (error) {
      console.error("Erro ao limpar logs de auditoria:", error);

      const message =
        error.response?.data?.error || "Erro ao limpar logs de auditoria";

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

  function handleClearFilters() {
    setFilters({
      action: "",
      entity: "",
      search: "",
    });
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const actionOptions = useMemo(() => {
    const uniqueActions = new Set();

    logs.forEach((log) => {
      if (log.action) {
        uniqueActions.add(log.action);
      }
    });

    return Array.from(uniqueActions).sort();
  }, [logs]);

  const entityOptions = useMemo(() => {
    const uniqueEntities = new Set();

    logs.forEach((log) => {
      if (log.entity) {
        uniqueEntities.add(log.entity);
      }
    });

    return Array.from(uniqueEntities).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction = filters.action
        ? log.action === filters.action
        : true;

      const matchesEntity = filters.entity
        ? log.entity === filters.entity
        : true;

      const search = filters.search.trim().toLowerCase();

      const matchesSearch = search
        ? [
          log.action,
          log.entity,
          log.entityId,
          log.description,
          log.user?.name,
          log.user?.email,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
        : true;

      return matchesAction && matchesEntity && matchesSearch;
    });
  }, [logs, filters]);

  return (
    <DashboardLayout
      current="auditoria"
      title="Auditoria"
      subtitle="Acompanhe ações realizadas no sistema."
    >
      <div className="premium-card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Ação</label>
            <select
              name="action"
              className="form-select"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>

              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Entidade</label>
            <select
              name="entity"
              className="form-select"
              value={filters.entity}
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>

              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>
                  {getEntityLabel(entity)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Buscar</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Usuário, descrição, entidade..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-2 d-flex gap-2">
            <button
              type="button"
              className="btn btn-pm-ghost rounded-pill px-4"
              onClick={handleClearFilters}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="premium-card p-4">
        <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Logs registrados</h2>
            <p className="text-secondary mb-0">
              {filteredLogs.length} registro(s) encontrado(s)
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary rounded-pill px-4"
            onClick={loadAuditLogs}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Atualizar
          </button>
          <button
            type="button"
            className="btn btn-danger rounded-pill px-4"
            onClick={handleClearAuditLogs}
            disabled={loading || logs.length === 0}
          >
            <i className="bi bi-trash me-2"></i>
            Limpar logs
          </button>
        </div>

        {loading ? (
          <div className="soft-card p-3">
            <p className="mb-0 text-secondary">Carregando auditoria...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="soft-card p-3">
            <p className="mb-0 text-secondary">
              Nenhum log de auditoria encontrado.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr className="text-secondary">
                  <th>Data</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Usuário</th>
                  <th>Descrição</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>

                    <td>
                      <span className="status-pill">
                        {getActionLabel(log.action)}
                      </span>
                    </td>

                    <td>{getEntityLabel(log.entity)}</td>

                    <td>
                      <strong>{log.user?.name || "Sistema"}</strong>
                      <div className="text-secondary small">
                        {log.user?.email || "Sem usuário vinculado"}
                      </div>
                    </td>

                    <td>{log.description || "Sem descrição"}</td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedLog(log)}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLog && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(15, 23, 42, 0.45)",
          }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    Detalhes da auditoria
                  </h5>
                  <p className="text-secondary mb-0 small">
                    {formatDateTime(selectedLog.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedLog(null)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="soft-card p-3 h-100">
                      <p className="text-secondary mb-1">Ação</p>
                      <strong>{getActionLabel(selectedLog.action)}</strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="soft-card p-3 h-100">
                      <p className="text-secondary mb-1">Entidade</p>
                      <strong>{getEntityLabel(selectedLog.entity)}</strong>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="soft-card p-3 h-100">
                      <p className="text-secondary mb-1">Usuário</p>
                      <strong>{selectedLog.user?.name || "Sistema"}</strong>
                      <div className="text-secondary small">
                        {selectedLog.user?.email || "Sem usuário vinculado"}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="soft-card p-3 h-100">
                      <p className="text-secondary mb-1">IP</p>
                      <strong>{selectedLog.ipAddress || "Não informado"}</strong>
                    </div>
                  </div>
                </div>

                <div className="soft-card p-3 mb-3">
                  <p className="text-secondary mb-1">Descrição</p>
                  <strong>{selectedLog.description || "Sem descrição"}</strong>
                </div>

                <div className="soft-card p-3">
                  <p className="text-secondary mb-2">Metadata</p>

                  <pre
                    className="mb-0"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontSize: "0.85rem",
                    }}
                  >
                    {formatMetadata(selectedLog.metadata)}
                  </pre>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-pm-primary rounded-pill px-4"
                  onClick={() => setSelectedLog(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}