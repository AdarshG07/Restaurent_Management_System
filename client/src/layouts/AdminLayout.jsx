import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { LayoutGrid, List, Settings, ShoppingBag, ClipboardList, ChartBar, Star, LogOut, Moon, Sun, FolderOpen } from 'lucide-react';
import NotificationBell from '../components/admin/NotificationBell.jsx';

const links = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Kitchen', to: '/admin/kitchen', icon: ClipboardList },
  { label: 'Menu', to: '/admin/menu', icon: List },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen },
  { label: 'Manual Order', to: '/admin/manual-orders', icon: ClipboardList },
  { label: 'Tables', to: '/admin/tables', icon: Settings },
  { label: 'Billing', to: '/admin/billing', icon: ChartBar },
  { label: 'Reports', to: '/admin/reports', icon: Star },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <div className="mb-10 flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white">A</div>
            Admin Dashboard
          </div>
          <nav className="space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive ? 'bg-sky-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3">
            <button onClick={toggleTheme} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800">
              <span>Theme</span>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white transition hover:bg-slate-800">
              <span>Logout</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>
        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Admin interface for restaurant operations</div>
              <div className="flex items-center gap-3">
                <NotificationBell />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
