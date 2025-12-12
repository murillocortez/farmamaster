import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import { TenantRoot } from './components/TenantRoot';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Checkout } from './pages/Checkout';
import { SupportPage } from './pages/SupportPage';
import { CategoryPage } from './pages/CategoryPage';
import { OrderSuccess } from './pages/OrderSuccess';
import { Profile } from './pages/Profile';
import { Orders } from './pages/Orders';
import { Favorites } from './pages/Favorites';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Home as HomeIcon, ShoppingBag, User, WifiOff } from 'lucide-react';
import { useTenant } from './context/TenantContext';

const OfflineAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 sticky top-0 z-50 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <WifiOff size={20} />
        <p className="font-bold text-sm">Você está offline</p>
      </div>
      <p className="text-xs mt-1">Algumas funcionalidades podem não estar disponíveis.</p>
    </div>
  );
};

const BottomNav = () => {
  const { cartCount, setIsCartOpen, isCartOpen, user, setIsLoginModalOpen } = useStore();
  const location = useLocation();
  const { tenant } = useTenant();

  // Paths should probably be relative or include slug? 
  // BottomNav uses relative or absolute?
  // Current app uses HashRouter, so /:slug/...
  // We need to match the current slug. But TenantContext is available.

  const prefix = `/${tenant?.slug}`;
  const isCheckout = location.pathname.includes('/checkout') || location.pathname.includes('/success');

  if (isCheckout) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-40 safe-area-bottom md:hidden">
      <LinkTab to={prefix} icon={<HomeIcon size={24} />} label="Início" active={location.pathname === prefix || location.pathname === `${prefix}/`} />

      <button
        onClick={() => setIsCartOpen(true)}
        className={`flex flex-col items-center gap-1 ${isCartOpen ? 'text-primary' : 'text-gray-400'}`}
      >
        <div className="relative">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Cesta</span>
      </button>

      <button
        onClick={() => user ? window.location.hash = `#${prefix}/profile` : setIsLoginModalOpen(true)}
        className={`flex flex-col items-center gap-1 ${location.pathname.includes('/profile') ? 'text-primary' : 'text-gray-400'}`}
      >
        <User size={24} />
        <span className="text-[10px] font-medium">{user ? 'Perfil' : 'Entrar'}</span>
      </button>
    </nav>
  );
};

const LinkTab = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => (
  <a href={`#${to}`} className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </a>
);

const AppContent = () => {
  const location = useLocation();
  const showHeader = !location.pathname.includes('/checkout') && !location.pathname.includes('/success');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <OfflineAlert />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg z-50">
        Pular para o conteúdo principal
      </a>
      {showHeader && <Header />}

      <main id="main-content" className="mx-auto w-full">
        <Outlet />
        {/* Routes are defined in the wrapper */}
      </main>

      <Footer />
      <CartDrawer />
      <LoginModal />
      <WhatsAppFloatingButton />
      <PWAInstallPrompt />
      <BottomNav />
    </div>
  );
};


const RootRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tenantParam = searchParams.get('tenant');

  // Calculate Subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  let subdomainSlug = '';

  // Logic: slug.domain.com or slug.localhost
  if (parts.length >= 2) {
    const sub = parts[0];
    // Common reserved subdomains or IP check
    const isIgnored = ['www', 'app', 'admin', 'store', 'market', 'api'].includes(sub);
    const isIp = /^[0-9]+$/.test(sub);

    if (!isIgnored && !isIp) {
      subdomainSlug = sub;
    }
  }

  // @ts-ignore
  const defaultTenant = import.meta.env.VITE_DEFAULT_TENANT_SLUG_STORE || 'farma-vida';
  const finalSlug = tenantParam || subdomainSlug || defaultTenant;

  return <Navigate to={`/${finalSlug}`} replace />;
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/:slug" element={<TenantRoot />}>
          <Route element={<AppContent />}>
            <Route index element={<Home />} />
            <Route path="product/:productId" element={<ProductDetails />} />
            <Route path="category/:categoryId" element={<CategoryPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="success" element={<OrderSuccess />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="account/favorites" element={<Favorites />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}