import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      login({ token: response.data.data.token, user: response.data.data.admin });
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <Card className="max-w-md w-full">
        <div className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Admin login</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Access dashboard</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <input type="email" {...register('email', { required: true })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Password
              <input type="password" {...register('password', { required: true })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
            <Button type="submit" className="w-full py-3" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
