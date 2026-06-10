
import { useEffect, useState } from "react";


import DashboardLayout from "../components/layout/DashboardLayout";
import AppointmentList from "../components/appointments/AppointmentList";
import AppointmentForm from "../components/appointments/AppointmentForm";
import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from "../services/appointmentService";


import {
    getSpaces,
    createSpace,
    updateSpace,
    deleteSpace
} from "../services/spaceService";
import { getPatients, createPatient, updatePatient, deletePatient } from "../services/patientService";
import { getPsychologists } from "../services/userService";

import { getUserToken, getUserData } from "../storages/userAuthStorage";




export default function AdminAppointmentsPage() {


    const [appointments, setAppointments] = useState([]);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [patients, setPatients] = useState([]);
    const [spaces, setSpaces] = useState([]);
    const [psychologists, setPsychologists] = useState([]);

    async function loadData() {
        try {
            const token = getUserToken();
            const authHeaders = { Authorization: `Bearer ${token}` };

            const [
                appointmentsResponse,
                patientsResponse,
                spacesResponse,
                psychologistsResponse,
            ] = await Promise.all([
                getAppointments(authHeaders),
                getPatients(authHeaders),
                getSpaces(authHeaders),
                getPsychologists(authHeaders),
            ]);

           

            setAppointments(appointmentsResponse.data);
            setPatients(patientsResponse.data);
            setSpaces(spacesResponse.data);
            setPsychologists(psychologistsResponse.data);
        } catch (error) {
            console.error("Erro ao carregar dados dos agendamentos:", error);
            alert("Erro ao carregar dados dos agendamentos");
        }
    }
    const handleSubmitAppointment = async (formData) => {
        try {
            const token = getUserToken();
            const authHeaders = {
                Authorization: `Bearer ${token}`
            };
            

            

            if (editingAppointment) {
                await updateAppointment(editingAppointment.id, formData, authHeaders);
                alert("Agendamento atualizado com sucesso");
                setEditingAppointment(null);
            } else {
                
                
                await createAppointment(formData, authHeaders);
                alert("Agendamento criado com sucesso");
            }

            await loadData();
        } catch (error) {
            console.error("Erro ao salvar agendamento:", error);

            const message =
                error.response?.data?.error || "Erro ao salvar agendamento";

            alert(message);
        }
    };

    const handleDeleteAppointment = async (id) => {
        const confirmed = window.confirm("Deseja realmente excluir este agendamento?");
        if (!confirmed) return;

        try {
            const token = getUserToken();
            const authHeaders = {
                Authorization: `Bearer ${token}`
            };

            await deleteAppointment(id, authHeaders);
            await loadData();
            alert("Agendamento removido com sucesso");
        } catch (error) {
            console.error("Erro ao remover agendamento:", error);

            const message =
                error.response?.data?.error || "Erro ao remover agendamento";

            alert(message);
        }
    };
    useEffect(() => {
        loadData();
    }, []);

    return (
        <DashboardLayout
            title="Agendamentos"
            subtitle="Cadastre, edite e acompanhe os agendamentos da clínica."
            current="agendamentos"
        >
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="premium-card p-4 ">
                        <h2 className="h5 fw-bold mb-3">
                            {editingAppointment ? "Editar agendamento" : "Novo agendamento"}
                        </h2>
                        <AppointmentForm
                            patients={patients}
                            spaces={spaces}
                            psychologists={psychologists}
                            onSubmit={handleSubmitAppointment}
                            editingAppointment={editingAppointment}
                            onCancelEdit={() => setEditingAppointment(null)}
                        />
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="premium-card p-4">
                        <h2 className="h5 fw-bold mb-3">Lista de agendamentos</h2>
                        <AppointmentList
                            appointments={appointments}
                            onDelete={handleDeleteAppointment}
                            onEdit={setEditingAppointment}
                        />
                    </div>
                </div>
            </div>

        </DashboardLayout>

    );
}