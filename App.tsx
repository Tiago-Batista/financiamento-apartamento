import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomeScreen from './components/HomeScreen';
import DashboardScreen from './components/DashboardScreen';
import DownPaymentScreen from './components/DownPaymentScreen';
import ConstructionProgressScreen from './components/ConstructionProgressScreen';
import CaixaFinancingScreen from './components/CaixaFinancingScreen';
import AiAnalysisScreen from './components/AiAnalysisScreen';
import WelcomeModal from './components/ui/WelcomeModal';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Import ProtectedRoute

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/f-entrada" element={<DownPaymentScreen />} />
            <Route path="/evolucao-obra" element={<ConstructionProgressScreen />} />
            <Route path="/financiamento-caixa" element={<CaixaFinancingScreen />} />
            <Route path="/ai-analysis" element={<AiAnalysisScreen />} />
          </Route>
          
          {/* Catch-all for undefined routes, could redirect to home or a 404 page */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <WelcomeModal />
      </Layout>
    </HashRouter>
  );
};

export default App;