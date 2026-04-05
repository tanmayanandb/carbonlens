import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { calculateTotals } from '../utils/emissionsCalc';
import { runMonteCarlo } from '../utils/monteCarlo';

const CarbonContext = createContext();

export const CarbonProvider = ({ children }) => {
    const [records, setRecords] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session ? session.user : null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session ? session.user : null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setRecords([]);
            return;
        }
        fetchRecords();
    }, [user]);

    const fetchRecords = async () => {
        const { data, error } = await supabase
            .from('emissions_records')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Ledger Retrieval Error:', error);
        } else {
            const mappedData = (data || []).map(record => ({
                id: record.id,
                month: record.month,
                naturalGas: record.natural_gas,
                fleetFuel: record.fleet_fuel,
                refrigerants: record.refrigerants,
                electricity: record.electricity,
                purchasedSteam: record.purchased_steam,
                businessTravel: record.business_travel,
                waste: record.waste,
                supplyChain: record.supply_chain,
                monthlySpend: record.monthly_spend
            }));
            setRecords(mappedData);
        }
    };

    const addRecord = async (newRecord) => {
        if (!user) return;

        // Map camelCase JS keys to snake_case DB columns
        const dbPayload = {
            user_id: user.id,
            month: newRecord.month,
            natural_gas: Number(newRecord.naturalGas) || 0,
            fleet_fuel: Number(newRecord.fleetFuel) || 0,
            refrigerants: Number(newRecord.refrigerants) || 0,
            electricity: Number(newRecord.electricity) || 0,
            purchased_steam: Number(newRecord.purchasedSteam) || 0,
            business_travel: Number(newRecord.businessTravel) || 0,
            waste: Number(newRecord.waste) || 0,
            supply_chain: Number(newRecord.supplyChain) || 0,
            monthly_spend: Number(newRecord.monthlySpend) || 0
        };

        const { data, error } = await supabase
            .from('emissions_records')
            .insert([dbPayload])
            .select();

        if (error) {
            alert('Cloud Committal Failed: ' + error.message);
        } else {
            // Map back to camelCase for local state consistency
            const record = data[0];
            const mappedRecord = {
                id: record.id,
                month: record.month,
                naturalGas: record.natural_gas,
                fleetFuel: record.fleet_fuel,
                refrigerants: record.refrigerants,
                electricity: record.electricity,
                purchasedSteam: record.purchased_steam,
                businessTravel: record.business_travel,
                waste: record.waste,
                supplyChain: record.supply_chain,
                monthlySpend: record.monthly_spend
            };
            setRecords(prev => [...prev, mappedRecord]);
        }
    };

    const removeRecord = async (id) => {
        if (!user) return;
        const { error } = await supabase
            .from('emissions_records')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Ledger Deletion Error: ' + error.message);
        } else {
            setRecords(prev => prev.filter(r => r.id !== id));
        }
    };

    const totals = useMemo(() => calculateTotals(records), [records]);
    const monteCarlo = useMemo(() => runMonteCarlo(records), [records]);

    return (
        <CarbonContext.Provider value={{ records, addRecord, removeRecord, totals, monteCarlo }}>
            {children}
        </CarbonContext.Provider>
    );
};

export const useCarbonStore = () => {
    const context = useContext(CarbonContext);
    if (!context) throw new Error('useCarbonStore must be within CarbonProvider');
    return context;
};
