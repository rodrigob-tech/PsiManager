import { useEffect, useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  gender: "",
  emergencyName: "",
  emergencyPhone: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  notes: "",
  status: "ACTIVE"
};

const formatDateInput = (dateString) => {
  if (!dateString) return "";

  return dateString.slice(0, 10);
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
        phone: editingPatient.phone || "",
        cpf: editingPatient.cpf || "",
        birthDate: formatDateInput(editingPatient.birthDate),
        gender: editingPatient.gender || "",
        emergencyName: editingPatient.emergencyName || "",
        emergencyPhone: editingPatient.emergencyPhone || "",
        guardianName: editingPatient.guardianName || "",
        guardianPhone: editingPatient.guardianPhone || "",
        address: editingPatient.address || "",
        notes: editingPatient.notes || "",
        status: editingPatient.status || "ACTIVE"
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
        gap: "14px",
        padding: "16px",
        marginBottom: "20px",
        background: "#f8faff",
        border: "1px solid #e1e8f5",
        borderRadius: "14px"
      }}
    >
      <h3 style={{ margin: 0 }}>
        {editingPatient ? "Editar paciente" : "Novo paciente"}
      </h3>

      <div style={gridStyle}>
        <input
          type="text"
          name="name"
          placeholder="Nome do paciente"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="phone"
          placeholder="Telefone"
          value={formData.phone}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Gênero</option>
          <option value="female">Feminino</option>
          <option value="male">Masculino</option>
          <option value="non_binary">Não binário</option>
          <option value="not_informed">Não informado</option>
        </select>

        <input
          type="text"
          name="emergencyName"
          placeholder="Contato de emergência"
          value={formData.emergencyName}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="emergencyPhone"
          placeholder="Telefone de emergência"
          value={formData.emergencyPhone}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="guardianName"
          placeholder="Responsável"
          value={formData.guardianName}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="text"
          name="guardianPhone"
          placeholder="Telefone do responsável"
          value={formData.guardianPhone}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <textarea
        name="address"
        placeholder="Endereço"
        value={formData.address}
        onChange={handleChange}
        rows={2}
        style={textareaStyle}
      />

      <textarea
        name="notes"
        placeholder="Observações"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        style={textareaStyle}
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

const gridStyle = {
  display: "grid",
  gap: "10px",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d0d7e2",
  fontSize: "14px",
  background: "#fff"
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit"
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
