  export default function MetricCard({ icon, label, value, trend }) {
      return (
        <div className="premium-card p-4 h-100">
          <div className="d-flex justify-content-between align-items-start">
            <div className="metric-icon"><i className={`bi ${icon}`}></i></div>
            <span className="status-pill">{trend}</span>
          </div>
          <div className="fs-2 fw-bold mt-3">{value}</div>
          <div className="metric-label">{label}</div>
        </div>
      );
    }
