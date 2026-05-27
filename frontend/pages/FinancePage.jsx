import DashboardLayout from "../components/layout/DashboardLayout";
import MetricCard from "../components/metrics/MetricCard";
export default function FinancePage() {
    return (
        <DashboardLayout current="financeiro" title="Financeiro" subtitle="Acompanhe receitas, pendências e performance financeira.">
            <div className="row g-4 mb-4">
                <div className="col-md-4"><MetricCard icon="bi-cash-stack" label="Receita recebida" value="R$ 32,8k" trend="+18%" /></div>
                <div className="col-md-4"><MetricCard icon="bi-hourglass-split" label="A receber" value="R$ 6,2k" trend="12 itens" /></div>
                <div className="col-md-4"><MetricCard icon="bi-receipt" label="Ticket médio" value="R$ 220" trend="+4%" /></div>
            </div>

            <div className="premium-card p-4">
                <h2 className="h5 fw-bold mb-3">Movimentações recentes</h2>
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr className="text-secondary">
                                <th>Descrição</th>
                                <th>Paciente</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["Consulta individual", "Marina Alves", "R$ 220", "Pago"],
                                ["Sessão online", "Caio Menezes", "R$ 180", "Pendente"],
                                ["Retorno presencial", "Fernanda Lima", "R$ 220", "Pago"]
                            ].map(row => (
                                <tr key={row[1]}>
                                    <td>{row[0]}</td>
                                    <td>{row[1]}</td>
                                    <td><strong>{row[2]}</strong></td>
                                    <td><span className="status-pill">{row[3]}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
