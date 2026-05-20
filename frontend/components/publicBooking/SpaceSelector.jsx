export default function SpaceSelector({ spaces, value, onChange }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600"
        }}
      >
        Espaço
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #d0d7e2",
          fontSize: "15px",
          background: "#fff"
        }}
      >
        <option value="">Selecione um espaço</option>
        {spaces.map((space) => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>
    </div>
  );
}