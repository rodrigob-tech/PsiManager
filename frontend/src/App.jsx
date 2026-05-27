import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CalendarPage from "../pages/CalendarPage";
import MyAppointmentsPage from "../pages/MyAppointmentsPage";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";
import PublicBookingPage from "../pages/PublicBookingPage";
import PatientRegisterPage from "../pages/PatientRegisterPage";
import PatientLoginPage from "../pages/PatientLoginPage";
import PatientProtectedRoute from "../components/publicBooking/PatientProtectedRoute";
import UserLoginPage from "../pages/UserLoginPage";
import MedicalRecordPage from "../pages/MedicalRecordPage";
import {
  isUserAuthenticated,
  getUserData,
  clearUserAuth
} from "./services/userAuthStorage";
import {
  isPatientAuthenticated,
  getPatientData,
  clearPatientAuth
} from "./services/patientAuthStorage";
import "../src/styles/navbar.css"
import AdminDashboardPage from "../pages/AdminDashboardPage.jsx";
import AdminAgendaPage from "../pages/AdminAgendaPage.jsx";
import AdminPatientsPage from "../pages/AdminPatientsPage.jsx";
import AdminAppointmentsPage from "../pages/AdminAppointmentsPage.jsx";
import AdminSpacesPage from "../pages/AdminSpacesPage.jsx";
import AdminBlockedTimesPage from "../pages/AdminBlockedTimesPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import FinancePage from "../pages/FinancePage.jsx";



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
            path="/finance"
            element={
              
                <FinancePage />
              
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
            element={<LandingPage/>}/>
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
