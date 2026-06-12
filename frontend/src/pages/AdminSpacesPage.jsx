import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
} from "../services/spaceService";
import { getUserToken } from "../storages/userAuthStorage";

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [editingSpace, setEditingSpace] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadSpaces() {
    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const response = await getSpaces(authHeaders);
      setSpaces(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar espaços:", error);
      alert("Erro ao carregar espaços");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSpaces();
  }, []);

  function handleEditSpace(space) {
    setEditingSpace(space);
    setSpaceName(space.name || "");
    setSpaceDescription(space.description || "");
  }

  function handleCancelEdit() {
    setEditingSpace(null);
    setSpaceName("");
    setSpaceDescription("");
  }

  async function handleSubmitSpace(event) {
    event.preventDefault();

    if (!spaceName.trim()) {
      alert("Por favor, preencha o nome do espaço.");
      return;
    }

    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const payload = {
        name: spaceName.trim(),
        description: spaceDescription.trim(),
      };

      if (editingSpace) {
        await updateSpace(editingSpace.id, payload, authHeaders);
        alert("Espaço atualizado com sucesso.");
      } else {
        await createSpace(payload, authHeaders);
        alert("Espaço criado com sucesso.");
      }

      setSpaceName("");
      setSpaceDescription("");
      setEditingSpace(null);

      await loadSpaces();
    } catch (error) {
      console.error("Erro ao salvar espaço:", error);

      const message =
        error.response?.data?.error || "Erro ao salvar espaço.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSpace(spaceId) {
    const confirmed = window.confirm("Deseja realmente excluir este espaço?");
    if (!confirmed) return;

    try {
      setLoading(true);

      const token = getUserToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      await deleteSpace(spaceId, authHeaders);

      if (editingSpace?.id === spaceId) {
        handleCancelEdit();
      }

      await loadSpaces();

      alert("Espaço removido com sucesso.");
    } catch (error) {
      console.error("Erro ao remover espaço:", error);

      const message =
        error.response?.data?.error || "Erro ao remover espaço.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout
      current="espacos"
      title="Espaços"
      subtitle="Gerencie salas e ambientes de atendimento."
    >
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="premium-card p-4">
            <h2 className="h5 fw-bold mb-4">
              {editingSpace ? "Editar espaço" : "Criar novo espaço"}
            </h2>

            <form onSubmit={handleSubmitSpace}>
              <div className="mb-3">
                <label
                  className="form-label fw-semibold"
                  htmlFor="space-name"
                >
                  Nome do espaço
                </label>

                <input
                  id="space-name"
                  className="form-control"
                  placeholder="Ex: Consultório A, Sala de espera, Reunião"
                  value={spaceName}
                  onChange={(event) => setSpaceName(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label
                  className="form-label fw-semibold"
                  htmlFor="space-description"
                >
                  Descrição
                </label>

                <textarea
                  id="space-description"
                  className="form-control"
                  rows="4"
                  placeholder="Ex: Consultório principal com ar condicionado, sofá de espera, armários..."
                  value={spaceDescription}
                  onChange={(event) => setSpaceDescription(event.target.value)}
                  disabled={loading}
                ></textarea>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-pm-primary rounded-pill w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Salvando...
                    </>
                  ) : editingSpace ? (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Salvar alterações
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-2"></i>
                      Criar espaço
                    </>
                  )}
                </button>

                {editingSpace && (
                  <button
                    type="button"
                    className="btn btn-pm-ghost rounded-pill w-100 py-2"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="premium-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h5 fw-bold mb-0">Espaços existentes</h2>
              <span className="badge bg-primary rounded-pill">
                {spaces.length}
              </span>
            </div>

            {spaces.length === 0 ? (
              <div className="soft-card p-4 text-center">
                <i className="bi bi-door-open fs-2 text-muted mb-2 d-block"></i>
                <p className="pm-text-muted mb-0">
                  Nenhum espaço criado ainda. Comece criando um novo espaço.
                </p>
              </div>
            ) : (
              <div className="d-grid gap-3">
                {spaces.map((space) => (
                  <div className="soft-card p-3" key={space.id}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <h3 className="h6 fw-bold mb-1">
                          {space.name}
                        </h3>

                        <p className="pm-text-muted small mb-2">
                          {space.description || "Sem descrição"}
                        </p>

                        {space.createdAt && (
                          <div className="pm-text-muted small">
                            Criado em{" "}
                            {new Date(space.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                      </div>

                      <div className="d-flex gap-2 flex-wrap justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-warning rounded-pill"
                          onClick={() => handleEditSpace(space)}
                          disabled={loading}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger rounded-pill"
                          onClick={() => handleDeleteSpace(space.id)}
                          disabled={loading}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}