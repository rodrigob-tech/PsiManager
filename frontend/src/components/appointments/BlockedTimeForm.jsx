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
        className="form-control"
      />

      <input
        type="datetime-local"
        name="end"
        value={formData.end}
        onChange={handleChange}
        required
        className="form-control"
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          Criar bloqueio
        </button>
      </div>
    </form>
  );
}

