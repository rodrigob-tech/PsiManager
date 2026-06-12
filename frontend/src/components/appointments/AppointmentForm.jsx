import { useEffect, useState } from "react";
import { STATUS_OPTIONS } from "../../../constants/appointmentStatus";

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
function toBrasiliaDateTime(dateTimeLocalValue) {
  if (!dateTimeLocalValue) return "";

  return `${dateTimeLocalValue}:00-03:00`;
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

  await onSubmit({
    ...formData,
    date: formData.date,
  });

  if (!editingAppointment) {
    setFormData({
      patientId: "",
      spaceId: "",
      psychologistId: "",
      date: "",
      status: "scheduled"
    });
  }
};

  return (
  <form onSubmit={handleSubmit} className="d-grid gap-3">
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold" htmlFor="appointment-patient">
          Paciente
        </label>

        <select
          id="appointment-patient"
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
      </div>

      <div className="col-md-6">
        <label
          className="form-label fw-semibold"
          htmlFor="appointment-psychologist"
        >
          Psicólogo
        </label>

        <select
          id="appointment-psychologist"
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
      </div>

      <div className="col-md-6">
        <label className="form-label fw-semibold" htmlFor="appointment-space">
          Espaço
        </label>

        <select
          id="appointment-space"
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
      </div>

      <div className="col-md-6">
        <label className="form-label fw-semibold" htmlFor="appointment-date">
          Data e horário
        </label>

        <input
          id="appointment-date"
          className="form-control"
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label fw-semibold" htmlFor="appointment-status">
          Status
        </label>

        <select
          id="appointment-status"
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
      </div>
    </div>

    <div className="d-flex justify-content-end gap-2 mt-2 flex-wrap">
      <button type="submit" className="btn btn-success rounded-pill">
        {editingAppointment ? "Salvar alterações" : "Salvar agendamento"}
      </button>
      {editingAppointment && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="btn btn-danger rounded-pill px-4"
        >
          Cancelar
        </button>
      )}

      
    </div>
  </form>
);
}

