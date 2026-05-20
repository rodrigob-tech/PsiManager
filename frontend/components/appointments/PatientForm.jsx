import { useEffect, useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: ""
};

export default function PatientForm({
  onSubmit,
  editingPatient,
  onCancelEdit
}) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        name: editingPatient.name || "",
        email: editingPatient.email || "",
        phone: editingPatient.phone || ""
      });
    } else {
      setFormData(initialState);
    }
  }, [editingPatient]);

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

    if (!editingPatient) {
      setFormData(initialState);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "10px",
        padding: "16px",
        background: "#f8faff",
        border: "1px solid #e1e8f5",
        borderRadius: "14px"
      }}
    >
      <h3 style={{ margin: 0 }}>
        {editingPatient ? "Editar paciente" : "Novo paciente"}
      </h3>

      <input
        type="text"
        name="name"
        placeholder="Nome do paciente"
        value={formData.name}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="text"
        name="phone"
        placeholder="Telefone"
        value={formData.phone}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" style={primaryButton}>
          {editingPatient ? "Salvar alterações" : "Criar paciente"}
        </button>

        {editingPatient && (
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
  fontSize: "14px"
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
