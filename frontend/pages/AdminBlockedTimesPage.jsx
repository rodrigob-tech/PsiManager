import { useState, useEffect } from "react";
import { getUserToken } from "../src/services/userAuthStorage";
import BlockedTimeForm from "../components/appointments/BlockedTimeForm";
import BlockedTimeList from "../components/appointments/BlockedTimeList";
import {
  getBlockedTimes,
  createBlockedTime,
  deleteBlockedTime
} from "../services/blockedTime.service";
import DashboardLayout from "../components/layout/DashboardLayout";


export default function AdminBlockedTimesPage() {
  const [blockedTimes, setBlockedTimes] = useState([]);

  async function loadBlockedTimes() {
    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const response = await getBlockedTimes(authHeaders);
      setBlockedTimes(response.data);
    } catch (error) {
      console.error("Erro ao carregar os horários bloqueados:", error);
      alert("Erro ao carregar os horários bloqueados");
    }
  }
  const handleCreateBlockedTime = async (formData) => {
    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await createBlockedTime(formData, authHeaders);
      await loadBlockedTimes();
      alert("Bloqueio criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao criar bloqueio";

      alert(message);
    }
  };

  const handleDeleteBlockedTime = async (id) => {
    const confirmed = window.confirm("Deseja realmente excluir este bloqueio?");
    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = {
        Authorization: `Bearer ${token}`
      };

      await deleteBlockedTime(id, authHeaders);
      await loadBlockedTimes();
      alert("Bloqueio removido com sucesso");
    } catch (error) {
      console.error("Erro ao remover bloqueio:", error);

      const message =
        error.response?.data?.error || "Erro ao remover bloqueio";

      alert(message);
    }
  };
  useEffect(() => {
    loadBlockedTimes();
  }, []);
  return (
    <DashboardLayout
      title="Bloqueios"
      subtitle="Cadastre e edite os horários indisponíveis."
      current="bloqueios"
    >
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="premium-card p-4">
           
            
            <BlockedTimeForm onSubmit={handleCreateBlockedTime} />
            
          </div>
        </div>

        <div className="col-lg-8">
          <div className="premium-card p-4">
            <h2 className="h5 fw-bold mb-3">Horários bloqueados</h2>

            <BlockedTimeList
              blockedTimes={blockedTimes}
              onDelete={handleDeleteBlockedTime}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}