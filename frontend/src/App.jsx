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
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="app-brand-title">PsiManager</div>
            <div className="app-brand-subtitle">
              Gestão de atendimentos e autoagendamento
            </div>
          </div>

          <nav className="app-nav">
            {!adminLogged && !patientLogged && (
              <>
                <div className="nav-group">
                  <span className="nav-group-label">Admin</span>
                  <NavItem to="/login-admin">Login admin</NavItem>
                </div>

                <div className="nav-group">
                  <span className="nav-group-label">Paciente</span>
                  <NavItem to="/cadastro-paciente">Cadastro</NavItem>
                  <NavItem to="/login-paciente">Login</NavItem>
                </div>
              </>
            )}

            {adminLogged && (
              <div className="nav-group">
                <span className="nav-group-label">
                  Admin{admin?.name ? `: ${admin.name}` : ""}
                </span>
                <NavItem to="/">Painel</NavItem>
                <button
                  type="button"
                  className="nav-action-button"
                  onClick={() => {
                    clearUserAuth();
                    navigate("/login-admin", { replace: true });

                  }}
                >
                  Sair
                </button>
              </div>
            )}

            {patientLogged && (
              <div className="nav-group">
                <span className="nav-group-label">
                  Paciente{patient?.name ? `: ${patient.name}` : ""}
                </span>
                <NavItem to="/agendar">Agendar</NavItem>
                <NavItem to="/meus-agendamentos">Meus agendamentos</NavItem>
                <button
                  type="button"
                  className="nav-action-button"
                  onClick={() => {
                    clearPatientAuth();
                    navigate("/login-paciente", { replace: true });
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

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
            path="/patients/:patientId/prontuario"
            element={
              <AdminProtectedRoute>
                <MedicalRecordPage />
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
