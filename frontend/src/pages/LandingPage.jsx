import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Brand from "../components/layout/Brand";

export default function LandingPage(){
    const navigate = useNavigate();
    return(
        <main className="app-shell">
          <nav className="navbar navbar-expand-lg sticky-top glass-nav px-3 px-lg-5 py-3">
            <div className="container-fluid">
              <button className="btn p-0 border-0 bg-transparent" onClick={() => go("landing")} aria-label="Ir para início">
                <Brand />
              </button>

              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end">
                <button className="btn btn-pm-ghost rounded-pill px-4" onClick={() => navigate("/login-admin")}>Acesso admin</button>
                
                <button className="btn btn-pm-primary rounded-pill px-4" onClick={() => navigate("/login-admin")}>
                  Abrir demo
                </button>
              </div>
            </div>
          </nav>

          <section className="container py-5">
            <div className="row align-items-center g-5 py-lg-5">
              <div className="col-lg-6">
                <span className="status-pill mb-4 d-inline-flex align-items-center gap-2">
                  <i className="bi bi-stars"></i> SaaS premium para psicologia
                </span>
                <h1 className="display-4 fw-bold lh-1 mb-4" data-size="title">
                  PsiManager
                </h1>
                <p className="lead text-secondary mb-4" data-size="body">
                  PsiManager
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <button className="btn btn-pm-primary btn-lg rounded-pill px-5" onClick={() => navigate("/login-admin")}>
                    Conhecer plataforma
                  </button>
                  <button className="btn btn-pm-ghost btn-lg rounded-pill px-5" onClick={() => navigate("/login-admin")}>
                    Cadastrar paciente
                  </button>
                </div>

                <div className="d-flex gap-4 mt-5 flex-wrap">
                  <div>
                    <div className="fw-bold fs-3">98%</div>
                    <div className="text-secondary small">consultas organizadas</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-3">42h</div>
                    <div className="text-secondary small">economizadas por mês</div>
                  </div>
                  <div>
                    <div className="fw-bold fs-3">360°</div>
                    <div className="text-secondary small">visão da clínica</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="hero-card p-4 p-lg-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <div className="text-secondary small">Dashboard profissional</div>
                      <h2 className="h4 fw-bold mb-0" data-size="heading">Visão de hoje</h2>
                    </div>
                    <div className="avatar">DR</div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="soft-card p-3">
                        <div className="metric-icon mb-3"><i className="bi bi-calendar-check"></i></div>
                        <div className="fs-3 fw-bold">12</div>
                        <div className="text-secondary small">consultas</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="soft-card p-3">
                        <div className="metric-icon mb-3"><i className="bi bi-cash-stack"></i></div>
                        <div className="fs-3 fw-bold">R$ 8,4k</div>
                        <div className="text-secondary small">receita mensal</div>
                      </div>
                    </div>
                  </div>

                  <div className="mini-chart mb-3">
                    {[52, 74, 46, 90, 68, 82, 58].map((h, i) => (
                      <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>

                  <div className="soft-card p-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold">Próximo atendimento</div>
                      <div className="text-secondary small">Marina Alves · 14:00 · Online</div>
                    </div>
                    <span className="status-pill">Confirmado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4 pb-5">
              {[
                ["bi-people", "Gestão de pacientes", "Histórico, status, evolução e cadastro em uma jornada simples."],
                ["bi-calendar2-week", "Agenda inteligente", "Consultas online ou presenciais com visão semanal e diária."],
                ["bi-graph-up-arrow", "Financeiro e KPIs", "Receitas, pendências, ticket médio e desempenho da clínica."]
              ].map((item) => (
                <div className="col-md-4" key={item[1]}>
                  <div className="premium-card p-4 h-100">
                    <div className="metric-icon mb-3"><i className={`bi ${item[0]}`}></i></div>
                    <h3 className="h5 fw-bold">{item[1]}</h3>
                    <p className="text-secondary mb-0">{item[2]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
    );
}

      
    
