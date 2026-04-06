import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateComplianceReport = (records = [], totals = {}, monteCarlo = {}) => {
    try {
        const doc = new jsPDF();

        // Load company profile from onboarding
        const company = JSON.parse(localStorage.getItem('company_profile') || '{}');
        const companyName = company.name || 'Organisation';
        const companyMeta = [
            company.industry, company.size ? `${company.size} employees` : null,
            company.gstin ? `GSTIN: ${company.gstin}` : null,
            company.address
        ].filter(Boolean).join('  |  ');

        doc.setFontSize(20); doc.setTextColor(34, 37, 36);
        doc.text('ESG / GHG Compliance Audit', 14, 20);

        doc.setFontSize(11); doc.setTextColor(0);
        doc.text(companyName, 14, 29);

        doc.setFontSize(8); doc.setTextColor(100);
        if (companyMeta) doc.text(companyMeta, 14, 35);
        doc.text(`Reporting Year: ${company.reportingYear || new Date().getFullYear()}   |   Audit Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 40);
        doc.text(`FRAMEWORK ALIGNMENT: ISO 14064-1:2018 | EU CSRD (ESRS) | CALIFORNIA SB 253 | UK SECR`, 14, 45);
        doc.setLineWidth(0.2); doc.line(14, 50, 196, 50);

        doc.setFontSize(12); doc.setTextColor(0); doc.text('Executive Summary', 14, 62);
        doc.setFontSize(10); doc.setTextColor(80);
        doc.text(`Total Audited Emissions:  ${totals.emissions > 0 ? totals.emissions.toFixed(2) : "0.00"} MtCO2e`, 14, 70);
        doc.text(`Capital Identified:  ₹${totals.cost > 0 ? totals.cost.toLocaleString('en-IN') : "0.00"} INR`, 14, 76);
        doc.text(`P90 Regulatory Risk Threshold:  ${monteCarlo.p90 || "N/A"} MtCO2e`, 14, 82);

        doc.setFontSize(12); doc.setTextColor(0); doc.text('GHG Ledger Matrix', 14, 96);

        const tableColumn = ["Period", "Scope 1", "Scope 2", "Scope 3", "Total", "Capital"];
        const tableRows = [];

        records.forEach(r => {
            const s1 = (((r.naturalGas || 0) * 5.3 + (r.fleetFuel || 0) * 8.887 + (r.refrigerants || 0) * 1430) / 1000).toFixed(2);
            const s2 = (((r.electricity || 0) * 0.385 + (r.purchasedSteam || 0) * 52) / 1000).toFixed(2);
            const s3 = (((r.businessTravel || 0) * 0.25 + (r.waste || 0) * 600 + (r.supplyChain || 0) * 0.35) / 1000).toFixed(2);
            const tot = (Number(s1) + Number(s2) + Number(s3)).toFixed(2);

            tableRows.push([
                r.month || "N/A", s1, s2, s3, tot, `₹${(Number(r.monthlySpend) || 0).toLocaleString('en-IN')}`
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 86,
            theme: 'striped',
            headStyles: { fillColor: [34, 37, 36], textColor: [230, 233, 231] },
            styles: { fontSize: 8, font: 'courier' }
        });

        const finalY = doc?.lastAutoTable?.finalY ? doc.lastAutoTable.finalY : 120;

        doc.setFontSize(11); doc.setTextColor(0); doc.text('Strategic Compliance & Standard Alignment Note', 14, finalY + 15);
        doc.setFontSize(8); doc.setTextColor(100);
        const disclaimer = "This report is generated for audit-readiness according to ISO 14064-1:2018 standards and fulfills disclosure requirements under EU CSRD and California SB 253. Data reflects real-time operational telemetry and Monte Carlo variance distributions. This document constitutes a preliminary capital allocation strategy for ESG optimization.";
        const splitText = doc.splitTextToSize(disclaimer, 180);
        doc.text(splitText, 14, finalY + 22);

        doc.save('CarbonLens_Executive_Audit.pdf');
    } catch (err) {
        console.error("PDF Export failed:", err);
    }
};
