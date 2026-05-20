import { useEffect, useState } from "react";
import { STATUS_OPTIONS } from "../../constants/appointmentStatus";

function formatDateTimeLocal(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AppointmentForm({
  clients,
  spaces,
  onSubmit,
  editingAppointment,
  onCancelEdit
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    spaceId: "",
    date: "",
    status: "scheduled"
  });

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        clientId: editingAppointment.clientId || "",
        spaceId: editingAppointment.spaceId || "",
        date: formatDateTimeLocal(editingAppointment.date),
        status: editingAppointment.status || "scheduled"
      });
    } else {
      setFormData({
        clientId: "",
        spaceId: "",
        date: "",
        status: "scheduled"
      });
    }
  }, [editingAppointment]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);

    if (!editingAppointment) {
      setFormData({
        clientId: "",
        spaceId: "",
        date: "",
        status: "scheduled"
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "12px",
        marginBottom: "20px",
        padding: "16px",
        background: "#f8faff",
        border: "1px solid #e1e8f5",
        borderRadius: "14px"
      }}
    >
      <h3 style={{ margin: 0 }}>
        {editingAppointment ? "Editar agendamento" : "Novo agendamento"}
      </h3>

      <select
        name="clientId"
        value={formData.clientId}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Selecione um cliente</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <select
        name="spaceId"
        value={formData.spaceId}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Selecione um espaço</option>
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        style={inputStyle}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" style={primaryButton}>
          {editingAppointment ? "Salvar alterações" : "Criar agendamento"}
        </button>

        {editingAppointment && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={secondaryButton}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d0d7e2",
  fontSize: "14px",
  background: "#fff"
};

const primaryButton = {
  border: "none",
  background: "#02af11",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  minWidth: "170px",
  height: "42px"
};

const secondaryButton = {
  border: "1px solid #d0d7e2",
  background: "#fff",
  color: "#333",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
};