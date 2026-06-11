import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getGoogleCalendarAuthUrl,
  getGoogleCalendarStatus,
} from "../../services/googleCalendarService";
import { getUserToken } from "../../storages/userAuthStorage";

  


export default function Topbar({ title, subtitle }) {
  const [googleStatus, setGoogleStatus] = useState({
    googleConnected: false,
    googleCalendarEmail: "",
  });

  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleConnecting, setGoogleConnecting] = useState(false);

  async function loadGoogleStatus() {
    try {
      setGoogleLoading(true);

      const token = getUserToken();

      if (!token) {
        setGoogleStatus({
          googleConnected: false,
          googleCalendarEmail: "",
        });

        return;
      }

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const response = await getGoogleCalendarStatus(authHeaders);

      setGoogleStatus({
        googleConnected: Boolean(response.data?.googleConnected),
        googleCalendarEmail: response.data?.googleCalendarEmail || "",
      });
    } catch (error) {
      console.error("Erro ao carregar status do Google Agenda:", error);

      setGoogleStatus({
        googleConnected: false,
        googleCalendarEmail: "",
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleConnectGoogleCalendar() {
    try {
      setGoogleConnecting(true);

      const token = getUserToken();

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };

      const response = await getGoogleCalendarAuthUrl(authHeaders);

      if (!response.data?.authUrl) {
        alert("Não foi possível iniciar a conexão com Google Agenda.");
        return;
      }

      window.open(response.data.authUrl, "_blank");
    } catch (error) {
      console.error("Erro ao conectar Google Agenda:", error);

      const message =
        error.response?.data?.error || "Erro ao conectar Google Agenda";

      alert(message);
    } finally {
      setGoogleConnecting(false);
    }
  }
 const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login-admin");
  }

  useEffect(() => {
    loadGoogleStatus();

    function handleFocus() {
      loadGoogleStatus();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
  return (
    <header className="topbar p-3 p-lg-4 mb-4 d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div>
        <h1 className="h3 fw-bold mb-1">{title}</h1>
        <p className="text-secondary mb-0">{subtitle}</p>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        {googleLoading ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill"
            disabled
          >
            <i className="bi bi-calendar2-week me-1"></i>
            Google Agenda
          </button>
        ) : googleStatus.googleConnected ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-success rounded-pill"
            title={googleStatus.googleCalendarEmail || "Google Agenda conectado"}
            onClick={loadGoogleStatus}
          >
            <i className="bi bi-check-circle me-1"></i>
            {googleStatus.googleCalendarEmail
              ? `Google: ${googleStatus.googleCalendarEmail}`
              : "Google Agenda conectado"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill"
            onClick={handleConnectGoogleCalendar}
            disabled={googleConnecting}
          >
            <i className="bi bi-calendar-plus me-1"></i>
            {googleConnecting ? "Conectando..." : "Conectar Google Agenda"}
          </button>
        )}

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