import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CarbonProvider } from './store/useCarbonStore.jsx';
import { supabase } from './utils/supabaseClient';
import './App.css';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Auth/Login';
import Company from './pages/Onboarding/Company';
import Dashboard from './pages/Main/Dashboard';
import DataEntry from './pages/Main/DataEntry';
import OCR from './pages/Main/OCR';
import Insights from './pages/Main/Insights';
import Compliance from './pages/Main/Compliance';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#111211', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E6E9E7' }}>
        <div style={{ fontSize: '14px', letterSpacing: '0.1em', fontWeight: 600 }}>SYNCHING AUTH PROTOCOL...</div>
      </div>
    );
  }

  return (
    <CarbonProvider>
      <Router>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/app/dashboard" replace />} />
          <Route path="/onboarding" element={session ? <Company /> : <Navigate to="/login" replace />} />

          <Route path="/app" element={session ? <MainLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="ocr" element={<OCR />} />
            <Route path="insights" element={<Insights />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="profile" element={<Company />} />
          </Route>

          <Route path="*" element={<Navigate to={session ? "/app/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </CarbonProvider>
  );
}

export default App;
