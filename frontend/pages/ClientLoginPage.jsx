import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveClientAuth } from "../src/services/clientAuthStorage";
import { clearUserAuth } from "../src/services/userAuthStorage";

export default function ClientLoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/client-auth/login", formData);

      clearUserAuth();

      saveClientAuth({
        token: response.data.token,
        client: response.data.client
      });

      navigate("/agendar", { replace: true });
    } catch (error) {
      setError(error.response?.data?.error || "Erro ao fazer login do cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        <div style={logoPanelStyle}>
          <div style={logoBoxStyle}>
            <img
              src=" ../src/img/logotipoSmartAgenda.png"
              alt="Logo SmartAgenda"
              style={logoImageStyle}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div style={logoFallbackStyle}>SmartAgenda</div>
          </div>

          <h2 style={logoTitleStyle}>Agende seu atendimento com praticidade.</h2>
          <p style={logoTextStyle}>
            Consulte horários disponíveis, confirme sua reserva e acompanhe seus agendamentos.
          </p>
        </div>

        <div style={cardStyle}>
          <h1 style={titleStyle}>Login do cliente</h1>
          <p style={subtitleStyle}>
            Entre para marcar ou acompanhar seus atendimentos.
          </p>

          {error && <div style={errorStyle}>{error}</div>}

          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="email"
              name="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p style={footerTextStyle}>
            Ainda não tem conta?{" "}
            <Link to="/cadastro-cliente" style={linkStyle}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 80px)",
  background: "#f5f7fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 20px"
};

const layoutStyle = {
  width: "100%",
  maxWidth: "980px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
  alignItems: "stretch"
};

const logoPanelStyle = {
  background: "linear-gradient(135deg, #1976d2, #0f4c9c)",
  borderRadius: "20px",
  padding: "32px",
  color: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
};

const logoBoxStyle = {
  minHeight: "140px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
  position: "relative",
  overflow: "hidden"
};

const logoImageStyle = {
  maxWidth: "75%",
  maxHeight: "110px",
  objectFit: "contain"
};

const logoFallbackStyle = {
  position: "absolute",
  fontSize: "28px",
  fontWeight: "800",
  opacity: 0.95
};

const logoTitleStyle = {
  margin: "0 0 10px",
  fontSize: "28px"
};

const logoTextStyle = {
  margin: 0,
  lineHeight: 1.6,
  color: "#eaf2ff"
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  color: "#1f2937"
};

const subtitleStyle = {
  margin: "8px 0 22px",
  color: "#64748b",
  lineHeight: 1.5
};

const formStyle = {
  display: "grid",
  gap: "12px"
};

const inputStyle = {
  padding: "13px",
  borderRadius: "10px",
  border: "1px solid #d0d7e2",
  fontSize: "15px"
};

const buttonStyle = {
  border: "none",
  background: "#1976d2",
  color: "#fff",
  padding: "13px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "15px"
};

const footerTextStyle = {
  marginTop: "18px",
  color: "#64748b"
};

const linkStyle = {
  color: "#1976d2",
  fontWeight: "700",
  textDecoration: "none"
};

const errorStyle = {
  background: "#fdecea",
  color: "#b42318",
  border: "1px solid #f5c2c7",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "14px"
};