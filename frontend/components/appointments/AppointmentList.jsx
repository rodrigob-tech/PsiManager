const statusStyles = {
  scheduled: {
    label: "Agendado",
    background: "#e3f2fd",
    color: "#1565c0"
  },
  confirmed: {
    label: "Confirmado",
    background: "#e8f5e9",
    color: "#2e7d32"
  },
  pending: {
    label: "Pendente",
    background: "#fff8e1",
    color: "#8d6e00"
  },
  canceled: {
    label: "Cancelado",
    background: "#fdecea",
    color: "#b42318"
  },
  done: {
    label: "Concluído",
    background: "#eeeeee",
    color: "#555"
  }
};

export default function AppointmentList({
  appointments,
  onDelete,
  onEdit
}) {
  if (!appointments?.length) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          borderRadius: "12px",
          padding: "14px",
          color: "#666"
        }}
      >
        Nenhum agendamento cadastrado.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "12px"
      }}
    >
      {appointments.map((appointment) => {
        const statusStyle =
          statusStyles[appointment.status] || statusStyles.scheduled;

        return (
          <div
            key={appointment.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "16px",
              background: "#fff"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "grid", gap: "6px" }}>
                <div>
                  <strong>Cliente:</strong>{" "}
                  {appointment.client?.name || "Sem nome"}
                </div>

                <div>
                  <strong>Espaço:</strong>{" "}
                  {appointment.space?.name || "Sem espaço"}
                </div>

                <div>
                  <strong>Data:</strong>{" "}
                  {new Date(appointment.date).toLocaleDateString("pt-BR")}
                </div>

                <div>
                  <strong>Horário:</strong>{" "}
                  {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })}
                </div>
              </div>

              <div
                style={{
                  background: statusStyle.background,
                  color: statusStyle.color,
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontWeight: "700",
                  fontSize: "14px",
                  whiteSpace: "nowrap"
                }}
              >
                {statusStyle.label}
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              <button
                type="button"
                onClick={() => onEdit(appointment)}
                style={editButton}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete(appointment.id)}
                style={deleteButton}
              >
                Excluir
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const editButton = {
  border: "none",
  background: "#fffb03",
  color: "#000000",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};

const deleteButton = {
  border: "none",
  background: "#d32f2f",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};