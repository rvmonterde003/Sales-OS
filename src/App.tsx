import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import OpportunityDetail from './pages/OpportunityDetail';
import ActivitiesPage from './pages/ActivitiesPage';
import RiskFlags from './pages/RiskFlags';
import RevenueTimeline from './pages/RevenueTimeline';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[13px] text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/revenue" element={<RevenueTimeline />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/opportunities/:id" element={<OpportunityDetail />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/risk-flags" element={<RiskFlags />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
