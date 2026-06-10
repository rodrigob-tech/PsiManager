import { useEffect, useMemo, useState } from "react";


import DashboardLayout from "../components/layout/DashboardLayout";
import MetricCard from "../components/metrics/MetricCard";
import PaymentForm from "../components/payments/PaymentForm";

import { getAppointments } from "../services/appointmentService";
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../services/paymentService";

import { getUserToken } from "../storages/userAuthStorage";
import { getPaymentReceipt } from "../services/documentService";
function formatCurrency(value) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("pt-BR", {
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

function getPaymentStatusLabel(status) {
  const labels = {
    PENDING: "Pendente",
    PAID: "Pago",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return labels[status] || status || "Sem status";
}

function getPaymentMethodLabel(method) {
  const labels = {
    PIX: "Pix",
    CASH: "Dinheiro",
    CREDIT_CARD: "Cartão de crédito",
    DEBIT_CARD: "Cartão de débito",
    BANK_TRANSFER: "Transferência bancária",
    OTHER: "Outro",
  };

  return labels[method] || method || "Não informado";
}

function getStatusBadgeClass(status) {
  if (status === "PAID") return "text-bg-success";
  if (status === "PENDING") return "text-bg-warning";
  if (status === "CANCELED") return "text-bg-danger";
  if (status === "REFUNDED") return "text-bg-secondary";

  return "text-bg-light";
}

export default function FinancePage() {
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [paymentsResponse, appointmentsResponse] = await Promise.all([
        getPayments(authHeaders),
        getAppointments(authHeaders),
      ]);

      setPayments(paymentsResponse.data || []);
      setAppointments(appointmentsResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      alert("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitPayment(formData) {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (editingPayment) {
        await updatePayment(editingPayment.id, formData, authHeaders);
        alert("Pagamento atualizado com sucesso");
        setEditingPayment(null);
      } else {
        await createPayment(formData, authHeaders);
        alert("Pagamento registrado com sucesso");
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao salvar pagamento:", error);
      const message = error.response?.data?.error || "Erro ao salvar pagamento";
      alert(message);
    }
  }

  async function handleDeletePayment(id) {
    const confirmed = window.confirm("Deseja realmente excluir este pagamento?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await deletePayment(id, authHeaders);
      alert("Pagamento removido com sucesso");

      if (editingPayment?.id === id) {
        setEditingPayment(null);
      }

      await loadData();
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error);
      const message = error.response?.data?.error || "Erro ao excluir pagamento";
      alert(message);
    }
  }
  async function handleOpenReceipt(paymentId) {
    try {
      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const response = await getPaymentReceipt(paymentId, authHeaders);

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Erro ao gerar recibo:", error);

      const message =
        error.response?.data?.error || "Erro ao gerar recibo de pagamento";

      alert(message);
    }
  }
  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const paidPayments = payments.filter((payment) => payment.status === "PAID");
    const pendingPayments = payments.filter(
      (payment) => payment.status === "PENDING"
    );
    const canceledOrRefundedPayments = payments.filter(
      (payment) =>
        payment.status === "CANCELED" || payment.status === "REFUNDED"
    );

    const totalReceived = paidPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalPending = pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const totalCanceledOrRefunded = canceledOrRefundedPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    const averageTicket =
      paidPayments.length > 0 ? totalReceived / paidPayments.length : 0;

    return {
      totalReceived,
      totalPending,
      totalCanceledOrRefunded,
      averageTicket,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      totalCount: payments.length,
    };
  }, [payments]);

  return (
    <DashboardLayout
      current="financeiro"
      title="Financeiro"
      subtitle="Acompanhe receitas, pendências e performance financeira."
    >
      {loading ? (
        <div className="premium-card p-4">
          <p className="mb-0 text-secondary">Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <MetricCard
                icon="bi-cash-stack"
                label="Receita recebida"
                value={formatCurrency(metrics.totalReceived)}
                trend={`${metrics.paidCount} pagos`}
              />
            </div>

            <div className="col-md-4">
              <MetricCard
                icon="bi-hourglass-split"
                label="A receber"
                value={formatCurrency(metrics.totalPending)}
                trend={`${metrics.pendingCount} pendentes`}
              />
            </div>

            <div className="col-md-4">
              <MetricCard
                icon="bi-receipt"
                label="Ticket médio"
                value={formatCurrency(metrics.averageTicket)}
                trend={`${metrics.totalCount} registros`}
              />
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="premium-card p-4">
                <h2 className="h5 fw-bold mb-3">
                  {editingPayment ? "Editar pagamento" : "Registrar pagamento"}
                </h2>

                <PaymentForm
                  appointments={appointments}
                  editingPayment={editingPayment}
                  onSubmit={handleSubmitPayment}
                  onCancelEdit={() => setEditingPayment(null)}
                />
              </div>
            </div>

            <div className="col-lg-8">
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Movimentações recentes</h2>
                    <p className="text-secondary mb-0">
                      Pagamentos vinculados aos agendamentos.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-pm-ghost rounded-pill px-4"
                    onClick={loadData}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Atualizar
                  </button>
                </div>

                {payments.length === 0 ? (
                  <div className="soft-card p-3">
                    <p className="mb-0 text-secondary">
                      Nenhum pagamento registrado ainda.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr className="text-secondary">
                          <th>Paciente</th>
                          <th>Agendamento</th>
                          <th>Valor</th>
                          <th>Método</th>
                          <th>Status</th>
                          <th>Pago em</th>
                          <th className="text-end">Ações</th>
                        </tr>
                      </thead>

                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td>
                              <strong>
                                {payment.appointment?.patient?.name ||
                                  "Paciente não informado"}
                              </strong>
                              <div className="text-secondary small">
                                {payment.appointment?.psychologist?.name
                                  ? `Psicólogo: ${payment.appointment.psychologist.name}`
                                  : "Psicólogo não informado"}
                              </div>
                            </td>

                            <td>
                              <div>
                                {formatDateTime(payment.appointment?.date)}
                              </div>
                              <div className="text-secondary small">
                                {payment.appointment?.space?.name ||
                                  "Espaço não informado"}
                              </div>
                            </td>

                            <td>
                              <strong>{formatCurrency(payment.amount)}</strong>
                            </td>

                            <td>{getPaymentMethodLabel(payment.method)}</td>

                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  payment.status
                                )}`}
                              >
                                {getPaymentStatusLabel(payment.status)}
                              </span>
                            </td>

                            <td>{formatDateTime(payment.paidAt)}</td>

                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary rounded-pill"
                                  onClick={() => setEditingPayment(payment)}
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-pill"
                                  onClick={() => handleDeletePayment(payment.id)}
                                >
                                  Excluir
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleOpenReceipt(payment.id)}
                                >
                                  Recibo
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="soft-card p-3 mt-4">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <span className="text-secondary">Cancelados/Reembolsados</span>
                    <strong>
                      {formatCurrency(metrics.totalCanceledOrRefunded)}
                    </strong>
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