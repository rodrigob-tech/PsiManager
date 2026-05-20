import { getClientData } from "../../src/services/clientAuthStorage";  


export default function PublicBookingForm({
  selectedSlot,
  spaceId,
  spaces,
  onSubmit,
  submitting = false
}) {
  const client = getClientData();

  const selectedSpace = spaces.find((space) => space.id === spaceId);

  const formattedDate = selectedSlot
    ? new Date(selectedSlot).toLocaleDateString("pt-BR")
    : "";

  const formattedTime = selectedSlot
    ? new Date(selectedSlot).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSlot || !spaceId) {
      return;
    }

    await onSubmit({
      date: selectedSlot,
      spaceId
    });
  };

  const summaryRowStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "12px 0",
    borderBottom: "1px solid #eceff5"
  };

  const canConfirm = !!selectedSlot && !!spaceId && !submitting;

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Resumo da reserva</h2>
      <p style={{ marginTop: 0, color: "#666", marginBottom: "20px" }}>
        Confira os dados antes de confirmar seu atendimento.
      </p>

      <div
        style={{
          background: selectedSlot ? "#f8faff" : "#fafafa",
          border: "1px solid #e1e8f5",
          borderRadius: "14px",
          padding: "18px",
          opacity: selectedSlot ? 1 : 0.88
        }}
      >
        <div style={summaryRowStyle}>
          <strong>Cliente</strong>
          <span>{client?.name || "Não identificado"}</span>
        </div>

        <div style={summaryRowStyle}>
          <strong>Email</strong>
          <span>{client?.email || "Não informado"}</span>
        </div>

        <div style={summaryRowStyle}>
          <strong>Telefone</strong>
          <span>{client?.phone || "Não informado"}</span>
        </div>

        <div style={summaryRowStyle}>
          <strong>Espaço</strong>
          <span>{selectedSpace?.name || "Selecione um espaço"}</span>
        </div>

        <div style={summaryRowStyle}>
          <strong>Descrição do espaço</strong>
          <span>{selectedSpace?.description || "Sem descrição"}</span>
        </div>

        <div style={summaryRowStyle}>
          <strong>Data</strong>
          <span>{formattedDate || "Escolha um horário para exibir a data"}</span>
        </div>

        <div
          style={{
            ...summaryRowStyle,
            borderBottom: "none"
          }}
        >
          <strong>Horário</strong>
          <span>{formattedTime || "Nenhum horário selecionado"}</span>
        </div>
      </div>

      {!selectedSlot && (
        <div
          style={{
            marginTop: "14px",
            background: "#fff8e1",
            border: "1px solid #ffe082",
            color: "#8a6d1f",
            borderRadius: "10px",
            padding: "12px"
          }}
        >
          Selecione um horário disponível para liberar a confirmação.
        </div>
      )}

      <button
        type="submit"
        disabled={!canConfirm}
        style={{
          marginTop: "20px",
          width: "100%",
          border: "none",
          background: canConfirm ? "#2e7d32" : "#a5d6a7",
          color: "#fff",
          padding: "14px",
          borderRadius: "10px",
          cursor: canConfirm ? "pointer" : "not-allowed",
          fontWeight: "700",
          fontSize: "15px"
        }}
      >
        {submitting ? "Confirmando agendamento..." : "Confirmar agendamento"}
      </button>
    </form>
  );
}