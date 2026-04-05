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
        selMonth: 'Jan', selYear: '2024',
        naturalGas: '', electricity: '', monthlySpend: '',
        fleetFuel: '', refrigerants: '', purchasedSteam: '',
        businessTravel: '', waste: '', supplyChain: ''
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

    const extractData = (rawText) => {
        const text = normalize(rawText);
        // Log for debugging — check browser console if OCR misses a field
        console.group('OCR Extract');
        console.log('Raw:', rawText);
        console.log('Normalized:', text);

        // ── ELECTRICITY (kWh) ──────────────────────────────────────────────
        const kwhMatch =
            text.match(/([0-9,]+(?:\.[0-9]+)?)\s*(?:kWh|KWH|kwh|kilowatt.?hours?)/i) ||
            text.match(/(?:electricity|electric|energy)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i) ||
            text.match(/(?:usage|consumption)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:kWh)?/i);

        // ── NATURAL GAS (Therms / MCF / CCF) ─────────────────────────────
        const gasMatch =
            text.match(/([0-9,]+(?:\.[0-9]+)?)\s*(?:Therms?|thm|CCF|MCF)/i) ||
            text.match(/(?:natural gas|gas usage)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i);

        // ── FLEET FUEL (Gallons) ─────────────────────────────────────────
        const fuelMatch =
            text.match(/([0-9,]+(?:\.[0-9]+)?)\s*(?:gallons?|gal|liters?|litres?)/i) ||
            text.match(/(?:fuel|diesel|petrol)\s*[:\-]?\s*([0-9,]+(?:\.[0-9]+)?)/i);

        // ── TOTAL AMOUNT ─────────────────────────────────────────────────
        // Try specific label matches first, then fallback to largest dollar amount
        // ── TOTAL AMOUNT (₹ / Rs. / INR / plain number) ──────────────────
        // Indian bills use ₹, Rs., Rs , INR, and Indian comma format (1,23,456.00)
        const currencyPrefix = /(?:₹|Rs\.?|INR)\s*/i;
        const amountPattern = /[0-9,]+(?:\.[0-9]{1,2})?/;

        const costPrimary =
            // labelled total with currency prefix
            text.match(new RegExp(`(?:total amount due|amount due|total due|please pay|pay this amount|net payable|bill amount)\\s*[:\\-]?\\s*(?:₹|Rs\\.?|INR)?\\s*([0-9][0-9,]*(?:\\.[0-9]{1,2})?)`, 'i')) ||
            // generic "total" / "grand total" label
            text.match(new RegExp(`(?:total|grand total|balance due|amount payable)\\s*[:\\-]?\\s*(?:₹|Rs\\.?|INR)?\\s*([0-9][0-9,]*(?:\\.[0-9]{1,2})?)`, 'i')) ||
            // currency symbol immediately followed by number
            text.match(/(?:₹|Rs\.?|\$)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/);

        // If multiple dollar amounts exist, pick the largest (most likely the total)
        let parsedSpend = '';
        if (costPrimary) {
            parsedSpend = String(parseNum(costPrimary[1]));
        } else {
            // Fallback: collect ALL numbers that look like amounts (>= 2 digits, with optional decimal)
            // and pick the largest — on a bill, the largest figure is almost always the total.
            const allAmounts = [...text.matchAll(/(?:₹|Rs\.?|INR)?\s*([0-9][0-9,]*\.[0-9]{1,2})/gi)]
                .map(m => parseNum(m[1]))
                .filter(n => n > 10); // ignore tiny numbers (taxes < ₹10 noise)
            if (allAmounts.length) parsedSpend = String(Math.max(...allAmounts));
        }

        const parsed = {
            electricity: kwhMatch ? String(parseNum(kwhMatch[1])) : '',
            naturalGas: gasMatch ? String(parseNum(gasMatch[1])) : '',
            fleetFuel: fuelMatch ? String(parseNum(fuelMatch[1])) : '',
            monthlySpend: parsedSpend
        };
        console.log('Parsed results:', parsed);
        console.log('costPrimary match:', costPrimary);
        console.groupEnd();

        setForm(prev => ({
            ...prev,
            electricity: parsed.electricity || prev.electricity,
            naturalGas: parsed.naturalGas || prev.naturalGas,
            fleetFuel: parsed.fleetFuel || prev.fleetFuel,
            monthlySpend: parsed.monthlySpend || prev.monthlySpend
        }));
    };


    const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const submitRecord = (e) => {
        e.preventDefault();
        addRecord({ ...form, month: `${form.selYear} ${form.selMonth}` });
        alert("Bill Data Committed to Ledger!");
        setForm(prev => ({ ...prev, naturalGas: '', electricity: '', monthlySpend: '' }));
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

                    <div style={{ borderLeft: '2px solid #E6E9E7', paddingLeft: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Grid Power (kWh)</label>
                        <input type="number" name="electricity" value={form.electricity} onChange={handleInput} placeholder="Auto-fills from bill" style={inputStyle} />
                    </div>

                    <div style={{ borderLeft: '2px solid #A0AEC0', paddingLeft: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Natural Gas (Therms)</label>
                        <input type="number" name="naturalGas" value={form.naturalGas} onChange={handleInput} placeholder="Auto-fills from bill" style={inputStyle} />
                    </div>

                    <div style={{ borderLeft: '2px solid #A0AEC0', paddingLeft: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px' }}>Total Amount Due (₹)</label>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111211', border: '1px solid #222524', borderRadius: '6px', overflow: 'hidden' }}>
                            <span style={{ padding: '10px', backgroundColor: '#171817', color: '#8D9390', fontSize: '13px', borderRight: '1px solid #222524' }}>₹</span>
                            <input type="number" name="monthlySpend" value={form.monthlySpend} onChange={handleInput} placeholder="0.00" style={{ ...inputStyle, border: 'none', borderRadius: 0 }} />
                        </div>
                    </div>

                    <button type="submit" disabled={!form.electricity && !form.naturalGas && !form.monthlySpend} style={{ padding: '12px', backgroundColor: form.electricity || form.naturalGas || form.monthlySpend ? '#E6E9E7' : '#222524', color: form.electricity || form.naturalGas || form.monthlySpend ? '#111211' : '#8D9390', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Confirm & Save to Ledger
                    </button>
                </form>
            </div>

        </div>
    )
}
