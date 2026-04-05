import { useCarbonStore } from '../../store/useCarbonStore.jsx';
import { generateComplianceReport } from '../../utils/generatePDF.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Line } from 'recharts';

export default function Dashboard() {
    const { records, totals, monteCarlo } = useCarbonStore();

    // Graph 1: Scope Apportionment (Pie Data)
    const pieData = [
        { name: 'Scope 1', value: totals.scope1 },
        { name: 'Scope 2', value: totals.scope2 },
        { name: 'Scope 3', value: totals.scope3 }
    ].filter(d => d.value > 0);
    const pieColors = ['#A0AEC0', '#E6E9E7', '#4A5568'];

    // Graph 2: Financial Efficiency Mapping
    const monthlySpendMap = {};
    records.forEach(r => {
        const m = r.month || "Unknown";
        monthlySpendMap[m] = (monthlySpendMap[m] || 0) + Number(r.monthlySpend || 0);
    });

    const financialData = totals.monthlyData ? totals.monthlyData.map(d => ({
        name: d.name,
        Emissions: d.Total,
        SpendUSD: monthlySpendMap[d.name] || 0
    })) : [];

    // Graph 3: Future Variance Risk (Monte Carlo Arrays)
    const riskData = [
        { name: 'P10 Optimal', value: Number(monteCarlo.p10) || 0, fill: '#E6E9E7' },
        { name: 'P50 Baseline', value: Number(monteCarlo.p50) || 0, fill: '#A0AEC0' },
        { name: 'P90 Max Risk', value: Number(monteCarlo.p90) || 0, fill: '#4A5568' }
    ].filter(d => d.value > 0);



    return (
        <div>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#E6E9E7', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                        Emissions Overview
                    </h1>
                    <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>
                        Monitor your company's emissions and efficiency metrics.
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (records.length === 0) return alert("Enter dataset before generating reports.");
                        generateComplianceReport(records, totals, monteCarlo);
                    }}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export Compliance PDF
                </button>
            </header>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div className="card" style={{ flex: 1 }}>
                    <p className="section-label">Scope 1</p>
                    <div className="stat-value">{totals.scope1 ? totals.scope1.toFixed(2) : "0.00"}<span className="stat-unit">MtCO₂e</span></div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <p className="section-label">Scope 2</p>
                    <div className="stat-value">{totals.scope2 ? totals.scope2.toFixed(2) : "0.00"}<span className="stat-unit">MtCO₂e</span></div>
                </div>
                <div className="card" style={{ flex: 1 }}>
                    <p className="section-label">Scope 3</p>
                    <div className="stat-value">{totals.scope3 ? totals.scope3.toFixed(2) : "0.00"}<span className="stat-unit">MtCO₂e</span></div>
                </div>
            </div>

            <div className="card" style={{ height: '350px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', color: '#E6E9E7', marginTop: 0, marginBottom: '16px' }}>Emissions Trend over Time (MTCO₂e)</h3>
                {(!totals.monthlyData || totals.monthlyData.length === 0) ? (
                    <div style={{ color: '#8D9390', fontSize: '13px', textAlign: 'center', marginTop: '100px' }}>No data yet — add records in Data Entry.</div>
                ) : (
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={totals.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A0AEC0" stopOpacity={0.8} /><stop offset="95%" stopColor="#A0AEC0" stopOpacity={0} /></linearGradient>
                                <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E6E9E7" stopOpacity={0.8} /><stop offset="95%" stopColor="#E6E9E7" stopOpacity={0} /></linearGradient>
                                <linearGradient id="c3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4A5568" stopOpacity={0.8} /><stop offset="95%" stopColor="#4A5568" stopOpacity={0} /></linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#8D9390" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#8D9390" fontSize={11} tickLine={false} axisLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#222524" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '4px' }}
                                itemStyle={{ color: '#E6E9E7', fontSize: '12px' }}
                                labelStyle={{ color: '#8D9390', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px' }} />
                            <Area type="monotone" dataKey="Scope1" stackId="1" stroke="#A0AEC0" fill="url(#c1)" name="Scope 1" />
                            <Area type="monotone" dataKey="Scope2" stackId="1" stroke="#E6E9E7" fill="url(#c2)" name="Scope 2" />
                            <Area type="monotone" dataKey="Scope3" stackId="1" stroke="#4A5568" fill="url(#c3)" name="Scope 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* 3 Additional Graphs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Graph 1: Scope Pie Chart */}
                <div className="card" style={{ height: '300px' }}>
                    <h3 style={{ fontSize: '14px', color: '#E6E9E7', marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>Emissions by Scope</h3>
                    {pieData.length === 0 ? <p style={{ color: '#8D9390', fontSize: '12px', textAlign: 'center', marginTop: '80px' }}>No data yet.</p> : (
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '4px' }}
                                    itemStyle={{ color: '#E6E9E7', fontSize: '12px' }}
                                    labelStyle={{ color: '#8D9390', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Graph 2: Financial Efficiency Composed Chart */}
                <div className="card" style={{ height: '300px' }}>
                    <h3 style={{ fontSize: '14px', color: '#E6E9E7', marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>Efficiency Analytics</h3>
                    {financialData.length === 0 ? <p style={{ color: '#8D9390', fontSize: '12px', textAlign: 'center' }}>No sufficient data.</p> : (
                        <ResponsiveContainer width="100%" height="85%">
                            <ComposedChart data={financialData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222524" vertical={false} />
                                <XAxis dataKey="name" stroke="#8D9390" fontSize={10} tickLine={false} />
                                <YAxis yAxisId="left" stroke="#8D9390" fontSize={10} tickLine={false} domain={[0, 'auto']} />
                                <YAxis yAxisId="right" orientation="right" stroke="#A0AEC0" fontSize={10} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '4px' }}
                                    itemStyle={{ color: '#E6E9E7', fontSize: '12px' }}
                                    labelStyle={{ color: '#8D9390', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Bar yAxisId="left" dataKey="SpendUSD" fill="#222524" name="Spend (₹)" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="Emissions" stroke="#E6E9E7" strokeWidth={3} name="Emissions (MT)" dot={{ r: 3, fill: '#E6E9E7' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Graph 3: Future Risk Range Bar Chart */}
                <div className="card" style={{ height: '300px' }}>
                    <h3 style={{ fontSize: '14px', color: '#E6E9E7', marginTop: 0, marginBottom: '16px', textAlign: 'center' }}>Forecasted Volatility</h3>
                    {riskData.length === 0 ? <p style={{ color: '#8D9390', fontSize: '12px', textAlign: 'center' }}>No sufficient data.</p> : (
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={riskData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#222524" vertical={false} />
                                <XAxis dataKey="name" stroke="#8D9390" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8D9390" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '4px' }}
                                    itemStyle={{ color: '#E6E9E7', fontSize: '12px' }}
                                    labelStyle={{ color: '#8D9390', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
                                />
                                <Bar dataKey="value" name="Simulated Target (MT)" radius={[6, 6, 0, 0]}>
                                    {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

            </div>
        </div>
    )
}
