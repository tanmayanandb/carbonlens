import { useState, useEffect } from 'react';
import { useCarbonStore } from '../../store/useCarbonStore.jsx';

export default function Insights() {
    const { totals, monteCarlo } = useCarbonStore();

    // Local storage binding for API Key persistence
    const [apiKey, setApiKey] = useState("");
    const [isEditingKey, setIsEditingKey] = useState(true);

    // AI Generation States
    const [aiResponse, setAiResponse] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
            setIsEditingKey(false);
        }
    }, []);

    const saveKey = () => {
        if (!apiKey.trim()) return;
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setIsEditingKey(false);
    };


    const generateAIStrategy = async () => {
        if (!apiKey) return alert("Please input a valid Gemini API Key first.");
        if (!totals || totals.emissions === 0) return alert("Insufficient data. Input parameters in Data Entry first.");

        setIsGenerating(true);
        setAiResponse("Consulting Gemini AI for strategic recommendations...");

        const prompt = `Act as an ESG Capital Consultant for a CFO. 
    DATA: Emissions: ${totals.emissions.toFixed(2)} MtCO2e | Spend: ₹${totals.cost.toLocaleString('en-IN')} | P90 Risk: ${monteCarlo.p90} | ML Audit: ${monteCarlo.recommendations ? monteCarlo.recommendations[0] : "Stable"}.
    DIRECTIVE: Provide a ultra-concise, 1-paragraph tactical solution. Cut the fluff. Identify the SINGLE highest-impact capital project to mitigate this specific ML-diagnosed volatility. Focus on ROI and immediate physical implementation steps. Use professional, dense financial prose. No headers.`;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            const data = await res.json();

            if (data.error) {
                setAiResponse(`API Warning: ${data.error.message}`);
                setIsEditingKey(true);
            } else {
                const text = data.candidates[0].content.parts[0].text;
                setAiResponse(text);
            }
        } catch (err) {
            console.error(err);
            setAiResponse("Network failure. Verify your api key or connection.");
        } finally {
            setIsGenerating(false);
        }
    };

    const cardStyle = { backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '8px', padding: '28px', marginBottom: '24px' };
    const inputStyle = { backgroundColor: '#111211', border: '1px solid #222524', color: '#E6E9E7', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '300px' };

    return (
        <div>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#E6E9E7', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                    Emissions Projections
                </h1>
                <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>
                    AI-driven risk analysis and emissions forecasting.
                </p>
            </header>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ ...cardStyle, flex: 1, minWidth: '200px' }}>
                    <div style={{ color: '#8D9390', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>P90 MAX RISK</div>
                    <div style={{ fontSize: '28px', color: '#E6E9E7', fontWeight: 600 }}>{monteCarlo.p90 || "0.00"} <span style={{ fontSize: '13px', color: '#8D9390' }}>MtCO₂e</span></div>
                </div>
                <div style={{ ...cardStyle, flex: 1, minWidth: '200px' }}>
                    <div style={{ color: '#8D9390', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>P50 BASELINE</div>
                    <div style={{ fontSize: '28px', color: '#E6E9E7', fontWeight: 600 }}>{monteCarlo.p50 || "0.00"} <span style={{ fontSize: '13px', color: '#8D9390' }}>MtCO₂e</span></div>
                </div>
                <div style={{ ...cardStyle, flex: 1, minWidth: '200px' }}>
                    <div style={{ color: '#8D9390', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>FORECASTED RISK VARIANCE</div>
                    <div style={{ fontSize: '28px', color: '#E6E9E7', fontWeight: 600 }}>
                        <span style={{ fontSize: '20px' }}>₹</span>{monteCarlo.costSavings ? Number(monteCarlo.costSavings).toLocaleString('en-IN') : '0'}
                    </div>
                </div>
            </div>

            <div style={cardStyle}>
                <h3 style={{ fontSize: '15px', color: '#E6E9E7', marginTop: 0, marginBottom: '16px' }}>Identified Risk Factors</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#E6E9E7', lineHeight: 1.6, fontSize: '14px' }}>
                    {monteCarlo.recommendations ? monteCarlo.recommendations.map((rec, i) => (
                        <li key={i} style={{ marginBottom: '12px' }}>{rec}</li>
                    )) : <li style={{ color: '#8D9390' }}>No classification data.</li>}
                </ul>
            </div>

            {/* Cloud Generation Matrix (Gemini API Integration) */}
            <div style={{ ...cardStyle, padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', color: '#E6E9E7', marginTop: 0, marginBottom: '6px', fontWeight: 600 }}>Strategic Recommendations</h3>
                        <p style={{ color: '#8D9390', margin: 0, fontSize: '13px' }}>Leverage Gemini AI to generate custom reduction strategies based on your data.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {isEditingKey ? (
                            <>
                                <input type="password" placeholder="Paste Free Gemini API Key here" value={apiKey} onChange={e => setApiKey(e.target.value)} style={inputStyle} />
                                <button onClick={saveKey} style={{ backgroundColor: '#E6E9E7', color: '#111211', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>Save Key</button>
                            </>
                        ) : (
                            <>
                                <span style={{ fontSize: '12px', color: '#E6E9E7', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '4px' }}>API Key Secured</span>
                                <button onClick={() => setIsEditingKey(true)} style={{ background: 'none', border: 'none', color: '#8D9390', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>Edit Key</button>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={generateAIStrategy}
                    disabled={isGenerating || isEditingKey}
                    style={{ padding: '16px', backgroundColor: isGenerating ? '#222524' : '#E6E9E7', color: '#111211', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: isGenerating || isEditingKey ? 'not-allowed' : 'pointer', fontSize: '14px', transition: 'all 0.2s', width: '100%', maxWidth: '280px', marginBottom: '24px' }}
                >
                    {isGenerating ? "Analyzing data..." : "Generate Strategy"}
                </button>

                {aiResponse && (
                    <div style={{ backgroundColor: '#111211', border: '1px solid #222524', padding: '24px', borderRadius: '6px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-10px', left: '20px', backgroundColor: '#E6E9E7', color: '#111211', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.05em' }}>
                            GEMINI 2.5 FLASH OUTPUT
                        </div>
                        <div style={{ color: '#E6E9E7', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: aiResponse.includes('models/') ? 'monospace' : 'inherit' }}>
                            {aiResponse}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
