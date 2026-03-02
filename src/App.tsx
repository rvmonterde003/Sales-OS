import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import OpportunityDetail from './pages/OpportunityDetail';
import RiskFlags from './pages/RiskFlags';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:id" element={<ContactDetail />} />
          <Route path="/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/risk-flags" element={<RiskFlags />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
