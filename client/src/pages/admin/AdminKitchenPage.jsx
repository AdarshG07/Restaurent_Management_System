import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const kitchenStatuses = ['RECEIVED', 'PREPARING', 'READY_TO_SERVE'];

const AdminKitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const grouped = useMemo(
    () => kitchenStatuses.map((status) => ({ status, items: orders.filter((order) => order.status === status) })),
    [orders]
  );

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order moved to ${status.replaceAll('_', ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update order');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Kitchen display</h1>
      <div className="grid gap-6 xl:grid-cols-3">
        {grouped.map((group) => (
          <Card key={group.status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{group.status.replaceAll('_', ' ')}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{group.items.length}</span>
            </div>
            <div className="space-y-4">
              {group.items.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No orders in this stage.</p>
              ) : (
                group.items.map((order) => (
                  <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Order {order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Table {order.tableNumber}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Items: {order.items.length}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.status === 'RECEIVED' && <Button onClick={() => updateStatus(order._id, 'PREPARING')}>Prepare</Button>}
                      {order.status === 'PREPARING' && <Button onClick={() => updateStatus(order._id, 'READY_TO_SERVE')}>Ready</Button>}
                      {order.status === 'READY_TO_SERVE' && <Button onClick={() => updateStatus(order._id, 'SERVED')}>Serve</Button>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminKitchenPage;
