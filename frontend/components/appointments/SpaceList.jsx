export default function SpaceList({
  spaces,
  onEdit,
  onDelete
}) {
  if (!spaces?.length) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          borderRadius: "12px",
          padding: "14px",
          color: "#666"
        }}
      >
        Nenhum espaço cadastrado.
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
      {spaces.map((space) => (
        <div
          key={space.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "16px",
            background: "#fff"
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <div>
              <strong>Nome:</strong> {space.name}
            </div>

            <div>
              <strong>Descrição:</strong>{" "}
              {space.description || "Sem descrição"}
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
              onClick={() => onEdit(space)}
              style={editButton}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(space.id)}
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