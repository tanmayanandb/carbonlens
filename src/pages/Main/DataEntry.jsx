import { useState, useMemo } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore.jsx';
import { EMISSION_FACTORS } from '../../utils/emissionsCalc';

export default function DataEntry() {
    const { records, addRecord, removeRecord } = useCarbonStore();

    const [form, setForm] = useState({
        selMonth: 'Jan', selYear: '2024',
        naturalGas: '', fleetFuel: '', refrigerants: '',
        electricity: '', purchasedSteam: '',
        businessTravel: '', waste: '', supplyChain: '',
        monthlySpend: ''
    });

    const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Consumer-ready live calculation utilizing the 8 standard parameters
    const liveStats = useMemo(() => {
        const s1 = ((Number(form.naturalGas) || 0) * EMISSION_FACTORS.naturalGasTherms) +
            ((Number(form.fleetFuel) || 0) * EMISSION_FACTORS.fleetFuelGal) +
            ((Number(form.refrigerants) || 0) * EMISSION_FACTORS.refrigerantsKg);
        const s2 = ((Number(form.electricity) || 0) * EMISSION_FACTORS.electricityKwh) +
            ((Number(form.purchasedSteam) || 0) * EMISSION_FACTORS.purchasedSteamMmbtu);
        const s3 = ((Number(form.businessTravel) || 0) * EMISSION_FACTORS.businessTravelMiles) +
            ((Number(form.waste) || 0) * EMISSION_FACTORS.wasteTons) +
            ((Number(form.supplyChain) || 0) * EMISSION_FACTORS.supplyChainSpend);

        const COST_FACTORS = {
            naturalGas: 1.18, fleetFuel: 4.25, electricity: 0.165, businessTravel: 0.42, waste: 110.00
        };

        const calcSpend =
            ((Number(form.naturalGas) || 0) * COST_FACTORS.naturalGas) +
            ((Number(form.fleetFuel) || 0) * COST_FACTORS.fleetFuel) +
            ((Number(form.electricity) || 0) * COST_FACTORS.electricity) +
            ((Number(form.businessTravel) || 0) * COST_FACTORS.businessTravel) +
            ((Number(form.waste) || 0) * COST_FACTORS.waste) +
            (Number(form.supplyChain) || 0);

        return {
            emissions: (s1 + s2 + s3) / 1000,
            spend: Number(form.monthlySpend) || calcSpend
        };
    }, [form]);

    const submitRecord = (e) => {
        e.preventDefault();
        addRecord({ ...form, month: `${form.selYear} ${form.selMonth}` });
        setForm(prev => ({ ...prev, naturalGas: '', fleetFuel: '', refrigerants: '', electricity: '', purchasedSteam: '', businessTravel: '', waste: '', supplyChain: '', monthlySpend: '' }));
    };

    const inputStyle = { backgroundColor: '#111211', border: '1px solid #222524', color: '#E6E9E7', padding: '10px', borderRadius: '6px', width: '100%', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
    const labelStyle = { display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' };
    const sectionStyle = { borderLeft: '2px solid #222524', paddingLeft: '16px', marginBottom: '24px' };

    return (
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, maxWidth: '440px' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#E6E9E7', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>Data Entry</h1>
                    <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>Enter your operations data to update your carbon records.</p>
                </header>

                <form onSubmit={submitRecord} style={{ display: 'flex', flexDirection: 'column' }}>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Month</label>
                            <select name="selMonth" value={form.selMonth} onChange={handleInput} style={inputStyle}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Year</label>
                            <select name="selYear" value={form.selYear} onChange={handleInput} style={inputStyle}>
                                {['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ ...sectionStyle, borderLeftColor: '#A0AEC0' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#8D9390', letterSpacing: '0.06em' }}>SCOPE 1 — DIRECT</h4>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}><input type="number" name="naturalGas" value={form.naturalGas} onChange={handleInput} placeholder="Nat Gas (Therms)" style={inputStyle} /></div>
                            <div style={{ flex: 1 }}><input type="number" name="fleetFuel" value={form.fleetFuel} onChange={handleInput} placeholder="Fleet Fuel (Gal)" style={inputStyle} /></div>
                        </div>
                        <input type="number" name="refrigerants" value={form.refrigerants} onChange={handleInput} placeholder="HVAC Refrigerant Leaks (kg)" style={inputStyle} title="F-gases are highly toxic to carbon equivalents." />
                    </div>

                    <div style={{ ...sectionStyle, borderLeftColor: '#E6E9E7' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#8D9390', letterSpacing: '0.06em' }}>SCOPE 2 — PURCHASED ENERGY</h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}><input type="number" name="electricity" value={form.electricity} onChange={handleInput} placeholder="Grid Power (kWh)" style={inputStyle} /></div>
                            <div style={{ flex: 1 }}><input type="number" name="purchasedSteam" value={form.purchasedSteam} onChange={handleInput} placeholder="Dist. Steam (MMBtu)" style={inputStyle} /></div>
                        </div>
                    </div>

                    <div style={{ ...sectionStyle, borderLeftColor: '#4A5568' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#8D9390', letterSpacing: '0.06em' }}>SCOPE 3 — VALUE CHAIN</h4>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}><input type="number" name="businessTravel" value={form.businessTravel} onChange={handleInput} placeholder="Flights (Miles)" style={inputStyle} /></div>
                            <div style={{ flex: 1 }}><input type="number" name="waste" value={form.waste} onChange={handleInput} placeholder="Landfill Waste (Tons)" style={inputStyle} /></div>
                        </div>
                        <input type="number" name="supplyChain" value={form.supplyChain} onChange={handleInput} placeholder="Procured Goods Spend (₹)" style={inputStyle} />
                    </div>

                    {/* Aggregated Total Spend Input - Cleaner Consumer UI */}
                    <div style={{ borderLeft: '2px solid #A0AEC0', paddingLeft: '16px', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 600, color: '#8D9390', letterSpacing: '0.06em' }}>MONTHLY SPEND (OPTIONAL)</h4>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '6px', overflow: 'hidden' }}>
                            <span style={{ padding: '10px 14px', backgroundColor: '#171817', color: '#8D9390', fontSize: '14px', borderRight: '1px solid #222524' }}>₹</span>
                            <input type="number" name="monthlySpend" value={form.monthlySpend} onChange={handleInput} placeholder="Total gross operating expenditure for this month" style={{ ...inputStyle, border: 'none', borderRadius: 0, paddingLeft: '12px' }} />
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#171817', padding: '16px 20px', borderRadius: '6px', border: '1px solid #222524', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#8D9390', fontSize: '13px', fontWeight: 500 }}>Estimated Impact</span>
                            <span style={{ fontSize: '20px', fontWeight: 600, color: '#E6E9E7' }}>{liveStats.emissions > 0 ? liveStats.emissions.toFixed(2) : "0.00"} <span style={{ fontSize: '12px', color: '#8D9390' }}>MtCO₂e</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222524', paddingTop: '12px' }}>
                            <span style={{ color: '#8D9390', fontSize: '13px', fontWeight: 500 }}>Estimated Expenditure</span>
                            <span style={{ fontSize: '20px', fontWeight: 600, color: '#A0AEC0' }}>₹{liveStats.spend > 0 ? liveStats.spend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}</span>
                        </div>
                    </div>
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#E6E9E7', color: '#111211', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '24px' }}>Save Record</button>
                </form>
            </div>

            <div style={{ flex: 1, backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#8D9390', letterSpacing: '0.08em', marginTop: 0, marginBottom: '16px' }}>RECORDS</h3>
                {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                        <p style={{ color: '#8D9390', fontSize: '13px', margin: 0 }}>No records yet — add one on the left.</p>
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {records.map(r => {
                            const rT = (((r.naturalGas || 0) * 5.3 + (r.fleetFuel || 0) * 8.887 + (r.refrigerants || 0) * 1430) + ((r.electricity || 0) * 0.385 + (r.purchasedSteam || 0) * 52) + ((r.businessTravel || 0) * 0.25 + (r.waste || 0) * 600 + (r.supplyChain || 0) * 0.35)) / 1000;
                            return (
                                <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111211', padding: '12px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #222524' }}>
                                    <div>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#E6E9E7', display: 'block' }}>{r.month}</span>
                                        <span style={{ fontSize: '12px', color: '#8D9390' }}>{rT.toFixed(2)} MtCO₂e</span>
                                    </div>
                                    <button onClick={() => removeRecord(r.id)} style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Delete</button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
