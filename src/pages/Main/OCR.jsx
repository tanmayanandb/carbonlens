import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { useCarbonStore } from '../../store/useCarbonStore.jsx';
import { EMISSION_FACTORS } from '../../utils/emissionsCalc';

export default function OCR() {
    const { addRecord } = useCarbonStore();

    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [fileSrc, setFileSrc] = useState(null);
    const [extractedText, setExtractedText] = useState("");

    const [form, setForm] = useState({
        selMonth: 'Jan',
        selYear: '2026',
        electricity: '',
        naturalGas: '',
        fleetFuel: '',
        businessTravel: '',
        waste: '',
        refrigerants: '',
        monthlySpend: ''
    });

    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileSrc(URL.createObjectURL(file));
        setIsScanning(true);
        setScanProgress(0);
        setExtractedText("");

        Tesseract.recognize(file, 'eng', {
            // PSM 6: assume single uniform block of text (best for bills/invoices)
            tessedit_pageseg_mode: '6',
            logger: m => {
                if (m.status === 'recognizing text') {
                    setScanProgress(Math.round(m.progress * 100));
                }
            }
        }).then(({ data: { text } }) => {
            setExtractedText(text);
            extractData(text);
            setIsScanning(false);
        }).catch(err => {
            console.error(err);
            setIsScanning(false);
        });
    };

    // Normalize common OCR misreads before parsing
    const normalize = (text) => text
        .replace(/\r\n/g, '\n')
        .replace(/[\u2019\u2018]/g, "'")       // smart quotes
        .replace(/\|(?=\s|$)/g, 'I')           // pipe char ONLY when standalone, not letter l
        .replace(/(\d)O(\d)/g, '$10$2')        // digit-O-digit → digit-0-digit (e.g. 1O5 → 105)
        .replace(/([\u20B9]|Rs\.?)\s*/gi, '$1'); // tighten ₹ prefix spacing

    const parseNum = (str) => {
        if (!str) return '';
        // Handle Indian format: remove commas, strip non-numeric except decimal
        const cleaned = str.replace(/,/g, '').replace(/[^0-9.]/g, '');
        const n = parseFloat(cleaned);
        return isNaN(n) ? '' : n;
    };

    const extractData = (text) => {
        const normalized = normalize(text);

        console.log("Raw OCR:", text);
        console.log("Normalized OCR:", normalized);

        // Grid Power (kWh)
        const kwhMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:kwh|kilowatt|units|consumption)/i);

        // Natural Gas (Therms)
        const gasMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:therms?|therm|natural gas|hcf)/i);

        // Fleet Fuel (Gallons)
        const fuelMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:gallons?|gal|liters?|ltr|fuel|petrol|diesel|gasoline)/i);

        // Business Travel (Miles)
        const travelMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:miles?|mi|km|kilometers?|distance)/i);

        // Waste (Tons)
        const wasteMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:tons?|kg|kilograms?|waste|garbage|trash|refuse)/i);

        // Refrigerants (Kg)
        const refrigMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:r-?\d+|refrigerants?|kg|recharge)/i);


        // Financial Cost (₹)
        // Multi-pass regex for Indian currency formats
        const costPatterns = [
            /(?:total|due|amount|payable|net|final|balance)\s*(?:amount|due)?\s*(?:₹|rs\.?|inr)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)/i,
            /(?:₹|rs\.?|inr)\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)\s*(?:total|due|payable|amount)/i,
            /(?:total|due|payable)\s*(?:amount|due)?\s*[:\-\s]*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)/i
        ];

        let extractedCost = null;
        for (const pattern of costPatterns) {
            const match = normalized.match(pattern);
            if (match && match[1]) {
                extractedCost = match[1].replace(/,/g, '');
                break;
            }
        }

        setForm(prev => ({
            ...prev,
            electricity: kwhMatch ? kwhMatch[1] : prev.electricity,
            naturalGas: gasMatch ? gasMatch[1] : prev.naturalGas,
            fleetFuel: fuelMatch ? fuelMatch[1] : prev.fleetFuel,
            businessTravel: travelMatch ? travelMatch[1] : prev.businessTravel,
            waste: wasteMatch ? wasteMatch[1] : prev.waste,
            refrigerants: refrigMatch ? refrigMatch[1] : prev.refrigerants,
            monthlySpend: extractedCost || prev.monthlySpend
        }));
    };


    const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const submitRecord = (e) => {
        e.preventDefault();
        addRecord({ ...form, month: `${form.selYear} ${form.selMonth}` });
        alert("Bill Data Committed to Ledger!");
        setForm(prev => ({ ...prev, naturalGas: '', electricity: '', monthlySpend: '', fleetFuel: '', businessTravel: '', waste: '', refrigerants: '' }));
        setFileSrc(null);
        setExtractedText("");
    };

    const inputStyle = { backgroundColor: '#111211', border: '1px solid #222524', color: '#E6E9E7', padding: '10px', borderRadius: '6px', width: '100%', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };

    return (
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

            {/* Upload and Preview Zone */}
            <div style={{ flex: 1, maxWidth: '440px' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#E6E9E7', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>Scan Invoices</h1>
                    <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>Upload utility bills to automatically extract data.</p>
                </header>

                <div
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        border: '2px dashed #222524', borderRadius: '8px', padding: '40px 20px',
                        textAlign: 'center', cursor: 'pointer', backgroundColor: '#171817', marginBottom: '24px',
                        transition: 'border-color 0.2s ease'
                    }}
                >
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                    {fileSrc ? (
                        <img src={fileSrc} alt="Bill Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} />
                    ) : (
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: '#E6E9E7', fontWeight: 500 }}>Click to Upload Bill (PNG, JPG)</p>
                            <p style={{ margin: 0, color: '#8D9390', fontSize: '12px' }}>Tesseract engine operates entirely locally</p>
                        </div>
                    )}
                </div>

                {isScanning && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8D9390', marginBottom: '8px' }}>
                            <span>Running OCR Engine...</span>
                            <span>{scanProgress}%</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#222524', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                            <div style={{ width: `${scanProgress}%`, backgroundColor: '#E6E9E7', height: '100%', transition: 'width 0.2s' }}></div>
                        </div>
                    </div>
                )}

                {extractedText && (
                    <div style={{ padding: '16px', backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '6px', marginBottom: '24px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#8D9390' }}>Raw Extracted Output</h4>
                        <div style={{ fontSize: '10px', color: '#A0AEC0', maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {extractedText}
                        </div>
                    </div>
                )}
            </div>

            {/* Form Verification Zone */}
            <div style={{ flex: 1, backgroundColor: '#171817', border: '1px solid #222524', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ fontSize: '15px', color: '#E6E9E7', marginTop: 0, marginBottom: '24px' }}>Confirm Scan Results</h3>

                <form onSubmit={submitRecord} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Invoice Month</label>
                            <select name="selMonth" value={form.selMonth} onChange={handleInput} style={inputStyle}>
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Year</label>
                            <select name="selYear" value={form.selYear} onChange={handleInput} style={inputStyle}>
                                {['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ borderLeft: '2px solid #E6E9E7', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Grid Power (kWh)</label>
                            <input type="number" name="electricity" value={form.electricity} onChange={handleInput} placeholder="Auto-fills from bill" style={inputStyle} />
                        </div>

                        <div style={{ borderLeft: '4px solid #A0AEC0', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Natural Gas (Therms)</label>
                            <input type="number" name="naturalGas" value={form.naturalGas} onChange={handleInput} placeholder="Auto-fills from bill" style={inputStyle} />
                        </div>

                        <div style={{ borderLeft: '2px solid #3CA677', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Fleet Fuel (Gal)</label>
                            <input type="number" name="fleetFuel" value={form.fleetFuel} onChange={handleInput} placeholder="..." style={inputStyle} />
                        </div>

                        <div style={{ borderLeft: '2px solid #4A90E2', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Business Travel (Miles)</label>
                            <input type="number" name="businessTravel" value={form.businessTravel} onChange={handleInput} placeholder="..." style={inputStyle} />
                        </div>

                        <div style={{ borderLeft: '2px solid #F5A623', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Waste (Tons)</label>
                            <input type="number" name="waste" value={form.waste} onChange={handleInput} placeholder="..." style={inputStyle} />
                        </div>

                        <div style={{ borderLeft: '2px solid #D0021B', paddingLeft: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Refrigerants (Kg)</label>
                            <input type="number" name="refrigerants" value={form.refrigerants} onChange={handleInput} placeholder="..." style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #222524', paddingTop: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Consolidated Bill Amount (₹)</label>
                        <input type="number" name="monthlySpend" value={form.monthlySpend} onChange={handleInput} placeholder="Auto-fills total amount" style={{ ...inputStyle, fontWeight: 700, fontSize: '18px', color: '#E6E9E7' }} />
                    </div>

                    <button type="submit" disabled={!form.electricity && !form.naturalGas && !form.monthlySpend} style={{ padding: '12px', backgroundColor: form.electricity || form.naturalGas || form.monthlySpend ? '#E6E9E7' : '#222524', color: form.electricity || form.naturalGas || form.monthlySpend ? '#111211' : '#8D9390', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Confirm & Save to Ledger
                    </button>
                </form>
            </div>

        </div>
    )
}
