import { BrowserRouter, Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CalendarPage from "../pages/CalendarPage";
import MyAppointmentsPage from "../pages/MyAppointmentsPage";
import AdminProtectedRoute from "../components/admin/AdminProtectedRoute";
import PublicBookingPage from "../pages/PublicBookingPage";
import ClientRegisterPage from "../pages/ClientRegisterPage";
import ClientLoginPage from "../pages/ClientLoginPage";
import ClientProtectedRoute from "../components/publicBooking/ClientProtectedRoute";
import UserLoginPage from "../pages/UserLoginPage";
import {
  isUserAuthenticated,
  getUserData,
  clearUserAuth
} from "./services/userAuthStorage";
import {
  isClientAuthenticated,
  getClientData,
  clearClientAuth
} from "./services/clientAuthStorage";
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
  const [clientLogged, setClientLogged] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAdminLogged(isUserAuthenticated());
    setClientLogged(isClientAuthenticated());
    setAdmin(getUserData());
    setClient(getClientData());
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="app-brand-title">SmartAgenda</div>
            <div className="app-brand-subtitle">
              Gestão de atendimentos e autoagendamento
            </div>
          </div>

          <nav className="app-nav">
            {!adminLogged && !clientLogged && (
              <>
                <div className="nav-group">
                  <span className="nav-group-label">Admin</span>
                  <NavItem to="/login-admin">Login admin</NavItem>
                </div>

                <div className="nav-group">
                  <span className="nav-group-label">Cliente</span>
                  <NavItem to="/cadastro-cliente">Cadastro</NavItem>
                  <NavItem to="/login-cliente">Login</NavItem>
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

            {clientLogged && (
              <div className="nav-group">
                <span className="nav-group-label">
                  Cliente{client?.name ? `: ${client.name}` : ""}
                </span>
                <NavItem to="/agendar">Agendar</NavItem>
                <NavItem to="/meus-agendamentos">Meus agendamentos</NavItem>
                <button
                  type="button"
                  className="nav-action-button"
                  onClick={() => {
                    clearClientAuth();
                    navigate("/login-cliente", { replace: true });
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
            path="/agendar"
            element={
              <ClientProtectedRoute>
                <PublicBookingPage />
              </ClientProtectedRoute>
            }
          />

          <Route
            path="/meus-agendamentos"
            element={
              <ClientProtectedRoute>
                <MyAppointmentsPage />
              </ClientProtectedRoute>
            }
          />

          <Route path="/cadastro-cliente" element={<ClientRegisterPage />} />
          <Route path="/login-cliente" element={<ClientLoginPage />} />
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
