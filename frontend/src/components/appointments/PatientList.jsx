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
          <tr className="text-secondary">
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
                    <div className="text-secondary small">
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
                <div className="text-secondary small">
                  {patient.phone || "Telefone não informado"}
                </div>
              </td>

              <td className="text-secondary">{formatDate(patient.birthDate)}</td>

              <td className="text-secondary">
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
                    Editar
                  </button>

                  {canAccessMedicalRecord && (
                    <button
                      type="button"
                      className="btn btn-info rounded-pill btn-sm"
                      onClick={() => onOpenMedicalRecord(patient)}
                    >
                      Prontuário
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-info rounded-pill btn-sm"
                    onClick={() => onOpenPatientFile(patient.id)}
                  >
                    Ficha PDF
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary rounded-pill btn-sm"
                    onClick={() => onSendReminder(patient)}
                    disabled={!patient.email}
                    title={
                      patient.email
                        ? "Enviar lembrete por e-mail"
                        : "Paciente não possui e-mail cadastrado"
                    }
                  >
                    Lembrete
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger rounded-pill btn-sm"
                    onClick={() => onDelete(patient.id)}
                  >
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