import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const AdminReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/reports');
        setStats(response.data.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (!stats) return <Card className="text-red-500">Unable to load reports.</Card>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Reports and analytics</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily sales</p>
          <p className="mt-3 text-3xl font-semibold">₹{stats.dailyRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Weekly sales</p>
          <p className="mt-3 text-3xl font-semibold">₹{stats.weeklyRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Monthly sales</p>
          <p className="mt-3 text-3xl font-semibold">₹{stats.monthlyRevenue.toFixed(2)}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold">Best-selling dishes</h2>
          <div className="mt-4 space-y-3">
            {stats.popularDishes.map((dish) => (
              <div key={dish._id} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <span>{dish.name}</span>
                <span className="text-sm text-slate-500">{dish.popularity} sold</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Peak hours</h2>
          <div className="mt-4 space-y-3">
            {stats.peakHours.map((hour) => (
              <div key={hour._id} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <span>{hour._id}:00</span>
                <span className="text-sm text-slate-500">{hour.count} orders</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;
