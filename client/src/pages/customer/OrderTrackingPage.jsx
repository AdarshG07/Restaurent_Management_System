import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { CheckCircle2, Clock3, Package, Smile, Truck } from 'lucide-react';

const statusSteps = ['RECEIVED', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'COMPLETED'];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load order');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
    const socketClient = io(socketUrl);
    setSocket(socketClient);
    socketClient.emit('joinTable', order.tableNumber);
    socketClient.on('orderUpdate', (updatedOrder) => {
      if (updatedOrder._id === order._id) setOrder(updatedOrder);
    });
    return () => {
      socketClient.emit('leaveTable', order.tableNumber);
      socketClient.disconnect();
    };
  }, [order]);

  if (loading) return <Spinner />;
  if (error) return <Card className="text-red-500">{error}</Card>;
  if (!order) return <Card>No order found.</Card>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Live tracking</p>
            <h1 className="mt-2 text-3xl font-semibold">Order {order._id.slice(-6).toUpperCase()}</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Table {order.tableNumber} • Status: {order.status.replaceAll('_', ' ')}</p>
          </div>
          <Link to={`/receipt/${order._id}`} className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
            View Receipt
          </Link>
        </div>
      </Card>
      <Card>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {statusSteps.map((step) => {
              const active = statusSteps.indexOf(order.status) >= statusSteps.indexOf(step);
              return (
                <div key={step} className={`rounded-3xl border p-5 text-center ${active ? 'border-sky-600 bg-sky-50 text-slate-900 dark:bg-sky-950/40 dark:text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'}`}>
                  <div className="mb-2 flex items-center justify-center">
                    {step === 'RECEIVED' && <Clock3 className="h-5 w-5" />}
                    {step === 'PREPARING' && <Package className="h-5 w-5" />}
                    {step === 'READY_TO_SERVE' && <CheckCircle2 className="h-5 w-5" />}
                    {step === 'SERVED' && <Truck className="h-5 w-5" />}
                    {step === 'COMPLETED' && <Smile className="h-5 w-5" />}
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">{step.replaceAll('_', ' ')}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Order details</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {order.items.map((item) => (
                <div key={item.food} className="flex justify-between gap-4">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderTrackingPage;
