export default function ClientList({
  clients,
  onEdit,
  onDelete
}) {
  if (!clients?.length) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          borderRadius: "12px",
          padding: "14px",
          color: "#666"
        }}
      >
        Nenhum cliente cadastrado.
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
      {clients.map((client) => (
        <div
          key={client.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "14px",
            background: "#fff"
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <div>
              <strong>Nome:</strong> {client.name}
            </div>

            <div>
              <strong>Email:</strong> {client.email}
            </div>

            <div>
              <strong>Telefone:</strong> {client.phone}
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              onClick={() => onEdit(client)}
              style={editButton}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(client.id)}
              style={deleteButton}
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
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