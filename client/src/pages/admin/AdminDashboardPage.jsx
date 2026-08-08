import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reports');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <Card className="text-red-500">Unable to load dashboard data.</Card>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Total orders</p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.totalOrders}</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Pending orders</p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.pendingOrders}</p>
        </Card>
        <Card className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Completed orders</p>
          <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{stats.completedOrders}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Today’s revenue</p>
          <p className="mt-2 text-3xl font-semibold">₹{stats.dailyRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Weekly revenue</p>
          <p className="mt-2 text-3xl font-semibold">₹{stats.weeklyRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Monthly revenue</p>
          <p className="mt-2 text-3xl font-semibold">₹{stats.monthlyRevenue.toFixed(2)}</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-semibold">Popular dishes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {stats.popularDishes.map((item) => (
            <div key={item._id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sold {item.popularity} times</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
