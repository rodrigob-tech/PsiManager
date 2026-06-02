import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { getUserToken, getUserData } from "../src/services/userAuthStorage";

import {
  getMyClinic,
  updateMyClinic,
  getClinicUsers,
  createClinicPsychologist,
  updateClinicUserStatus,
} from "../services/clinicService";

const initialClinicForm = {
  name: "",
  description: "",
};

const initialPsychologistForm = {
  name: "",
  email: "",
  password: "",
};

function getRoleLabel(role) {
  const labels = {
    ADMIN: "Administrador",
    PSYCHOLOGIST: "Psicólogo",
  };

  return labels[role] || role || "Não informado";
}

function getStatusBadge(user) {
  if (user.isActive) {
    return <span className="badge text-bg-success">Ativo</span>;
  }

  return <span className="badge text-bg-secondary">Inativo</span>;
}

export default function AdminClinicPage() {
  const loggedUser = getUserData();

  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);
  const [clinicForm, setClinicForm] = useState(initialClinicForm);
  const [psychologistForm, setPsychologistForm] = useState(
    initialPsychologistForm
  );
  const [loading, setLoading] = useState(true);

  const isAdmin = loggedUser?.role === "ADMIN";

  async function loadData() {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [clinicResponse, usersResponse] = await Promise.all([
        getMyClinic(authHeaders),
        getClinicUsers(authHeaders),
      ]);

      setClinic(clinicResponse.data);
      setUsers(usersResponse.data || []);

      setClinicForm({
        name: clinicResponse.data?.name || "",
        description: clinicResponse.data?.description || "",
      });
    } catch (error) {
      console.error("Erro ao carregar dados da clínica:", error);
      const message =
        error.response?.data?.error || "Erro ao carregar dados da clínica";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateClinic(event) {
    event.preventDefault();

    if (!clinicForm.name.trim()) {
      alert("Informe o nome da clínica.");
      return;
    }

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await updateMyClinic(
        {
          name: clinicForm.name.trim(),
          description: clinicForm.description.trim() || null,
        },
        authHeaders
      );

      alert("Clínica atualizada com sucesso.");
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar clínica:", error);
      const message =
        error.response?.data?.error || "Erro ao atualizar clínica";
      alert(message);
    }
  }

  async function handleCreatePsychologist(event) {
    event.preventDefault();

    if (
      !psychologistForm.name.trim() ||
      !psychologistForm.email.trim() ||
      !psychologistForm.password.trim()
    ) {
      alert("Nome, e-mail e senha são obrigatórios.");
      return;
    }

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await createClinicPsychologist(
        {
          name: psychologistForm.name.trim(),
          email: psychologistForm.email.trim(),
          password: psychologistForm.password,
        },
        authHeaders
      );

      alert("Psicólogo criado com sucesso.");

      setPsychologistForm(initialPsychologistForm);
      await loadData();
    } catch (error) {
      console.error("Erro ao criar psicólogo:", error);
      const message =
        error.response?.data?.error || "Erro ao criar psicólogo";
      alert(message);
    }
  }

  async function handleToggleUserStatus(user) {
    if (user.id === loggedUser?.id && user.isActive) {
      alert("Você não pode desativar seu próprio usuário.");
      return;
    }

    const nextStatus = !user.isActive;

    const confirmed = window.confirm(
      `Deseja realmente ${nextStatus ? "ativar" : "desativar"} este usuário?`
    );

    if (!confirmed) return;

    try {
      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await updateClinicUserStatus(
        user.id,
        {
          isActive: nextStatus,
        },
        authHeaders
      );

      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      const message =
        error.response?.data?.error || "Erro ao atualizar status do usuário";
      alert(message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const psychologistsCount = useMemo(() => {
    return users.filter((user) => user.role === "PSYCHOLOGIST").length;
  }, [users]);

  const canCreatePsychologist = psychologistsCount < 8;

  return (
    <DashboardLayout
      current="clinica"
      title="Clínica"
      subtitle="Gerencie os dados da clínica e os profissionais vinculados."
    >
      {loading ? (
        <div className="premium-card p-4">
          <p className="mb-0 text-secondary">Carregando dados da clínica...</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="premium-card p-4 mb-4">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span className="status-pill">Dados da clínica</span>
                  <h2 className="h5 fw-bold mt-3 mb-1">
                    {clinic?.name || "Clínica"}
                  </h2>
                  <p className="text-secondary mb-0">
                    {clinic?.description || "Sem descrição cadastrada."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateClinic}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nome da clínica
                  </label>
                  <input
                    className="form-control"
                    value={clinicForm.name}
                    onChange={(event) =>
                      setClinicForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    disabled={!isAdmin}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Descrição</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={clinicForm.description}
                    onChange={(event) =>
                      setClinicForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    disabled={!isAdmin}
                    placeholder="Descrição breve da clínica"
                  />
                </div>

                {isAdmin && (
                  <button
                    type="submit"
                    className="btn btn-pm-primary rounded-pill px-4"
                  >
                    Salvar alterações
                  </button>
                )}
              </form>
            </div>

            {isAdmin && (
              <div className="premium-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">Novo psicólogo</h2>
                    <p className="text-secondary mb-0">
                      {psychologistsCount} de 8 profissionais cadastrados.
                    </p>
                  </div>
                </div>

                {!canCreatePsychologist ? (
                  <div className="alert alert-warning mb-0">
                    A clínica atingiu o limite de 8 psicólogos.
                  </div>
                ) : (
                  <form onSubmit={handleCreatePsychologist}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Nome</label>
                      <input
                        className="form-control"
                        value={psychologistForm.name}
                        onChange={(event) =>
                          setPsychologistForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Nome do profissional"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">E-mail</label>
                      <input
                        type="email"
                        className="form-control"
                        value={psychologistForm.email}
                        onChange={(event) =>
                          setPsychologistForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="profissional@email.com"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Senha</label>
                      <input
                        type="password"
                        className="form-control"
                        value={psychologistForm.password}
                        onChange={(event) =>
                          setPsychologistForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Senha inicial"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-pm-primary rounded-pill px-4"
                    >
                      Criar psicólogo
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="col-lg-7">
            <div className="premium-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="h5 fw-bold mb-1">Usuários da clínica</h2>
                  <p className="text-secondary mb-0">
                    Administradores e psicólogos vinculados à clínica.
                  </p>
                </div>

                <span className="status-pill">
                  {psychologistsCount}/8 psicólogos
                </span>
              </div>

              {users.length === 0 ? (
                <div className="soft-card p-3">
                  <p className="mb-0 text-secondary">
                    Nenhum usuário vinculado à clínica.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-secondary">
                        <th>Usuário</th>
                        <th>Perfil</th>
                        <th>Status</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name}</strong>
                            <div className="text-secondary small">
                              {user.email}
                            </div>
                          </td>

                          <td>{getRoleLabel(user.role)}</td>

                          <td>{getStatusBadge(user)}</td>

                          <td className="text-end">
                            {isAdmin ? (
                              <button
                                type="button"
                                className={`btn btn-sm rounded-pill ${
                                  user.isActive
                                    ? "btn-outline-danger"
                                    : "btn-outline-success"
                                }`}
                                onClick={() => handleToggleUserStatus(user)}
                              >
                                {user.isActive ? "Desativar" : "Ativar"}
                              </button>
                            ) : (
                              <span className="text-secondary small">
                                Sem permissão
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}