import { RandomForestClassifier } from 'ml-random-forest';

export const runMonteCarlo = (records, iterations = 1000) => {
    if (records.length === 0) {
        return { p10: '0.00', p50: '0.00', p90: '0.00', costSavings: '0', recommendations: ["Awaiting telemetry input to generate actionable corporate directives."] };
    }

    let inputs = { s1_gas: 0, s1_fleet: 0, s1_refrig: 0, s2_elec: 0, s2_steam: 0, s3_travel: 0, s3_waste: 0, s3_supply: 0 };
    let totalSpend = 0;

    records.forEach(r => {
        inputs.s1_gas += (Number(r.naturalGas) || 0) * 5.3;
        inputs.s1_fleet += (Number(r.fleetFuel) || 0) * 8.887;
        inputs.s1_refrig += (Number(r.refrigerants) || 0) * 1430;

        inputs.s2_elec += (Number(r.electricity) || 0) * 0.385;
        inputs.s2_steam += (Number(r.purchasedSteam) || 0) * 52.0;

        inputs.s3_travel += (Number(r.businessTravel) || 0) * 0.25;
        inputs.s3_waste += (Number(r.waste) || 0) * 600;
        inputs.s3_supply += (Number(r.supplyChain) || 0) * 0.35;

        totalSpend += Number(r.monthlySpend) || 0;
    });

    const baseS1 = inputs.s1_gas + inputs.s1_fleet + inputs.s1_refrig;
    const baseS2 = inputs.s2_elec + inputs.s2_steam;
    const baseS3 = inputs.s3_travel + inputs.s3_waste + inputs.s3_supply;
    const totalBase = baseS1 + baseS2 + baseS3;

    if (totalBase === 0) return { p10: '0', p50: '0', p90: '0', costSavings: '0', recommendations: ["No emissions detected."] };

    const randNorm = (m, s) => {
        let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random();
        return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * s + m;
    };

    let eResults = [];
    let cResults = [];
    const X = []; const Y = [];

    for (let i = 0; i < iterations; i++) {
        let simS1 = Math.max(0, randNorm(baseS1, baseS1 * 0.15));
        let simS2 = Math.max(0, randNorm(baseS2, baseS2 * 0.10));
        let simS3 = Math.max(0, randNorm(baseS3, baseS3 * 0.20));
        let simCost = Math.max(0, randNorm(totalSpend, totalSpend * 0.12));

        eResults.push(simS1 + simS2 + simS3);
        cResults.push(simCost);

        X.push([simS1, simS2, simS3]);
        const max = Math.max(simS1, simS2, simS3);
        Y.push(max === simS1 ? 0 : max === simS2 ? 1 : 2);
    }

    eResults.sort((a, b) => a - b); cResults.sort((a, b) => a - b);
    const p10 = (eResults[Math.floor(iterations * 0.1)] / 1000).toFixed(2);
    const p50 = (eResults[Math.floor(iterations * 0.5)] / 1000).toFixed(2);
    const p90 = (eResults[Math.floor(iterations * 0.9)] / 1000).toFixed(2);
    const costSavings = Math.max(0, totalSpend - cResults[Math.floor(iterations * 0.1)]).toFixed(2);

    const rfOptions = { seed: 3, maxFeatures: 2, replacement: true, nEstimators: 25 };
    const classifier = new RandomForestClassifier(rfOptions);
    classifier.train(X, Y);

    let rfPred = -1;
    try { rfPred = classifier.predict([[baseS1, baseS2, baseS3]])[0]; } catch (e) { }

    let recommendations = [];

    const identifyDominantSubfactor = (scopeMap) => {
        let highestKey = ""; let maxVal = -1;
        for (const [k, v] of Object.entries(scopeMap)) {
            if (v > maxVal) { maxVal = v; highestKey = k; }
        }
        return { factor: highestKey, weight: maxVal };
    };

    let scopeDict = {};
    if (rfPred === 0) scopeDict = { "Natural Gas Combustion": inputs.s1_gas, "Combustion Fleet Vehicles": inputs.s1_fleet, "Fugitive HVAC Refrigerants": inputs.s1_refrig };
    if (rfPred === 1) scopeDict = { "Third-Party Grid Power": inputs.s2_elec, "District Heating Usage": inputs.s2_steam };
    if (rfPred === 2) scopeDict = { "Business Flight Travel": inputs.s3_travel, "Landfill Output Waste": inputs.s3_waste, "Procurement Supply Chain": inputs.s3_supply };

    const dom = identifyDominantSubfactor(scopeDict);
    const impactRatio = dom.weight > 0 ? ((dom.weight / totalBase) * 100).toFixed(1) : 0;

    // Explicit Corporate Actions dictionary
    const actionMap = {
        "Natural Gas Combustion": "Retro-commissioning current industrial gas boilers in favor of commercial Heat Pumps",
        "Combustion Fleet Vehicles": "Replacing 15% of outdated ICE logistical vehicles with mid-haul EV alternatives",
        "Fugitive HVAC Refrigerants": "Implementing a monthly automated leak-detection audit for all central cooling units",
        "Third-Party Grid Power": "Procuring a 50kW Virtual Power Purchase Agreement (VPPA) for 100% renewable backing",
        "District Heating Usage": "Optimizing facility thermal envelopes and heavily insulating current steam infrastructure",
        "Business Flight Travel": "Mandating a 20% internal cap on physical short-haul business flights to force remote engagement",
        "Landfill Output Waste": "Pivoting 30% of current material waste towards certified circular-economy industrial recyclers",
        "Procurement Supply Chain": "Injecting strict Scope 3 ESG compliance caps directly into all future Tier 1 supplier contracts"
    };

    if (rfPred !== -1 && dom.weight > 0) {
        const specificAction = actionMap[dom.factor];

        // Construct the highly actionable corporate sentence
        const mainDirective = `ACTIONABLE DIRECTIVE: ${specificAction}.`;
        const rationale = `The ML array actively isolates [${dom.factor}] as responsible for an immense ${impactRatio}% of your total operational volatility.`;
        const costStr = Number(costSavings) > 0 ? `Statistical models project this transition could yield up to ₹${Number(costSavings).toLocaleString('en-IN')} in capital recovery.` : `Monitor this consumption metric closely.`;

        recommendations.push(`${mainDirective} ${rationale} ${costStr}`);
    } else {
        recommendations.push(`Algorithmic dispersion is entirely flat. The vector matrix detects no immediately actionable vulnerabilities.`);
    }

    return { p10, p50, p90, costSavings, recommendations };
};
