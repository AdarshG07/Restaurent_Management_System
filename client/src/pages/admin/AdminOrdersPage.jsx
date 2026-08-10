import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [preparationTimes, setPreparationTimes] = useState({});

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
      toast.error(
        err.response?.data?.message || 'Unable to update order'
      );
    }
  };

  const updatePreparationTime = async (orderId, minutes) => {
    try {
      await api.patch(`/orders/${orderId}/preparation-time`, {
        estimatedMinutes: Number(minutes),
      });

      toast.success('Preparation time updated');

      fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Unable to update preparation time'
      );
    }
  };

  const handlePreparationTimeChange = (orderId, value) => {
    setPreparationTimes((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Manage orders
      </h1>

      {orders.length === 0 ? (
        <Card className="text-center">
          No orders available.
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Order {order._id.slice(-6).toUpperCase()}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Table {order.tableNumber} •{' '}
                    {order.status.replaceAll('_', ' ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                {(statusActions[order.status] || []).map(
                    (status) => (
                      <Button
                      key={status}
                      onClick={() =>
                      updateStatus(order._id, status)
                }>
                {status.replaceAll('_', ' ')}
                  </Button>)
                )}

                <Link
                  to={`/receipt/${order._id}`}
                  className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  View Receipt
                </Link>
              </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium">
                  Preparation time:
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    preparationTimes[order._id] ??
                    order.estimatedMinutes
                  }
                  onChange={(e) =>
                    handlePreparationTimeChange(
                      order._id,
                      e.target.value
                    )
                  }
                  className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />

                <span className="text-sm text-slate-500">
                  minutes
                </span>

                <Button
                  onClick={() =>
                    updatePreparationTime(
                      order._id,
                      preparationTimes[order._id] ??
                        order.estimatedMinutes
                    )
                  }
                >
                  Update Time
                </Button>
              </div>

              <div>
                <h3 className="font-semibold">
                  Items
                </h3>

                <div className="mt-2 space-y-1">
                  {order.items.map((item) => (
                    <p
                      key={`${order._id}-${item.food}`}
                      className="text-sm text-slate-600 dark:text-slate-300"
                    >
                      {item.name} x{item.quantity}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <span className="font-semibold">
                  Total
                </span>

                <span className="ml-2">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;