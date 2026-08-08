import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { Moon, Sun, ShoppingCart, PhoneCall } from 'lucide-react';

const CustomerLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartItems, tableNumber } = useCart();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">R</span>
            Restaurant Menu
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:block">
              Table {tableNumber}
            </span>
            <button onClick={toggleTheme} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/contact" className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <PhoneCall className="mr-2 h-4 w-4" />
              Contact
            </Link>
            <Link to="/checkout" className="relative inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cartItems.length > 0 ? <span className="ml-2 rounded-full bg-sky-600 px-2 py-0.5 text-xs text-white">{cartItems.length}</span> : null}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
      {location.pathname !== '/checkout' && location.pathname !== '/order' && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          Powered by Restaurant Management Prototype
        </footer>
      )}
    </div>
  );
};

export default CustomerLayout;
