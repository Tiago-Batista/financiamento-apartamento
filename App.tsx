

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomeScreen from './components/HomeScreen';
import DashboardScreen from './components/DashboardScreen';
import DownPaymentScreen from './components/DownPaymentScreen';
import ConstructionProgressScreen from './components/ConstructionProgressScreen';
import CaixaFinancingScreen from './components/CaixaFinancingScreen';
import AiAnalysisScreen from './components/AiAnalysisScreen'; // Changed from { AiAnalysisScreen } if it was named
import WelcomeModal from './components/ui/WelcomeModal'; // Import WelcomeModal

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/f-entrada" element={<DownPaymentScreen />} />
          <Route path="/evolucao-obra" element={<ConstructionProgressScreen />} />
          <Route path="/financiamento-caixa" element={<CaixaFinancingScreen />} />
          <Route path="/ai-analysis" element={<AiAnalysisScreen />} />
        </Routes>
        <WelcomeModal /> {/* Add WelcomeModal here */}
      </Layout>
    </HashRouter>
  );
};

export default App;