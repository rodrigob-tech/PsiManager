import { NavLink } from "react-router-dom";
import Brand from "./Brand";
import { getUserData } from "../../storages/userAuthStorage";
 


export default function Sidebar() {
  const user = getUserData();
const isAdmin = user?.role === "ADMIN";
const navItems = [
   { to: "/landing-page", label: "Pagina Inicial", icon: "bi-calendar-x" },
  { to: "/admin/dashboard", label: "Dashboard", icon: "bi-grid-1x2-fill" },
  { to: "/admin/agenda", label: "Agenda", icon: "bi-calendar2-week" },
  { to: "/admin/pacientes", label: "Pacientes", icon: "bi-people" },
  { to: "/admin/agendamentos", label: "Agendamentos", icon: "bi-calendar-plus" },
  { to: "/admin/espacos", label: "Espaços", icon: "bi-building" },
  { to: "/admin/bloqueios", label: "Bloqueios", icon: "bi-calendar-x" },
  { to: "/admin/finance", label: "Financeiro", icon: "bi-wallet2" },
  ...(isAdmin
    ? [{ to: "/admin/clinica", label: "Clínica", icon: "bi-building-gear" }]
    : []),
  { to: "/admin/relatorios", label: "Relatórios", icon: "bi-bar-chart" },
   ...(isAdmin
    ? [{ to: "/admin/auditoria", label: "Auditoria", icon: "bi-shield-check" }]
    : [])
];
  return (
    <aside className="sidebar p-4">
      <div className="mb-4">
        <Brand />
      </div>

      <nav className="sidebar-nav d-grid gap-2" aria-label="Menu principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link text-decoration-none ${isActive ? "active" : ""}`
            }
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div
        className="soft-card p-3 mt-4"
        style={{
          background: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <div className="small text-white-50 mb-1">Sistema</div>
        <div className="fw-bold text-white">PsiManager</div>
        <div className="small text-white-50">Gestão clínica</div>
      </div>
    </aside>
  );
}