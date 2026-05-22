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
  patients,
  spaces,
  onSubmit,
  psychologists,
  editingAppointment,
  onCancelEdit
}) {
  const [formData, setFormData] = useState({
    patientId: "",
    spaceId: "",
    psychologistId: "",
    date: "",
    status: "scheduled"
  });
 
  useEffect(() => {
   

    if (editingAppointment) {
      setFormData({
        patientId: editingAppointment.patientId || "",
        spaceId: editingAppointment.spaceId || "",
        psychologistId: editingAppointment.psychologistId || "",
        date: formatDateTimeLocal(editingAppointment.date),
        status: editingAppointment.status || "scheduled"
      });
    } else {
      setFormData({
        patientId: "",
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
        patientId: "",
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
        className="form-select"
        name="patientId"
        value={formData.patientId}
        onChange={handleChange}
        required
      >
        <option value="">Selecione um paciente</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
      <select
        className="form-select"
        name="psychologistId"
        value={formData.psychologistId}
        onChange={handleChange}
        required
        
      >
        <option value="">Selecione um psicólogo</option>

        {psychologists.map((psychologist) => (
          <option key={psychologist.id} value={psychologist.id}>
            {psychologist.name}
          </option>
        ))}
      </select>

      <select
        className="form-select"
        name="spaceId"
        value={formData.spaceId}
        onChange={handleChange}
        required
        
      >
        <option value="">Selecione um espaço</option>
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>

      <input
        className="form-control"
        type="datetime-local"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
        
      />

      <select
        className="form-select"
        name="status"
        value={formData.status}
        onChange={handleChange}
      
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          {editingAppointment ? "Salvar alterações" : "Criar agendamento"}
        </button>

        {editingAppointment && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn btn-outline-secondary"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}

