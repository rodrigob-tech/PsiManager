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
      className="d-grid gap-3"
    >
      

      <div style={gridStyle}>
        <input
          type="text"
          name="name"
          placeholder="Nome do paciente"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-control"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-select"
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
          className="form-control"
        />

        <input
          type="text"
          name="phone"
          placeholder="Telefone"
          value={formData.phone}
          onChange={handleChange}
          className="form-control"
        />

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          className="form-control"
        />

        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="form-control"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="form-select"
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
          className="form-control"
        />

        <input
          type="text"
          name="emergencyPhone"
          placeholder="Telefone de emergência"
          value={formData.emergencyPhone}
          onChange={handleChange}
          className="form-control"
        />

        <input
          type="text"
          name="guardianName"
          placeholder="Responsável"
          value={formData.guardianName}
          onChange={handleChange}
          className="form-control"
        />

        <input
          type="text"
          name="guardianPhone"
          placeholder="Telefone do responsável"
          value={formData.guardianPhone}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <textarea
        name="address"
        placeholder="Endereço"
        value={formData.address}
        onChange={handleChange}
        rows={2}
        className="form-control"
      />

      <textarea
        name="notes"
        placeholder="Observações"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
        className="form-control"
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          {editingPatient ? "Salvar alterações" : "Criar paciente"}
        </button>

        {editingPatient && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn btn-outline-secondary"
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
