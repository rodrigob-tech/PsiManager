import { useEffect, useState } from "react";

const initialFormData = {
  appointmentId: "",
  amount: "",
  status: "PENDING",
  method: "PIX",
  paidAt: "",
  notes: "",
};

const paymentStatusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
];

const paymentMethodOptions = [
  { value: "PIX", label: "Pix" },
  { value: "CASH", label: "Dinheiro" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "DEBIT_CARD", label: "Cartão de débito" },
  { value: "BANK_TRANSFER", label: "Transferência bancária" },
  { value: "OTHER", label: "Outro" },
];

function formatDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

function formatAppointmentLabel(appointment) {
  const patientName = appointment.patient?.name || "Paciente não informado";
  const psychologistName = appointment.psychologist?.name || "Sem psicólogo";
  const date = appointment.date
    ? new Date(appointment.date).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Data não informada";

  return `${patientName} · ${psychologistName} · ${date}`;
}

export default function PaymentForm({
  appointments = [],
  editingPayment = null,
  onSubmit,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        appointmentId: editingPayment.appointmentId || "",
        amount: editingPayment.amount ? String(editingPayment.amount) : "",
        status: editingPayment.status || "PENDING",
        method: editingPayment.method || "PIX",
        paidAt: formatDateTimeLocal(editingPayment.paidAt),
        notes: editingPayment.notes || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingPayment]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.appointmentId) {
      alert("Selecione um agendamento.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    const payload = {
      appointmentId: formData.appointmentId,
      amount: Number(formData.amount),
      status: formData.status,
      method: formData.method || null,
      paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : null,
      notes: formData.notes || null,
    };

    await onSubmit(payload);

    if (!editingPayment) {
      setFormData(initialFormData);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label fw-semibold">Agendamento</label>
        <select
          name="appointmentId"
          className="form-select"
          value={formData.appointmentId}
          onChange={handleChange}
          disabled={Boolean(editingPayment)}
          required
        >
          <option value="">Selecione um agendamento</option>

          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {formatAppointmentLabel(appointment)}
            </option>
          ))}
        </select>

        {editingPayment && (
          <div className="form-text">
            O agendamento não pode ser alterado durante a edição do pagamento.
          </div>
        )}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold">Valor</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="Ex: 200.00"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Status</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {paymentStatusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Método de pagamento</label>
          <select
            name="method"
            className="form-select"
            value={formData.method}
            onChange={handleChange}
          >
            {paymentMethodOptions.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-semibold">Data de pagamento</label>
          <input
            type="datetime-local"
            name="paidAt"
            className="form-control"
            value={formData.paidAt}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold">Observações</label>
          <textarea
            name="notes"
            className="form-control"
            rows="4"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Observações internas sobre o pagamento"
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        

        <button type="submit" className="btn btn-pm-primary rounded-pill px-4">
          <i className="bi bi-check me-1"></i>
          {editingPayment ? "Atualizar pagamento" : "Registrar pagamento"}
        </button>
        {editingPayment && (
          <button
            type="button"
            className="btn btn-danger rounded-pill px-4"
            onClick={onCancelEdit}
          >
            <i className="bi bi-trash me-1"></i>
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}