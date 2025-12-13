import React, { useEffect, useState, useRef } from 'react';
import { Search, MapPin, User as UserIcon, ShoppingBag, ChevronDown, LogOut, Settings, Menu, X, Pill, ArrowRight, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTenant } from '../context/TenantContext'; // Added
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/dbService';
import { Product } from '../types';

export const SearchBar = ({
  mobile = false,
  searchTerm,
  handleSearchChange,
  handleSearchSubmit,
  searchRef,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  setSearchTerm,
  setIsMobileSearchOpen,
  navigate,
  prefix // Added
}: {
  mobile?: boolean;
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  searchRef: React.RefObject<HTMLDivElement>;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  suggestions: Product[];
  setSearchTerm: (term: string) => void;
  setIsMobileSearchOpen: (isOpen: boolean) => void;
  navigate: (path: string) => void;
  prefix: string; // Added
}) => (
  <div className={`relative group ${mobile ? 'w-full' : 'w-full'}`} ref={searchRef}>
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
        placeholder="Buscar medicamentos, cosméticos e muito mais..."
        className={`w-full bg-gray-100 text-gray-900 px-5 py-3 pl-12 rounded-2xl border-2 border-transparent focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all shadow-sm placeholder-gray-500 ${mobile ? 'text-base' : ''}`}
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
      {searchTerm && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => { setSearchTerm(''); setShowSuggestions(false); }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </form>

    {/* Autocomplete Suggestions */}
    {showSuggestions && (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="p-2">
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sugestões</p>
          {suggestions.length > 0 ? (
            suggestions.map(product => (
              <button
                key={product.id}
                onClick={() => {
                  setSearchTerm(product.name);
                  setShowSuggestions(false);
                  setIsMobileSearchOpen(false);
                  navigate(`${prefix}/product/${product.id}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group/item"
              >
                <div className="bg-gray-100 p-2 rounded-lg group-hover/item:bg-white group-hover/item:shadow-sm transition-all">
                  {product.category === 'Medicamentos' ? <Pill size={16} className="text-primary" /> : <ShoppingBag size={16} className="text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{product.category}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover/item:text-primary opacity-0 group-hover/item:opacity-100 transition-all" />
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

export const Header: React.FC = () => {
  const { user, setIsLoginModalOpen, cartCount, setIsCartOpen, logout } = useStore();
  const { tenant } = useTenant(); // Added
  const [settings, setSettings] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Prefix
  const prefix = `/${tenant?.slug || 'farmavida'}`;

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!tenant?.slug) return;

    const fetchData = async () => {
      try {
        const [settingsData, productsData] = await Promise.all([
          db.getSettings(tenant.slug),
          db.getProducts(tenant.slug)
        ]);
        setSettings(settingsData);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tenant?.slug]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 1) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`${prefix}/?q=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleAddressClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      navigate(`${prefix}/profile`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate(prefix);
  };

  const pharmacyName = tenant?.display_name || settings?.pharmacy?.name || 'Farma Vida';
  const logoUrl = tenant?.logo_url || settings?.pharmacy?.logoUrl;
  const primaryColor = settings?.pharmacy?.primaryColor || '#1e40af';


  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Address Section */}
            <div className="flex items-center gap-4 flex-1 lg:flex-none">
              <Link to={prefix} className="flex items-center gap-2 group">
                {logoUrl ? (
                  <img src={logoUrl} alt={pharmacyName} className="h-9 w-9 object-contain rounded-xl bg-gray-50 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="bg-primary/10 p-1.5 rounded-xl group-hover:bg-primary/20 transition-colors" style={{ backgroundColor: `${primaryColor}1a` }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor }}>
                      <span className="text-white font-bold text-xs">{pharmacyName.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                )}
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold leading-none tracking-tight text-gray-900 group-hover:text-primary transition-colors">
                    {pharmacyName}
                  </h1>
                </div>
              </Link>

              {/* Address Button (Desktop) */}
              <button
                onClick={handleAddressClick}
                aria-label="Selecionar endereço de entrega"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-xs font-medium transition-all border border-transparent hover:border-gray-200 group"
              >
                <div className="p-1 bg-white rounded-full shadow-sm text-primary group-hover:scale-110 transition-transform">
                  <MapPin size={12} style={{ color: primaryColor }} />
                </div>
                <span className="truncate max-w-[180px]">
                  {user?.address ? user.address.split(',')[0] : 'Selecionar endereço de entrega'}
                </span>
                <ChevronDown size={12} className="text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <SearchBar
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                handleSearchSubmit={handleSearchSubmit}
                searchRef={searchRef}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                suggestions={suggestions}
                setSearchTerm={setSearchTerm}
                setIsMobileSearchOpen={setIsMobileSearchOpen}
                navigate={navigate}
                prefix={prefix}
              />
            </div>

            {/* Actions: User & Cart */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search Trigger */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Abrir busca"
                className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-full"
              >
                <Search size={22} />
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Menu do usuário"
                    aria-expanded={isUserMenuOpen}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shadow-inner border border-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-semibold text-gray-700 leading-none">Olá, {user.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-400 leading-none mt-0.5">Minha Conta</span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    aria-label="Entrar na conta"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
                  >
                    <UserIcon size={20} />
                    <span className="hidden sm:inline">Entrar</span>
                  </button>
                )}

                {/* Dropdown */}
                {isUserMenuOpen && user && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={`${prefix}/profile`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <UserIcon size={16} />
                        Meu Perfil
                      </Link>
                      <Link
                        to={`${prefix}/orders`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <ShoppingBag size={16} />
                        Meus Pedidos
                      </Link>
                      <Link
                        to={`${prefix}/account/favorites`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <Heart size={16} />
                        Meus Favoritos
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label={`Carrinho de compras com ${cartCount} itens`}
                className="relative p-2.5 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
              >
                <ShoppingBag size={22} className="group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm border-2 border-white transform scale-100 animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Address Bar (Visible only on mobile) */}
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleAddressClick}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 active:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" />
                <span className="truncate max-w-[250px]">
                  {user?.address ? user.address : 'Toque para selecionar endereço'}
                </span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 flex items-center gap-4 border-b border-gray-100">
            <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <ChevronDown size={24} className="rotate-90" />
            </button>
            <span className="font-semibold text-lg">Buscar</span>
          </div>
          <div className="p-4">
            <SearchBar
              mobile
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              handleSearchSubmit={handleSearchSubmit}
              searchRef={searchRef}
              showSuggestions={showSuggestions}
              setShowSuggestions={setShowSuggestions}
              suggestions={suggestions}
              setSearchTerm={setSearchTerm}
              setIsMobileSearchOpen={setIsMobileSearchOpen}
              navigate={navigate}
              prefix={prefix}
            />
          </div>
        </div>
      )}
    </>
  );
};