import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import '../../components/layout/MainLayout.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.session) navigate('/app/dashboard');
                else alert('Account registered. Please login (verification may be required unless disabled in Supabase Dashboard).');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/app/dashboard');
            }
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        backgroundColor: '#111211',
        border: '1px solid #222524',
        color: '#E6E9E7',
        padding: '12px 16px',
        borderRadius: '6px',
        width: '100%',
        fontSize: '14px',
        outline: 'none',
        marginBottom: '16px',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#111211',
            color: '#E6E9E7',
            padding: '20px'
        }}>
            <div style={{ width: '100%', maxWidth: '360px' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="brand" style={{ marginBottom: '16px', gap: '14px', fontSize: '32px' }}>
                        <div className="brand-square" style={{ width: '60px', height: '60px' }}>
                            <span className="atomic-number" style={{ fontSize: '10px' }}>6</span>
                            <span className="brand-symbol" style={{ fontSize: '36px' }}>C</span>
                        </div>
                        arbon Lens
                    </div>
                    <p style={{ color: '#8D9390', margin: 0, fontSize: '14px' }}>
                        {isSignUp ? 'Create enterprise-grade audit account' : 'Enterprise Emissions Security Portal'}
                    </p>
                </header>

                <form onSubmit={handleAuth}>
                    {errorMsg && (
                        <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)', color: '#E53E3E', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(229, 62, 62, 0.2)' }}>
                            {errorMsg}
                        </div>
                    )}

                    <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px', fontWeight: 600 }}>CORPORATE EMAIL</label>
                    <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <label style={{ display: 'block', fontSize: '12px', color: '#8D9390', marginBottom: '6px', fontWeight: 600 }}>PASSWORD</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: '#E6E9E7',
                            color: '#111211',
                            border: 'none',
                            padding: '14px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            width: '100%',
                            fontSize: '14px',
                            marginTop: '8px',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing Protocol...' : isSignUp ? 'Initialize Account' : 'Authenticate Credentials'}
                    </button>
                </form>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#8D9390',
                        fontSize: '13px',
                        width: '100%',
                        marginTop: '24px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    {isSignUp ? 'Already registered? Login here' : 'No account? Register corporate portal'}
                </button>
            </div>
        </div>
    )
}
