import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SpaceSelector from "../components/publicBooking/SpaceSelector";
import SlotSelector from "../components/publicBooking/SlotSelector";
import PublicBookingForm from "../components/publicBooking/PublicBookingForm";
import {
  getClientToken,
  getClientData,
  clearClientAuth
} from "../src/services/clientAuthStorage";   
 

export default function PublicBookingPage() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const [lastBookedAppointment, setLastBookedAppointment] = useState(null);

  const client = getClientData();

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoadingSpaces(true);
      const response = await api.get("/public-booking/spaces");
      setSpaces(response.data);
    } catch (error) {
      console.error("Erro ao carregar espaços:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.error || "Erro ao carregar espaços"
      });
    } finally {
      setLoadingSpaces(false);
    }
  };

  const loadSlots = async () => {
    try {
      if (feedback.type !== "success") {
        setFeedback({ type: "", message: "" });
      }

      if (!selectedDate || !selectedSpace) {
        setFeedback({
          type: "error",
          message: "Selecione uma data e um espaço antes de buscar horários."
        });
        return;
      }

      setLoadingSlots(true);

      const response = await api.get("/public-booking/available-slots", {
        params: {
          date: selectedDate,
          spaceId: selectedSpace
        }
      });

      setSlots(response.data.slots);
      setSelectedSlot("");

      if (response.data.slots.length === 0) {
        setFeedback({
          type: "info",
          message: "Nenhum horário disponível para a combinação escolhida."
        });
      } else {
        setFeedback({
          type: "success",
          message: "Horários carregados com sucesso. Escolha uma opção."
        });
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.error || "Erro ao buscar horários"
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async (formData) => {
    try {
      setFeedback({ type: "", message: "" });
      setSubmittingBooking(true);

      const token = getClientToken();

      const response = await api.post("/public-booking/book", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLastBookedAppointment(response.data);

      setFeedback({
        type: "success",
        message:
          "Agendamento confirmado com sucesso. Confira os detalhes abaixo."
      });

      setSelectedSlot("");
      await loadSlots();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      setFeedback({
        type: "error",
        message: error.response?.data?.error || "Erro ao confirmar agendamento"
      });
    } finally {
      setSubmittingBooking(false);
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
    },
    info: {
      background: "#eff8ff",
      color: "#175cd3",
      border: "1px solid #b2ddff"
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
          maxWidth: "1100px",
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "28px" }}>Agende seu atendimento</h1>
              <p style={{ margin: "8px 0 0", color: "#555" }}>
                Escolha um espaço, selecione uma data e confirme um horário disponível.
              </p>
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
        {lastBookedAppointment && (
  (() => {
    const bookedDate = lastBookedAppointment?.date
      ? new Date(lastBookedAppointment.date)
      : null;

    const formattedBookedDate =
      bookedDate && !Number.isNaN(bookedDate.getTime())
        ? bookedDate.toLocaleDateString("pt-BR")
        : "Data não disponível";

    const formattedBookedTime =
      bookedDate && !Number.isNaN(bookedDate.getTime())
        ? bookedDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })
        : "Horário não disponível";

    return (
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          marginBottom: "24px",
          border: "1px solid #d9f2e3"
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
          <div>
            <h2 style={{ margin: "0 0 8px", color: "#027a48" }}>
              ✅ Agendamento confirmado
            </h2>
            <p style={{ margin: "0 0 16px", color: "#555" }}>
              Seu horário foi reservado com sucesso.
            </p>

            <div style={{ display: "grid", gap: "8px" }}>
              <div>
                <strong>Data:</strong> {formattedBookedDate}
              </div>
              <div>
                <strong>Horário:</strong> {formattedBookedTime}
              </div>
              <div>
                <strong>Espaço:</strong>{" "}
                {lastBookedAppointment?.space?.name || "Não informado"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {lastBookedAppointment?.status || "Não informado"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              to="/meus-agendamentos"
              style={{
                textDecoration: "none",
                background: "#1976d2",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: "10px",
                fontWeight: "600"
              }}
            >
              Ver meus agendamentos
            </Link>

            <button
              type="button"
              onClick={() => setLastBookedAppointment(null)}
              style={{
                border: "1px solid #d0d7e2",
                background: "#fff",
                color: "#333",
                padding: "12px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  })()
)}  

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "24px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
            }}
          >
            <h2 style={{ marginTop: 0 }}>Escolha seu horário</h2>

            {loadingSpaces ? (
              <p style={{ color: "#666" }}>Carregando espaços...</p>
            ) : (
              <SpaceSelector
                spaces={spaces}
                value={selectedSpace}
                onChange={setSelectedSpace}
              />
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600"
                }}
              >
                Data
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d0d7e2",
                  fontSize: "15px"
                }}
              />
            </div>

            <button
              type="button"
              onClick={loadSlots}
              disabled={loadingSlots}
              style={{
                border: "none",
                background: loadingSlots ? "#90caf9" : "#1976d2",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: "10px",
                cursor: loadingSlots ? "not-allowed" : "pointer",
                fontWeight: "600",
                marginBottom: "24px"
              }}
            >
              {loadingSlots ? "Buscando horários..." : "Buscar horários"}
            </button>

            <SlotSelector
              slots={slots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
              alignSelf: "start"
            }}
          >
            <PublicBookingForm
              selectedSlot={selectedSlot}
              spaceId={selectedSpace}
              spaces={spaces}
              onSubmit={handleBooking}
              submitting={submittingBooking}
            />
          </div>
        </div>
      </div>
    </div>
  );
}