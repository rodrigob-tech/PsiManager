export default function Brand({ compact = false }) {
     

      return (
        <div className="d-flex align-items-center gap-3">
          <div className="brand-mark">Ψ</div>
          {!compact && (
            <div>
              <div className="fw-black fw-bold lh-sm" data-size="body">PsiManager</div>
              <div className="text-secondary small" data-size="small">Clinic OS</div>
            </div>
          )}
        </div>
      );
    }
