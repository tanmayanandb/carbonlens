import { Outlet, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import './MainLayout.css';

const PeriodicIcon = ({ symbol, atomic, active }) => (
    <div style={{
        width: '22px',
        height: '22px',
        backgroundColor: active ? 'var(--accent)' : 'var(--border)',
        border: '1px solid var(--text-primary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderRadius: '1px',
        flexShrink: 0,
        transition: 'background-color 0.15s'
    }}>
        <span style={{ fontSize: '5px', position: 'absolute', top: '1px', left: '2px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1 }}>{atomic}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{symbol}</span>
    </div>
);

export default function MainLayout() {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-square">
                        <span className="atomic-number">6</span>
                        <span className="brand-symbol">C</span>
                    </div>
                    arbon Lens
                </div>

                <nav style={{ flex: 1 }}>
                    <ul className="nav-menu">
                        {[
                            { to: '/app/dashboard', symbol: 'Db', atomic: '105', label: 'Dashboard' },
                            { to: '/app/data-entry', symbol: 'En', atomic: '99', label: 'Data Entry' },
                            { to: '/app/ocr', symbol: 'Sc', atomic: '21', label: 'Scan Invoices' },
                            { to: '/app/insights', symbol: 'Re', atomic: '75', label: 'Recommendations' },
                            { to: '/app/compliance', symbol: 'Cp', atomic: '112', label: 'Compliance' },
                            { to: '/app/profile', symbol: 'Pr', atomic: '59', label: 'Company Profile' },
                        ].map(({ to, symbol, atomic, label }) => (
                            <li key={to}>
                                <NavLink to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                    {({ isActive }) => (
                                        <>
                                            <PeriodicIcon symbol={symbol} atomic={atomic} active={isActive} />
                                            {label}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn-signout" onClick={handleLogout}>
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
