import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../components/layout/MainLayout.css';

const INDUSTRIES = [
    'Manufacturing', 'Energy & Utilities', 'Transport & Logistics',
    'Construction & Real Estate', 'Information Technology', 'Financial Services',
    'Healthcare', 'Retail & Consumer Goods', 'Agriculture', 'Other'
];

const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

export default function Company() {
    const navigate = useNavigate();
    const location = useLocation();
    const isOnboarding = location.pathname.includes('onboarding');

    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem('company_profile');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse company profile:", e);
            }
        }
        return {
            name: '', industry: '', size: '', gstin: '', address: '', reportingYear: new Date().getFullYear()
        };
    });
    const [error, setError] = useState('');

    const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.industry) {
            setError('Company name and industry are required.');
            return;
        }
        localStorage.setItem('company_profile', JSON.stringify(form));
        if (isOnboarding) {
            navigate('/app/dashboard');
        } else {
            alert('Company details updated successfully.');
        }
    };

    const skip = () => navigate('/app/dashboard');

    const inputStyle = {
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        fontSize: 'var(--font-base)',
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        appearance: 'none',
    };

    return (
        <div style={{
            minHeight: isOnboarding ? '100vh' : 'auto',
            backgroundColor: isOnboarding ? 'var(--bg-base)' : 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isOnboarding ? '40px 20px' : '0',
            color: 'var(--text-primary)',
        }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="brand" style={{ justifyContent: 'center', marginBottom: '20px', gap: '12px', fontSize: '22px' }}>
                        <div className="brand-square" style={{ width: '44px', height: '44px' }}>
                            <span className="atomic-number" style={{ fontSize: '8px' }}>6</span>
                            <span className="brand-symbol" style={{ fontSize: '26px' }}>C</span>
                        </div>
                        arbon Lens
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                        Set up your organisation
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                        This information will appear on your compliance reports and PDF audits.
                    </p>
                </header>

                {isOnboarding && (
                    <>
                        {/* Progress indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--bg-base)', flexShrink: 0 }}>✓</div>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
                            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>3</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '40px', letterSpacing: '0.04em' }}>
                            <span>ACCOUNT</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ORGANISATION</span>
                            <span>DASHBOARD</span>
                        </div>
                    </>
                )}

                {/* Form */}
                <div className="card">
                    {error && (
                        <div style={{ backgroundColor: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', color: '#E53E3E', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div>
                            <label className="field-label">Company Name *</label>
                            <input
                                name="name" value={form.name} onChange={handleInput}
                                placeholder="e.g. Acme Industries Ltd."
                                style={inputStyle} autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label className="field-label">Industry *</label>
                                <select name="industry" value={form.industry} onChange={handleInput} style={inputStyle}>
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="field-label">Employees</label>
                                <select name="size" value={form.size} onChange={handleInput} style={inputStyle}>
                                    <option value="">Select size</option>
                                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="field-label">GSTIN (optional)</label>
                            <input
                                name="gstin" value={form.gstin} onChange={handleInput}
                                placeholder="22AAAAA0000A1Z5"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="field-label">Registered Address (optional)</label>
                            <input
                                name="address" value={form.address} onChange={handleInput}
                                placeholder="City, State, Country"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label className="field-label">Reporting Year</label>
                            <select name="reportingYear" value={form.reportingYear} onChange={handleInput} style={inputStyle}>
                                {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                                {isOnboarding ? 'Save & Continue' : 'Update Company Details'}
                            </button>
                            {isOnboarding && (
                                <button type="button" onClick={skip} style={{
                                    background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)',
                                    padding: '12px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px',
                                    fontFamily: 'inherit', cursor: 'pointer'
                                }}>
                                    Skip
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '24px' }}>
                    You can update these details anytime from your profile settings.
                </p>
            </div>
        </div>
    );
}
