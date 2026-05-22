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
          className="table-responsive"
        >
          <table className="table">
            <thead>
              

              
            </thead>
            <tbody>
              <tr>
                <th scope="row">Nome:</th>
                <td>
                  {space.name}
                </td>
              </tr>
              <tr><th scope="row">Descrição:</th>
                <td>{space.description || "Sem descrição"}</td>
              </tr>
            </tbody>
            <button
                type="button"
                onClick={() => onEdit(space)}
                className="btn btn-outline-primary"
              >
                Editar
              </button>

              <button
                type="button"
                onClick={() => onDelete(space.id)}
                className="btn btn-outline-danger"
              >
                Excluir
              </button>
          </table>

          <div
          >

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