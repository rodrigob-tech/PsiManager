import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getClientToken, getClientData } from "../src/services/clientAuthStorage";



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

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const client = getClientData();

  useEffect(() => {
    loadAppointments();
  }, []);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });

      const token = getClientToken();

      const response = await api.get("/client-bookings/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppointments(response.data);
    } catch (error) {
      console.error("Erro ao buscar meus agendamentos:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.error || "Erro ao buscar agendamentos"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
      "Deseja realmente cancelar este agendamento?"
    );
    if (!confirmed) return;

    try {
      setFeedback({ type: "", message: "" });

      const token = getClientToken();

      await api.patch(`/client-bookings/${appointmentId}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setFeedback({
        type: "success",
        message: "Agendamento cancelado com sucesso."
      });

      await loadAppointments();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      setFeedback({
        type: "error",
        message:
          error.response?.data?.error || "Erro ao cancelar agendamento"
      });
    }
  };

  const feedbackStyles = {
    error: {
      background: "#fdecea",
      color: "#b42318",
      border: "1px solid #f5c2c7"
    },
    success: {
      background: "#ecfdf3",
      color: "#027a48",
      border: "1px solid #abefc6"
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            marginBottom: "24px"
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>Meus agendamentos</h1>
          <p style={{ margin: "8px 0 0", color: "#555" }}>
            Consulte seus horários marcados e acompanhe o status de cada atendimento.
          </p>

          <div
            style={{
              marginTop: "18px",
              background: "#eef3ff",
              borderRadius: "12px",
              padding: "12px 16px",
              display: "inline-block"
            }}
          >
            <div style={{ fontSize: "14px", color: "#555" }}>Cliente</div>
            <div style={{ fontWeight: "600" }}>{client?.name}</div>
            <div style={{ fontSize: "14px", color: "#555" }}>
              {client?.email}
            </div>
          </div>
        </div>

        {feedback.message && (
          <div
            style={{
              ...feedbackStyles[feedback.type],
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
              fontWeight: "500"
            }}
          >
            {feedback.message}
          </div>
        )}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
          }}
        >
          {loading ? (
            <p style={{ color: "#666", margin: 0 }}>Carregando agendamentos...</p>
          ) : sortedAppointments.length === 0 ? (
            <div
              style={{
                background: "#f8f9fc",
                borderRadius: "12px",
                padding: "18px",
                color: "#666"
              }}
            >
              Você ainda não possui agendamentos.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px"
              }}
            >
              {sortedAppointments.map((appointment) => {
                const statusStyle =
                  statusStyles[appointment.status] || statusStyles.scheduled;

                return (
                  <div
                    key={appointment.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "18px",
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
                      <div style={{ display: "grid", gap: "8px" }}>
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

                        <div>
                          <strong>Espaço:</strong>{" "}
                          {appointment.space?.name || "Não informado"}
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

                    {appointment.status !== "canceled" && (
                      <div style={{ marginTop: "16px" }}>
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          style={{
                            border: "none",
                            background: "#d32f2f",
                            color: "#fff",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600"
                          }}
                        >
                          Cancelar agendamento
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}