import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import WelcomePage from './pages/customer/WelcomePage.jsx';
import MenuPage from './pages/customer/MenuPage.jsx';
import CheckoutPage from './pages/customer/CheckoutPage.jsx';
import OrderTrackingPage from './pages/customer/OrderTrackingPage.jsx';
import ReceiptPage from './pages/customer/ReceiptPage.jsx';
import FoodDetailsPage from './pages/customer/FoodDetailsPage.jsx';
import ContactPage from './pages/customer/ContactPage.jsx';
import FeedbackPage from './pages/customer/FeedbackPage.jsx';
import AdminLoginPage from './pages/auth/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminKitchenPage from './pages/admin/AdminKitchenPage.jsx';
import AdminMenuPage from './pages/admin/AdminMenuPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminManualOrderPage from './pages/admin/AdminManualOrderPage.jsx';
import AdminTablesPage from './pages/admin/AdminTablesPage.jsx';
import AdminBillingPage from './pages/admin/AdminBillingPage.jsx';
import AdminReportsPage from './pages/admin/AdminReportsPage.jsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

const ProtectedAdmin = ({ children }) => {
  const { admin } = useAuth();
  if (!admin?.token) return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
              <Toaster position="top-right" />
              <Routes>
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<WelcomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/menu/:id" element={<FoodDetailsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order/:id" element={<OrderTrackingPage />} />
                  <Route path="/receipt/:id" element={<ReceiptPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                </Route>
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdmin>
                      <AdminLayout />
                    </ProtectedAdmin>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="kitchen" element={<AdminKitchenPage />} />
                  <Route path="menu" element={<AdminMenuPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="manual-orders" element={<AdminManualOrderPage />} />
                  <Route path="tables" element={<AdminTablesPage />} />
                  <Route path="billing" element={<AdminBillingPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
