export default function BlockedTimeList({
  blockedTimes,
  onDelete
}) {
  if (!blockedTimes?.length) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          borderRadius: "12px",
          padding: "14px",
          color: "#666"
        }}
      >
        Nenhum bloqueio cadastrado.
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
      {blockedTimes.map((blockedTime) => (
        <div
          key={blockedTime.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "16px",
            background: "#fff"
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <div>
              <strong>Início:</strong>{" "}
              {new Date(blockedTime.start).toLocaleDateString("pt-BR")} às{" "}
              {new Date(blockedTime.start).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              })}
            </div>

            <div>
              <strong>Fim:</strong>{" "}
              {new Date(blockedTime.end).toLocaleDateString("pt-BR")} às{" "}
              {new Date(blockedTime.end).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
              })}
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
              onClick={() => onDelete(blockedTime.id)}
              style={deleteButton}
            >
              Excluir bloqueio
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const deleteButton = {
  border: "none",
  background: "#d32f2f",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};