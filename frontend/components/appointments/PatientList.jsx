export default function PatientList({
  patients,
  onEdit,
  onDelete,
  canAccessMedicalRecord = false,
  onOpenMedicalRecord
}) {
  if (!patients?.length) {
    return (
      <div
        style={{
          background: "#f8f9fc",
          borderRadius: "12px",
          padding: "14px",
          color: "#666"
        }}
      >
        Nenhum paciente cadastrado.
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
      {patients.map((patient) => (
        <div
          key={patient.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "14px",
            background: "#fff"
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <div>
              <strong>Nome:</strong> {patient.name}
            </div>

            <div>
              <strong>Status:</strong> {statusLabel[patient.status] || patient.status}
            </div>

            <div>
              <strong>Email:</strong> {patient.email || "Não informado"}
            </div>

            <div>
              <strong>Telefone:</strong> {patient.phone || "Não informado"}
            </div>

            <div>
              <strong>CPF:</strong> {patient.cpf || "Não informado"}
            </div>

            <div>
              <strong>Nascimento:</strong> {formatDate(patient.birthDate)}
            </div>

            <div>
              <strong>Gênero:</strong>{" "}
              {genderLabel[patient.gender] || patient.gender || "Não informado"}
            </div>

            <div>
              <strong>Emergência:</strong>{" "}
              {patient.emergencyName || "Não informado"}
              {patient.emergencyPhone ? ` - ${patient.emergencyPhone}` : ""}
            </div>

            <div>
              <strong>Responsável:</strong>{" "}
              {patient.guardianName || "Não informado"}
              {patient.guardianPhone ? ` - ${patient.guardianPhone}` : ""}
            </div>

            <div>
              <strong>Endereço:</strong> {patient.address || "Não informado"}
            </div>

            <div>
              <strong>Observações:</strong> {patient.notes || "Não informado"}
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
              onClick={() => onEdit(patient)}
              style={editButton}
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() => onDelete(patient.id)}
              style={deleteButton}
            >
              Excluir
            </button>

            {canAccessMedicalRecord && (
              <button
                type="button"
                onClick={() => onOpenMedicalRecord(patient)}
                style={medicalRecordButton}
              >
                Prontuário
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const statusLabel = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado"
};

const genderLabel = {
  female: "Feminino",
  male: "Masculino",
  non_binary: "Não binário",
  not_informed: "Não informado"
};

const formatDate = (dateString) => {
  if (!dateString) return "Não informado";

  return new Date(dateString).toLocaleDateString("pt-BR", {
    timeZone: "UTC"
  });
};

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

const medicalRecordButton = {
  border: "none",
  background: "#1976d2",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600"
};
