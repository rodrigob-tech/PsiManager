import { useEffect, useState } from "react";

export default function SpaceForm({ onSubmit, editingSpace, onCancelEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (editingSpace) {
      setFormData({
        name: editingSpace.name || "",
        description: editingSpace.description || ""
      });
    } else {
      setFormData({
        name: "",
        description: ""
      });
    }
  }, [editingSpace]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);

    if (!editingSpace) {
      setFormData({
        name: "",
        description: ""
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "12px",
        marginBottom: "20px",
        padding: "16px",
        background: "#f8faff",
        border: "1px solid #e1e8f5",
        borderRadius: "14px"
      }}
    >
      <h3 style={{ margin: 0 }}>
        {editingSpace ? "Editar espaço" : "Novo espaço"}
      </h3>

      <input
        type="text"
        name="name"
        placeholder="Nome do espaço"
        value={formData.name}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="text"
        name="description"
        placeholder="Descrição do espaço"
        value={formData.description}
        onChange={handleChange}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" style={primaryButton}>
          {editingSpace ? "Salvar alterações" : "Criar espaço"}
        </button>

        {editingSpace && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={secondaryButton}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d0d7e2",
  fontSize: "14px",
  background: "#fff"
};

const primaryButton = {
  border: "none",
  background: "#02af11",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryButton = {
  border: "1px solid #d0d7e2",
  background: "#fff",
  color: "#333",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600"
};