import { useNavigate } from "react-router-dom";

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login-admin");
  }

  return (
    <header className="topbar p-3 p-lg-4 mb-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div>
        <h1 className="h3 fw-bold mb-1">{title}</h1>
        <p className="text-secondary mb-0">{subtitle}</p>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button
          className="btn btn-pm-ghost rounded-pill px-3"
          onClick={() => navigate("/admin")}
        >
          <i className="bi bi-calendar-plus me-2"></i>
          Agenda
        </button>

        <button
          className="btn btn-pm-primary rounded-pill px-3"
          onClick={() => navigate("/cadastro-paciente")}
        >
          <i className="bi bi-person-plus me-2"></i>
          Pacientes
        </button>

        <div className="d-flex align-items-center gap-2">
          <div className="avatar">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "PM"}
          </div>

          <button
            className="btn btn-outline-danger btn-sm rounded-pill"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}