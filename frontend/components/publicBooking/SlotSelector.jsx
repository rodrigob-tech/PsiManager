export default function SlotSelector({ slots, selectedSlot, onSelect }) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Horários disponíveis</h3>

      {slots.length === 0 ? (
        <div
          style={{
            padding: "16px",
            background: "#f8f9fc",
            borderRadius: "12px",
            color: "#666"
          }}
        >
          Nenhum horário disponível para a data selecionada.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
            gap: "12px"
          }}
        >
          {slots.map((slot) => {
            const label = new Date(slot.start).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            });

            const isSelected = selectedSlot === slot.start;

            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => onSelect(slot.start)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid #1976d2" : "1px solid #d0d7e2",
                  background: isSelected ? "#1976d2" : "#fff",
                  color: isSelected ? "#fff" : "#222",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "0.2s ease"
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}