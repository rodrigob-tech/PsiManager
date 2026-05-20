import { useState } from "react";

export default function BlockedTimeForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    start: "",
    end: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(formData);

    setFormData({
      start: "",
      end: ""
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: "12px",
        marginBottom: "20px",
        padding: "16px",
        background: "#f8faff",
        border: "1px solid #e1e8f5",
        borderRadius: "14px"
      }}
    >
      <h3 style={{ margin: 0 }}>Novo bloqueio</h3>

      <input
        type="datetime-local"
        name="start"
        value={formData.start}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <input
        type="datetime-local"
        name="end"
        value={formData.end}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" style={primaryButton}>
          Criar bloqueio
        </button>
      </div>
    </form>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d0d7e2",
  fontSize: "14px",
  background: "#fff"
};

const primaryButton = {
  border: "none",
  background: "#02af11",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  minWidth: "170px",
  height: "42px"
};