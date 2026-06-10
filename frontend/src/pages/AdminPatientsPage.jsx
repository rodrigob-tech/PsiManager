import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import PatientForm from "../components/appointments/PatientForm";
import PatientList from "../components/appointments/PatientList";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";
import { getUserToken, getUserData } from "../storages/userAuthStorage";
import { getPatientFile } from "../services/documentService";

export default function AdminPatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [editingPatient, setEditingPatient] = useState(null);

  const admin = getUserData();
  const canAccessMedicalRecord = admin?.role !== "RECEPTIONIST";

  async function loadPatients() {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const response = await getPatients(authHeaders);
      setPatients(response.data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
      alert("Erro ao carregar pacientes");
    }
  }

  async function handleSubmitPatient(formData) {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      if (editingPatient) {
        await updatePatient(editingPatient.id, formData, authHeaders);
        alert("Paciente atualizado com sucesso");
        setEditingPatient(null);
      } else {
        await createPatient(formData, authHeaders);
        alert("Paciente criado com sucesso");
      }

      await loadPatients();
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      const message = error.response?.data?.error || "Erro ao salvar paciente";
      alert(message);
    }
  }

  async function handleDeletePatient(id) {
    const confirmed = window.confirm("Deseja realmente excluir este paciente?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await deletePatient(id, authHeaders);
      await loadPatients();

      alert("Paciente removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover paciente:", error);
      const message = error.response?.data?.error || "Erro ao remover paciente";
      alert(message);
    }
  }
  async function handleOpenPatientFile(patientId) {
  try {
    const token = getUserToken();

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const response = await getPatientFile(patientId, authHeaders);

    const file = new Blob([response.data], {
      type: "application/pdf",
    });

    const fileURL = URL.createObjectURL(file);

    window.open(fileURL, "_blank");
  } catch (error) {
    console.error("Erro ao gerar ficha do paciente:", error);

    const message =
      error.response?.data?.error || "Erro ao gerar ficha do paciente";

    alert(message);
  }
}
  useEffect(() => {
    loadPatients();
  }, []);

  return (
    <DashboardLayout
      title="Pacientes"
      subtitle="Cadastre, edite e acompanhe os pacientes da clínica."
      current="pacientes"
    >
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="premium-card p-4">
            <h2 className="h5 fw-bold mb-3">
              {editingPatient ? "Editar paciente" : "Novo paciente"}
            </h2>

            <PatientForm
              onSubmit={handleSubmitPatient}
              editingPatient={editingPatient}
              onCancelEdit={() => setEditingPatient(null)}
            />
          </div>
        </div>

        <div className="col-lg-8">
          <div className="premium-card p-4">
            <h2 className="h5 fw-bold mb-3">Lista de pacientes</h2>

            <PatientList
              patients={patients}
              onEdit={setEditingPatient}
              onDelete={handleDeletePatient}
              canAccessMedicalRecord={canAccessMedicalRecord}
              onOpenMedicalRecord={(patient) =>
                navigate(`/patients/${patient.id}/prontuario`)
              }
              onOpenPatientFile={handleOpenPatientFile}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}