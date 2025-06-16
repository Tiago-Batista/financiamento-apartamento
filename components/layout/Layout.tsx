import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
// Removed: import { useGoogleAuth } from '../../contexts/GoogleAuthContext';
import Button from '../ui/Button'; // Assumindo que o componente Button pode ser usado

// Heroicons (Outline)
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M4.5 12.75l.75-7.5A2.25 2.25 0 017.5 3h9a2.25 2.25 0 012.25 2.25l.75 7.5M4.5 12.75V21a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 21V12.75M8.25 21h7.5" /></svg>;
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
const DownPaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const ConstructionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.123 0 1.131.094 1.976 1.057 1.976 2.192V7.5M8.25 7.5h7.5M8.25 7.5V9a.75.75 0 01-.75.75H5.25A2.25 2.25 0 013 7.5V5.25A2.25 2.25 0 015.25 3h5.25a2.25 2.25 0 012.25 2.25V7.5m0 0h3.75V5.25A2.25 2.25 0 0016.5 3h-5.25a2.25 2.25 0 00-2.25 2.25V7.5" /></svg>;
const CaixaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
// Removed: GoogleIcon, LogoutIcon

const navLinks = [
  { to: "/home", text: "Início", icon: <HomeIcon /> },
  { to: "/dashboard", text: "Dashboard", icon: <DashboardIcon /> },
  { to: "/f-entrada", text: "F/Entrada", icon: <DownPaymentIcon /> },
  { to: "/evolucao-obra", text: "Evolução da Obra", icon: <ConstructionIcon /> },
  { to: "/financiamento-caixa", text: "Financiamento Caixa", icon: <CaixaIcon /> },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  // Removed: useGoogleAuth hook and related state variables

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false); // Fecha o menu mobile ao mudar de rota
  }, [location.pathname]);

  const commonLinkClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150";
  const activeLinkClasses = "bg-primary-dark text-white shadow-md";
  const inactiveLinkClasses = "text-gray-200 hover:bg-primary hover:text-white";
  const mobileActiveLinkClasses = "bg-primary text-white";
  const mobileInactiveLinkClasses = "text-gray-700 hover:bg-gray-200";

  const renderNavLinks = (isMobile: boolean) => navLinks.map(link => (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) => 
        `${commonLinkClasses} ${isMobile ? 
            (isActive ? mobileActiveLinkClasses : mobileInactiveLinkClasses) : 
            (isActive ? activeLinkClasses : inactiveLinkClasses)
        }`
      }
      title={link.text}
      aria-current={location.pathname === link.to ? "page" : undefined}
    >
      {link.icon}
      <span className={isMobile ? 'text-base' : 'text-sm'}>{link.text}</span>
    </NavLink>
  ));

  // Removed: AuthButton component

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 print:bg-white">
      {/* Barra Superior Mobile - Oculta na Impressão */}
      <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg fixed top-0 left-0 right-0 z-20 print:hidden">
        <NavLink to="/home" className="text-xl font-bold">
          Financiamento Apt.
        </NavLink>
        <button onClick={toggleMobileMenu} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu">
          {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* Gaveta do Menu Mobile - Oculta na Impressão */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 print:hidden" 
          onClick={toggleMobileMenu}
          role="dialog"
          aria-modal="true"
          id="mobile-menu"
        >
          <nav 
            className="fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-xl p-6 space-y-3 overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()} // Previne fechar ao clicar dentro do menu
          >
            <div className="flex justify-between items-center mb-6">
                <span className="text-primary font-semibold text-lg">Menu</span>
                <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-primary p-1">
                    <XIcon />
                </button>
            </div>
            <div className="flex-grow">
              {renderNavLinks(true)}
            </div>
            {/* Removed AuthButton section for mobile */}
          </nav>
        </div>
      )}

      {/* Barra Lateral Desktop - Oculta na Impressão */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-800 text-white shadow-lg fixed top-0 bottom-0 left-0 z-10 print:hidden overflow-y-auto">
        <div className="px-6 py-4">
          <NavLink to="/home" className="text-2xl font-bold text-white hover:text-primary-light transition-colors">
            Financiamento Apartamento
          </NavLink>
        </div>
        <nav className="flex-grow px-3 py-4 space-y-2">
          {renderNavLinks(false)}
        </nav>
        {/* Removed AuthButton section for desktop */}
         <footer className="p-4 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()}</p>
          </footer>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-grow w-full pt-16 md:pt-0 md:ml-64 print:pt-0 print:ml-0">
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:py-0 print:px-0 print:max-w-full print:mx-0 print:shadow-none">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;