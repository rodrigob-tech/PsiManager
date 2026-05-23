import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import SpaceForm from "../components/appointments/SpaceForm";
import SpaceList from "../components/appointments/SpaceList";
import {
    getSpaces,
    createSpace,
    updateSpace,
    deleteSpace
} from "../services/spaceService";
import { getUserToken } from "../src/services/userAuthStorage";
export default function AdminSpacesPage() {
    const [spaces, setSpaces] = useState([]);
    const [editingSpace, setEditingSpace] = useState(null);

    async function loadSpaces() {
        try {
            const token = getUserToken();
            const authHeaders = { Authorization: `Bearer ${token}` };

            const response = await getSpaces(authHeaders);
            setSpaces(response.data);
        } catch (error) {
            console.error("Erro ao carregar os espaços:", error);
            alert("Erro ao carregar os espaços");
        }
    }
    const handleSubmitSpace = async (formData) => {
        try {
            const token = getUserToken();
            const authHeaders = {
                Authorization: `Bearer ${token}`
            };

            if (editingSpace) {
                await updateSpace(editingSpace.id, formData, authHeaders);
                alert("Espaço atualizado com sucesso");
                setEditingSpace(null);
            } else {
                await createSpace(formData, authHeaders);
                alert("Espaço criado com sucesso");
            }

            await loadSpaces();
        } catch (error) {
            console.error("Erro ao salvar espaço:", error);

            const message =
                error.response?.data?.error || "Erro ao salvar espaço";

            alert(message);
        }
    };

    const handleDeleteSpace = async (id) => {
        const confirmed = window.confirm("Deseja realmente excluir este espaço?");
        if (!confirmed) return;

        try {
            const token = getUserToken();
            const authHeaders = {
                Authorization: `Bearer ${token}`
            };

            await deleteSpace(id, authHeaders);
            await loadSpaces();
            alert("Espaço removido com sucesso");
        } catch (error) {
            console.error("Erro ao remover espaço:", error);

            const message =
                error.response?.data?.error || "Erro ao remover espaço";

            alert(message);
        }
    };
    useEffect(() => {
        loadSpaces();
    }, []);
    return (
        <DashboardLayout
            title="Espaços"
            subtitle="Cadastre, edite e acompanhe os espaços/salas."
            current="espacos"
        >
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="premium-card p-4">
                        <h2 className="h5 fw-bold mb-3">
                            {editingSpace ? "Editar espaço" : "Novo espaço"}
                        </h2>

                        <SpaceForm
                            onSubmit={handleSubmitSpace}
                            editingSpace={editingSpace}
                            onCancelEdit={() => setEditingSpace(null)}
                        />
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="premium-card p-4">
                        <h2 className="h5 fw-bold mb-3">Lista de pacientes</h2>

                        <SpaceList
                            spaces={spaces}
                            onEdit={setEditingSpace}
                            onDelete={handleDeleteSpace}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}