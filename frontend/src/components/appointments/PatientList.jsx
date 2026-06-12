export default function PatientList({
  patients,
  onEdit,
  onDelete,
  canAccessMedicalRecord = false,
  onOpenMedicalRecord,
  onOpenPatientFile,
  onSendReminder,
}) {
  if (!patients?.length) {
    return (
      <div className="soft-card p-4 text-center text-secondary">
        <i className="bi bi-people fs-2 d-block mb-2"></i>
        Nenhum paciente encontrado.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr className="text-table-header">
            <th>Paciente</th>
            <th>Status</th>
            <th>Contato</th>
            <th>Nascimento</th>
            <th>Emergência</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <div className="avatar">{getInitials(patient.name)}</div>

                  <div>
                    <strong>{patient.name}</strong>
                    <div className="text-main small">
                      CPF: {patient.cpf || "Não informado"}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <span className={getStatusClass(patient.status)}>
                  {statusLabel[patient.status] || patient.status || "Não informado"}
                </span>
              </td>

              <td>
                <div>{patient.email || "E-mail não informado"}</div>
                <div className="text-main small">
                  {patient.phone || "Telefone não informado"}
                </div>
              </td>

              <td className="text-main">{formatDate(patient.birthDate)}</td>

              <td className="text-main">
                {patient.emergencyName || "Não informado"}
                {patient.emergencyPhone ? ` - ${patient.emergencyPhone}` : ""}
              </td>

              <td>
                <div className="d-flex justify-content-end gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-warning rounded-pill btn-sm"
                    onClick={() => onEdit(patient)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Editar
                  </button>

                  {canAccessMedicalRecord && (
                    <button
                      type="button"
                      className="btn btn-info rounded-pill btn-sm"
                      onClick={() => onOpenMedicalRecord(patient)}
                    >
                      <i className="bi bi-file-earmark-medical me-1"></i>
                      Prontuário
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-info rounded-pill btn-sm"
                    onClick={() => onOpenPatientFile(patient.id)}
                  >
                    <i className="bi bi-filetype-pdf me-1"></i>
                    Ficha PDF
                  </button>

                  <button
                    type="button"
                    className="btn btn-success rounded-pill btn-sm"
                    onClick={() => onSendReminder(patient)}
                    disabled={!patient.email}
                    title={
                      patient.email
                        ? "Enviar lembrete por e-mail"
                        : "Paciente não possui e-mail cadastrado"
                    }
                  ><i className="bi bi-bell me-1"></i>
                    Lembrete
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger rounded-pill btn-sm"
                    onClick={() => onDelete(patient.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const statusLabel = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ARCHIVED: "Arquivado",
};

function getStatusClass(status) {
  if (status === "ACTIVE") return "status-pill";
  if (status === "INACTIVE") return "status-pill bg-warning-subtle text-warning-emphasis";
  if (status === "ARCHIVED") return "status-pill bg-secondary-subtle text-secondary-emphasis";

  return "status-pill";
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

const formatDate = (dateString) => {
  if (!dateString) return "Não informado";

  return new Date(dateString).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
};