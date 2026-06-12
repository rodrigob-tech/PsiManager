const statusStyles = {
  scheduled: {
    label: "Agendado",
    className: "status-pill",
  },
  confirmed: {
    label: "Confirmado",
    className: "status-pill-success",
  },
  pending: {
    label: "Pendente",
    className: "status-pill bg-warning-subtle text-warning-emphasis",
  },
  canceled: {
    label: "Cancelado",
    className: "status-pill bg-danger-subtle text-danger-emphasis",
  },
  done: {
    label: "Concluído",
    className: "status-pill bg-secondary-subtle text-secondary-emphasis",
  },
};

export default function AppointmentList({ appointments, onDelete, onEdit }) {
  if (!appointments?.length) {
    return (
      <div className="soft-card p-4 text-center text-secondary">
        <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
        Nenhum agendamento encontrado.
      </div>
    );
  }

  return (
    <div className="d-grid gap-3">
      {appointments.map((appointment) => {
        const statusStyle =
          statusStyles[appointment.status] || statusStyles.scheduled;

        return (
          <div
            key={appointment.id}
            className="soft-card p-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
          >
            <div className="d-flex align-items-center gap-3">
              <div className="avatar">
                {getInitials(appointment.patient?.name || "Paciente")}
              </div>

              <div>
                <div className="fw-bold fs-5">
                  {formatTime(appointment.date)}
                </div>

                <div className="text-main">
                  {appointment.patient?.name || "Paciente não informado"} ·{" "}
                  {appointment.space?.name || "Espaço não informado"}
                </div>

                <div className="text-main small">
                  {formatDate(appointment.date)}
                  {appointment.psychologist?.name
                    ? ` · ${appointment.psychologist.name}`
                    : ""}
                </div>

               
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
              <span className={statusStyle.className}>{statusStyle.label}</span>

              <button
                type="button"
                class="btn btn-warning rounded-pill btn-sm"
                onClick={() => onEdit(appointment)}
              >
                <i className="bi bi-pencil me-1"></i>
                Editar
              </button>

              <button
                type="button"
                class="btn btn-danger rounded-pill btn-sm"
                onClick={() => onDelete(appointment.id)}
              >
                <i className="bi bi-trash me-1"></i>
                Excluir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A"
  );
}

function formatDate(dateString) {
  if (!dateString) return "Data não informada";

  return new Date(dateString).toLocaleDateString("pt-BR");
}

function formatTime(dateString) {
  if (!dateString) return "--:--";

  return new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function translateGoogleStatus(status) {
  const labels = {
    synced: "sincronizado",
    failed: "falhou",
    pending: "pendente",
  };

  return labels[status] || status;
}