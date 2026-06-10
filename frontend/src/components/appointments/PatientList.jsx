export default function PatientList({
  patients,
  onEdit,
  onDelete,
  canAccessMedicalRecord = false,
  onOpenMedicalRecord,
  onOpenPatientFile
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

    >
      {patients.map((patient) => (
        <div
          key={patient.id}
          className="table-responsive"
        >
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Nome:</th> {patient.name}
              </tr>

              <tr>
                <th>Status:</th> {statusLabel[patient.status] || patient.status}
              </tr>

              <tr>
                <th>Email:</th> {patient.email || "Não informado"}
              </tr>

              <tr>
                <th>Telefone:</th> {patient.phone || "Não informado"}
              </tr>

              <tr>
                <th>CPF:</th> {patient.cpf || "Não informado"}
              </tr>

              <tr>
                <th>Nascimento:</th> {formatDate(patient.birthDate)}
              </tr>

              <tr>
                <th>Gênero:</th>{" "}
                {genderLabel[patient.gender] || patient.gender || "Não informado"}
              </tr>

              <tr>
                <th>Emergência:</th>{" "}
                {patient.emergencyName || "Não informado"}
                {patient.emergencyPhone ? ` - ${patient.emergencyPhone}` : ""}
              </tr>

              <tr>
                <th>Responsável:</th>{" "}
                {patient.guardianName || "Não informado"}
                {patient.guardianPhone ? ` - ${patient.guardianPhone}` : ""}
              </tr>

              <tr>
                <th>Endereço:</th> {patient.address || "Não informado"}
              </tr>

              <tr>
                <th>Observações:</th> {patient.notes || "Não informado"}
              </tr>

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
                  className="btn btn-outline-primary"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(patient.id)}
                  className="btn btn-outline-danger"
                >
                  Excluir
                </button>

                {canAccessMedicalRecord && (
                  <button
                    type="button"
                    onClick={() => onOpenMedicalRecord(patient)}
                    className="btn btn-primary"
                  >
                    Prontuário
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onOpenPatientFile(patient.id)}
                >
                  Ficha PDF
                </button>
              </div>
            </thead>

          </table>


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
