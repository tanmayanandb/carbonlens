export default function Compliance() {
    const regulations = [
        {
            id: 'SB253',
            name: 'California SB 253',
            jurisdiction: 'United States (California)',
            status: 'Active / Enforceable',
            deadline: 'August 10, 2026',
            summary: 'Mandates disclosure of Scope 1 and 2 emissions for companies >$1B revenue doing business in California. Scope 3 reporting follows in 2027.',
            impact: 'High'
        },
        {
            id: 'CSRD',
            name: 'EU CSRD',
            jurisdiction: 'European Union',
            status: 'Active (Phased)',
            deadline: 'FY 2027 (Reporting 2028)',
            summary: 'Corporate Sustainability Reporting Directive. Requires comprehensive ESG disclosure under ESRS standards. Recent "Omnibus" measures delayed Wave 2 reporting to 2028.',
            impact: 'Critical'
        },
        {
            id: 'SECR',
            name: 'UK SECR',
            jurisdiction: 'United Kingdom',
            status: 'Active',
            deadline: 'Annual Directors Report',
            summary: 'Streamlined Energy and Carbon Reporting. Mandatory for large UK companies to disclose energy use and GHG emissions.',
            impact: 'High'
        },
        {
            id: 'SEC',
            name: 'SEC Climate Rule',
            jurisdiction: 'United States (Federal)',
            status: 'Stalled / Inactive',
            deadline: 'N/A',
            summary: 'Currently subject to a voluntary stay. The SEC ended its legal defense of the 2024 rule in March 2025. Implementation is paused indefinitely.',
            impact: 'Low (Current)'
        }
    ];

    const cardStyle = { backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '8px', padding: '24px', marginBottom: '20px' };
    const badgeStyle = (impact) => ({
        fontSize: '10px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: impact === 'Critical' ? '#E6E9E7' : impact === 'High' ? '#A0AEC0' : '#222524',
        color: '#111211',
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
