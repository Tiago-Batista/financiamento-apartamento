import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Section from './ui/Section';
import Button from './ui/Button';
import { useAppContext } from '../contexts/AppContext';
import { GOOGLE_CLIENT_ID } from '../../config'; // For rendering the button
import Spinner from './ui/Spinner'; // Corrected path

// Ícones (reutilizados e adaptados)
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const DownPaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const ConstructionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.123 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V9a.75.75 0 01-.75.75H5.25A2.25 2.25 0 013 7.5V5.25A2.25 2.25 0 015.25 3h5.25a2.25 2.25 0 012.25 2.25V7.5m0 0h3.75V5.25A2.25 2.25 0 0016.5 3h-5.25a2.25 2.25 0 00-2.25 2.25V7.5" /></svg>;
const CaixaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>;
const PowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>;

const NavCard: React.FC<{ to: string; title: string; description: string; icon: React.ReactNode }> = ({ to, title, description, icon }) => (
  <Link to={to} className="block hover:no-underline h-full">
    <Card className="text-center hover:shadow-xl transition-shadow duration-200 h-full flex flex-col justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        {icon}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Card>
  </Link>
);

const HomeScreen: React.FC = () => {
  const { state, signInWithGoogle, addNotification } = useAppContext();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.isAuthenticated && !state.isAuthLoading && window.google && googleButtonRef.current) {
      if (googleButtonRef.current.childElementCount === 0) { // Render button only if not already rendered
          try {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              { theme: "outline", size: "large", type: "standard", text: "signin_with" } // Customize as needed
            );
          } catch (e) {
            console.error("Error rendering Google Sign-In button:", e);
            addNotification("Erro ao renderizar botão de login Google.", "error");
          }
      }
    }
  }, [state.isAuthenticated, state.isAuthLoading, addNotification]);

  const handleExitApp = () => {
    if (window.confirm("Tem certeza que deseja tentar fechar a aplicação?")) {
        window.close();
    }
  };

  if (state.isAuthLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-center p-4">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {!state.isAuthenticated ? (
        <Section title="Bem-vindo ao Gerenciador de Financiamento">
          <Card className="text-center">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Para acessar o aplicativo e gerenciar seu financiamento, por favor, faça login com sua conta Google.
              Isso permitirá futuras integrações com o Google Drive para armazenamento seguro de comprovantes e relatórios.
            </p>
            {state.authError && (
                <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">
                    Erro de autenticação: {state.authError}
                </p>
            )}
            <div ref={googleButtonRef} className="flex justify-center my-6">
              {/* Google Sign-In button will be rendered here by GIS */}
            </div>
            <p className="text-xs text-gray-500">
              Ao continuar, você concorda com o uso de cookies e o processamento de dados conforme necessário para a funcionalidade do aplicativo.
            </p>
          </Card>
        </Section>
      ) : (
        <>
          <Section title={`Bem-vindo, ${state.authUser?.name || 'Usuário'}!`}>
            <p className="text-lg text-gray-700 leading-relaxed">
              Você está conectado. Use o menu lateral para navegar pelas seções do aplicativo e gerenciar seu financiamento.
            </p>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button variant="primary" size="lg">Ir para o Dashboard</Button>
              </Link>
            </div>
          </Section>

          <Section title="Acessar Seções Principais">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <NavCard 
                to="/dashboard" 
                title="Dashboard Geral" 
                description="Visão consolidada e configurações globais do seu financiamento." 
                icon={<DashboardIcon />} 
              />
              <NavCard 
                to="/f-entrada" 
                title="F/Entrada" 
                description="Controle os pagamentos referentes à entrada do imóvel." 
                icon={<DownPaymentIcon />} 
              />
              <NavCard 
                to="/evolucao-obra" 
                title="Evolução da Obra" 
                description="Registre e acompanhe os pagamentos da fase de evolução da obra." 
                icon={<ConstructionIcon />} 
              />
              <NavCard 
                to="/financiamento-caixa" 
                title="Financiamento Caixa" 
                description="Gerencie as parcelas e o saldo devedor do seu financiamento com a Caixa." 
                icon={<CaixaIcon />} 
              />
            </div>
          </Section>
        </>
      )}

      <Section title="Opções Adicionais" className="print:hidden">
        <div className="mt-6">
          <Button 
            onClick={handleExitApp} 
            variant="danger" 
            size="md"
            aria-label="Encerrar Aplicação"
            className="flex items-center"
          >
            <PowerIcon />
            Encerrar Aplicação
          </Button>
          <p className="mt-2 text-xs text-gray-500">
            Nota: Por motivos de segurança do navegador, esta opção pode não fechar a aba automaticamente em todas as situações. 
            Se isso ocorrer, por favor, feche a aba manualmente.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default HomeScreen;