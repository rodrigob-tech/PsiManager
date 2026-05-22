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
      
    >
      {appointments.map((appointment) => {
        const statusStyle =
          statusStyles[appointment.status] || statusStyles.scheduled;

        return (
          <div
            key={appointment.id}
            className="table-responsive"
          >
            <table className="table ">
              <thead >
                <tr>
                  <th>Paciente:</th>{" "}
                  {appointment.patient?.name || "Sem nome"}
                </tr>

                <tr>
                  <th>Espaço:</th>{" "}
                  {appointment.space?.name || "Sem espaço"}
                </tr>

                <tr>
                  <th>Data:</th>{" "}
                  {new Date(appointment.date).toLocaleDateString("pt-BR")}
                </tr>

                <tr>
                  <th>Horário:</th>{" "}
                  {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false
                  })}
                </tr>
                <tr>
                  <th>Status:</th>{" "}
                  {statusStyle.label}
                </tr>
                
              </thead>

            </table>

            <thead>
              <tr>
                <th><button
                  type="button"
                  onClick={() => onEdit(appointment)}
                  className="btn btn-outline-primary"
                >
                  Editar
                </button></th>
                <th>  <button
                  type="button"
                  onClick={() => onDelete(appointment.id)}
                  className="btn btn-outline-danger"
                >
                  Excluir
                </button></th>

              </tr>


            </thead>


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
