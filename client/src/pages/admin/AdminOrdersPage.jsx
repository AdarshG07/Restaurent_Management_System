import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const statusActions = {
  RECEIVED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_TO_SERVE', 'CANCELLED'],
  READY_TO_SERVE: ['SERVED', 'CANCELLED'],
  SERVED: ['COMPLETED'],
};

const AdminOrdersPage = () => {
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

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked ${status.replaceAll('_', ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to update order');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Manage orders</h1>
      {orders.length === 0 ? (
        <Card>No orders available.</Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Order {order._id.slice(-6).toUpperCase()}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Table {order.tableNumber} • {order.status.replaceAll('_', ' ')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(statusActions[order.status] || []).map((status) => (
                    <Button key={status} onClick={() => updateStatus(order._id, status)}>{status.replaceAll('_', ' ')}</Button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Items</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {order.items.map((item) => (
                      <li key={item.food}>{item.name} x{item.quantity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                  <p className="mt-2 text-lg font-semibold">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
