export default function Compliance() {
    const regulations = [
        {
            id: 'BRSR',
            name: 'SEBI BRSR (Core)',
            jurisdiction: 'India',
            status: 'Active (Mandatory)',
            deadline: 'FY 2024-25 onwards',
            summary: 'Business Responsibility and Sustainability Reporting. Mandatory for top 1000 listed entities. BRSR Core introduces 9 key ESG attributes for reasonable assurance.',
            impact: 'Critical'
        },
        {
            id: 'CBAM',
            name: 'EU CBAM',
            jurisdiction: 'European Union / Global',
            status: 'Active (Transitional)',
            deadline: 'January 1, 2026 (Definitive)',
            summary: 'Carbon Border Adjustment Mechanism. Affects exporters of steel, cement, and electricity to the EU. Requires precise embedded emission quantification.',
            impact: 'Critical'
        },
        {
            id: 'CCTS',
            name: 'India CCTS',
            jurisdiction: 'India',
            status: 'Notification Phase',
            deadline: 'FY 2025 (Expected)',
            summary: 'Carbon Credit Trading Scheme. Establishes a domestic compliance market for India. Large emitters will be assigned targets and trade credits.',
            impact: 'High'
        },
        {
            id: 'SB253',
            name: 'California SB 253',
            jurisdiction: 'United States (California)',
            status: 'Active / Enforceable',
            deadline: 'August 10, 2026',
            summary: 'Mandates disclosure of Scope 1 and 2 emissions for companies >$1B revenue doing business in California. Scope 3 follows in 2027.',
            impact: 'High'
        },
        {
            id: 'CSRD',
            name: 'EU CSRD',
            jurisdiction: 'European Union',
            status: 'Active (Phased)',
            deadline: 'FY 2027 (Reporting 2028)',
            summary: 'Corporate Sustainability Reporting Directive. Requires comprehensive ESG disclosure under ESRS standards.',
            impact: 'Critical'
        }
    ];

    const cardStyle = { backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '8px', padding: '24px', marginBottom: '20px' };
    const badgeStyle = (impact) => ({
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: impact === 'Critical' ? 'var(--text-primary)' : impact === 'High' ? 'var(--text-muted)' : 'var(--border)',
        color: 'var(--bg-base)',
        marginLeft: '12px'
    });

    const isoStandards = [
        {
            id: 'ISO14064',
            name: 'ISO 14064-1',
            type: 'Verification Standard',
            status: 'Gold Standard',
            summary: 'The fundamental international framework for GHG quantification and reporting. Essential for audit-ready compliance with CSRD and California mandates.'
        },
        {
            id: 'ISO14001',
            name: 'ISO 14001:2026',
            type: 'Management System',
            status: 'Newly Revised',
            summary: 'Recently updated in early 2026. Focuses on climate resilience, biodiversity, and life-cycle thinking. Organizations now have a 3-year transition period.'
        },
        {
            id: 'ISO50001',
            name: 'ISO 50001:2018',
            type: 'Energy Management',
            status: 'Active',
            summary: 'Systematic approach to improving energy performance. Crucial for heavy industry and meeting EU energy efficiency directives.'
        }
    ];

    return (
        <div>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#E6E9E7', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                    Climate Regulations & Standards
                </h1>
                <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>
                    Track latest carbon reporting requirements and ISO alignment.
                </p>
            </header>

            <section style={{ marginBottom: '48px' }}>
                <h2 style={{ fontSize: '14px', color: '#E6E9E7', letterSpacing: '0.1em', marginBottom: '24px', opacity: 0.8 }}>LEGISLATIVE MANDATES</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    {regulations.map(reg => (
                        <div key={reg.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', color: '#E6E9E7', margin: '0 0 4px 0' }}>{reg.name}</h3>
                                    <span style={{ fontSize: '12px', color: '#8D9390' }}>{reg.jurisdiction}</span>
                                </div>
                                <span style={badgeStyle(reg.impact)}>{reg.impact} IMPACT</span>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', borderTop: '1px solid #222524', paddingTop: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '10px', color: '#8D9390', fontWeight: 600, marginBottom: '4px' }}>STATUS</div>
                                    <div style={{ fontSize: '13px', color: reg.status.includes('Active') ? '#E6E9E7' : '#A0AEC0' }}>{reg.status}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '10px', color: '#8D9390', fontWeight: 600, marginBottom: '4px' }}>NEXT DEADLINE</div>
                                    <div style={{ fontSize: '13px', color: '#E6E9E7' }}>{reg.deadline}</div>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '10px', color: '#8D9390', fontWeight: 600, marginBottom: '4px' }}>EXECUTIVE SUMMARY</div>
                                <p style={{ fontSize: '13px', color: '#E6E9E7', lineHeight: 1.5, margin: 0, opacity: 0.9 }}>{reg.summary}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 style={{ fontSize: '14px', color: '#E6E9E7', letterSpacing: '0.1em', marginBottom: '24px', opacity: 0.8 }}>INTERNATIONAL STANDARDS (ISO)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {isoStandards.map(iso => (
                        <div key={iso.id} style={cardStyle}>
                            <div style={{ fontSize: '18px', fontWeight: 600, color: '#E6E9E7', marginBottom: '4px' }}>{iso.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '11px', color: '#8D9390' }}>{iso.type}</span>
                                <span style={{ fontSize: '11px', color: '#3CA677', fontWeight: 600 }}>{iso.status}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#8D9390', lineHeight: 1.5, margin: 0 }}>{iso.summary}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{ marginTop: '40px', borderTop: '1px solid #222524', paddingTop: '20px' }}>
                <p style={{ color: '#4A5568', fontSize: '11px', fontStyle: 'italic' }}>
                    *Information synthesized via real-time regulatory scours. Businesses should consult legal counsel before executing compliance strategies.
                </p>
            </footer>
        </div>
    );
}
