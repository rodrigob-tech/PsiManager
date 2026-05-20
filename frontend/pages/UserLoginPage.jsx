import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveUserAuth } from "../src/services/userAuthStorage";
import { clearClientAuth } from "../src/services/clientAuthStorage";

export default function UserLoginPage() {
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

      const response = await api.post("/user-auth/login", formData);

      clearClientAuth();

      saveUserAuth({
        token: response.data.token,
        user: response.data.user
      });

      navigate("/", { replace: true });
    } catch (error) {
      setError(error.response?.data?.error || "Erro ao fazer login admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Login do admin</h1>
        <p style={subtitleStyle}>
          Acesse o painel administrativo para gerenciar clientes, espaços e agendamentos.
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="email"
            name="email"
            placeholder="Email do admin"
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
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
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

const cardStyle = {
  width: "100%",
  maxWidth: "430px",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "30px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
};

const brandStyle = {
  color: "#1976d2",
  fontWeight: "800",
  fontSize: "24px",
  marginBottom: "18px"
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

const errorStyle = {
  background: "#fdecea",
  color: "#b42318",
  border: "1px solid #f5c2c7",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "14px"
};