// Standard GHG Protocol Emission Factors (EPA / DEFRA Proxies)
export const EMISSION_FACTORS = {
    // Scope 1 (Direct Operations)
    naturalGasTherms: 5.3,      // kg CO2e per Therm (Stationary Combustion)
    fleetFuelGal: 8.887,        // kg CO2e per Gallon (Mobile Combustion)
    refrigerantsKg: 1430,       // kg CO2e per kg (R-134a proxy for fugitive leaks)

    // Scope 2 (Purchased Energy)
    electricityKwh: 0.385,      // kg CO2e per kWh (Grid avg)
    purchasedSteamMmbtu: 52.0,  // kg CO2e per MMBtu (District heating)

    // Scope 3 (Value Chain)
    businessTravelMiles: 0.25,  // kg CO2e per passenger mile (Flights)
    wasteTons: 600,             // kg CO2e per short ton of landfill waste
    supplyChainSpend: 0.35      // kg CO2e per $1 USD spent on procured goods
};

// Standard Cost Proxies (Global Averages)
export const COST_FACTORS = {
    naturalGas: 1.18,       // $ per Therm
    fleetFuel: 4.25,        // $ per Gallon
    electricity: 0.165,     // $ per kWh
    businessTravel: 0.42,   // $ per passenger mile
    waste: 110.00           // $ per ton
};

export const calculateTotals = (records) => {
    let totalCost = 0;
    let scope1 = 0, scope2 = 0, scope3 = 0;
    let monthlyMap = {};

    records.forEach(r => {
        // Carbon Calc
        const s1 = ((Number(r.naturalGas) || 0) * EMISSION_FACTORS.naturalGasTherms) +
            ((Number(r.fleetFuel) || 0) * EMISSION_FACTORS.fleetFuelGal) +
            ((Number(r.refrigerants) || 0) * EMISSION_FACTORS.refrigerantsKg);

        const s2 = ((Number(r.electricity) || 0) * EMISSION_FACTORS.electricityKwh) +
            ((Number(r.purchasedSteam) || 0) * EMISSION_FACTORS.purchasedSteamMmbtu);

        const s3 = ((Number(r.businessTravel) || 0) * EMISSION_FACTORS.businessTravelMiles) +
            ((Number(r.waste) || 0) * EMISSION_FACTORS.wasteTons) +
            ((Number(r.supplyChain) || 0) * EMISSION_FACTORS.supplyChainSpend);

        // Calculated Financial Spend (Sum of Unit-based costs)
        const calcSpend =
            ((Number(r.naturalGas) || 0) * COST_FACTORS.naturalGas) +
            ((Number(r.fleetFuel) || 0) * COST_FACTORS.fleetFuel) +
            ((Number(r.electricity) || 0) * COST_FACTORS.electricity) +
            ((Number(r.businessTravel) || 0) * COST_FACTORS.businessTravel) +
            ((Number(r.waste) || 0) * COST_FACTORS.waste) +
            (Number(r.supplyChain) || 0); // Supply chain is already spend

        scope1 += s1;
        scope2 += s2;
        scope3 += s3;

        // Use manual spend if provided, otherwise fallback to calculated
        totalCost += (Number(r.monthlySpend) || calcSpend);

        // Monthly Data Aggregation
        const monthKey = r.month || "Unknown";
        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { name: monthKey, Scope1: 0, Scope2: 0, Scope3: 0, Total: 0 };
        }
        monthlyMap[monthKey].Scope1 += s1 / 1000;
        monthlyMap[monthKey].Scope2 += s2 / 1000;
        monthlyMap[monthKey].Scope3 += s3 / 1000;
        monthlyMap[monthKey].Total += (s1 + s2 + s3) / 1000;
    });

    const monthOrder = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };

    const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const partsA = a.name.split(" ");
        const partsB = b.name.split(" ");
        if (partsA[0] !== partsB[0]) return partsA[0].localeCompare(partsB[0]);
        return monthOrder[partsA[1]] - monthOrder[partsB[1]];
    });

    return {
        emissions: (scope1 + scope2 + scope3) / 1000,
        scope1: scope1 / 1000,
        scope2: scope2 / 1000,
        scope3: scope3 / 1000,
        cost: totalCost,
        monthlyData
    };
};
