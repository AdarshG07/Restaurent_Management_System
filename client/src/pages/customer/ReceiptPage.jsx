import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { downloadReceiptPdf } from '../../utils/pdfUtils.js';

const ReceiptPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load receipt');
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    if (searchParams.get('download') === '1') {
      downloadPdf();
    }
    if (searchParams.get('print') === '1') {
      window.print();
    }
  }, [order, searchParams]);

  const downloadPdf = () => {
    if (!order) return;
    downloadReceiptPdf(order);
  };

  if (loading) return <Spinner />;
  if (error) return <Card className="text-red-500">{error}</Card>;
  if (!order) return <Card>Receipt not found.</Card>;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Receipt</p>
            <h1 className="mt-2 text-3xl font-semibold">Order Summary</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadPdf}>Download PDF</Button>
            <Button onClick={() => window.print()}>Print Receipt</Button>
            <Link to={`/feedback?orderId=${order._id}`}
              className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                Give Feedback
            </Link>
          </div>
        </div>
      </Card>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold">Order Information</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Order ID: {order._id}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Date: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Table: {order.tableNumber}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Method: {order.payment.method}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Transaction: {order.payment.paymentId || 'Pending'}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Status: {order.payment.status}</p>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.food} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
          <div className="flex justify-between">Subtotal <span>₹{order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between">GST (5%) <span>₹{order.gst.toFixed(2)}</span></div>
          <div className="flex justify-between">Total <span className="font-semibold">₹{order.total.toFixed(2)}</span></div>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptPage;
