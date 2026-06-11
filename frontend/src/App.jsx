import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import CalendarPage from "../src/pages/CalendarPage.jsx";
import MyAppointmentsPage from "../src/pages/MyAppointmentsPage.jsx";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute.jsx";

import PublicBookingPage from "../src/pages/PublicBookingPage.jsx";
import PatientRegisterPage from "../src/pages/PatientRegisterPage.jsx";
import PatientLoginPage from "../src/pages/PatientLoginPage.jsx";
import PatientProtectedRoute from "./components/publicBooking/PatientProtectedRoute.jsx";
import UserLoginPage from "./pages/UserLoginPage.jsx";
import MedicalRecordPage from "./pages/MedicalRecordPage.jsx";
import {
  isUserAuthenticated,
  getUserData,
  clearUserAuth
} from "../src/storages/userAuthStorage.js";
import {
  isPatientAuthenticated,
  getPatientData,
  clearPatientAuth
} from "../src/storages/patientAuthStorage.js";

import "./styles/navbar.css"
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminAgendaPage from "./pages/AdminAgendaPage";
import AdminPatientsPage from "./pages/AdminPatientsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminSpacesPage from "./pages/AdminSpacesPage";
import AdminBlockedTimesPage from "./pages/AdminBlockedTimesPage";
import LandingPage from "./pages/LandingPage";
import FinancePage from "./pages/FinancePage";
import AdminClinicPage from "./pages/AdminClinicPage";
import ReportsPage from "./pages/ReportsPage.jsx";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();

  const [adminLogged, setAdminLogged] = useState(false);
  const [patientLogged, setPatientLogged] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAdminLogged(isUserAuthenticated());
    setPatientLogged(isPatientAuthenticated());
    setAdmin(getUserData());
    setPatient(getPatientData());
  }, [location.pathname]);

  return (
    <div className="app-shell">


      <main>
        <Routes>
          <Route path="/login-admin" element={<UserLoginPage />} />

          <Route
            path="/"
            element={
              <AdminProtectedRoute>
                <CalendarPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/agenda"
            element={
              <AdminProtectedRoute>
                <AdminAgendaPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/pacientes"
            element={
              <AdminProtectedRoute>
                <AdminPatientsPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/agendamentos"
            element={
              <AdminProtectedRoute>
                <AdminAppointmentsPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/espacos"
            element={
              <AdminProtectedRoute>
                <AdminSpacesPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/bloqueios"
            element={
              <AdminProtectedRoute>
                <AdminBlockedTimesPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/patients/:patientId/prontuario"
            element={
              <AdminProtectedRoute>
                <MedicalRecordPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/clinica"
            element={
              <AdminProtectedRoute>
                <AdminClinicPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <AdminProtectedRoute>
                <FinancePage />
              </AdminProtectedRoute>


            }
          />
          <Route
            path="/admin/relatorios"
            element={
              <AdminProtectedRoute>
                <ReportsPage />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/auditoria"
            element={
              <AdminProtectedRoute>
                <AdminAuditLogsPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/agendar"
            element={
              <PatientProtectedRoute>
                <PublicBookingPage />
              </PatientProtectedRoute>
            }
          />

          <Route
            path="/meus-agendamentos"
            element={
              <PatientProtectedRoute>
                <MyAppointmentsPage />
              </PatientProtectedRoute>
            }
          />

          <Route path="/cadastro-paciente" element={<PatientRegisterPage />} />
          <Route path="/login-paciente" element={<PatientLoginPage />} />

          <Route
            path="/landing-page"
            element={<LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "nav-item active" : "nav-item"
      }
    >
      {children}
    </NavLink>
  );
}

export default App;
