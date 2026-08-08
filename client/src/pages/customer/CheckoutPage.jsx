import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { cartItems, totals, tableNumber, updateQuantity, updateInstructions, removeItem, clearCart, recordRecentOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentState, setPaymentState] = useState('idle');
  const [paymentError, setPaymentError] = useState('');
  const [paymentSummary, setPaymentSummary] = useState(null);
  const navigate = useNavigate();

  // const handlePlaceOrder = async () => {
  //   if (!cartItems.length) {
  //     toast.error('Cart is empty');
  //     return;
  //   }

  const handlePlaceOrder = async () => {
  if (!cartItems.length) {
    toast.error('Cart is empty');
    return;
  }

  setLoading(true);
  setPaymentState('processing');
  setPaymentError('');

  try {
    const orderResponse = await api.post('/orders', {
      tableNumber,
      items: cartItems.map((item) => ({
        foodId: item.foodId,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
      customerNotes: notes,
      discount: Number(discount),
    });

    const createdOrder = orderResponse.data.data;

    recordRecentOrder(createdOrder);
    clearCart();

    setPaymentSummary({
      orderId: createdOrder._id,
      transactionId: 'PROTOTYPE',
      amount: createdOrder.total,
      status: 'ORDER PLACED',
      tableNumber: createdOrder.tableNumber,
    });

    setPaymentState('success');

    toast.success('Order placed successfully!');
  } catch (err) {
    const message =
      err.response?.data?.message || 'Unable to place order';

    setPaymentError(message);
    setPaymentState('error');

    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  //   const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  //   if (!razorpayKeyId) {
  //     setPaymentState('error');
  //     setPaymentError('Razorpay is not configured. Please set VITE_RAZORPAY_KEY_ID in your environment.');
  //     toast.error('Razorpay is not configured.');
  //     return;
  //   }
  //   if (!window.Razorpay) {
  //     setPaymentState('error');
  //     setPaymentError('Payment service is not available. Please try again later.');
  //     toast.error('Payment service is not available.');
  //     return;
  //   }

  //   setLoading(true);
  //   setPaymentState('processing');
  //   setPaymentError('');
  //   setPaymentSummary(null);
  //   let createdOrder = null;

  //   try {
  //     const orderResponse = await api.post('/orders', {
  //       tableNumber,
  //       items: cartItems.map((item) => ({ foodId: item.foodId, quantity: item.quantity, instructions: item.instructions })),
  //       customerNotes: notes,
  //       discount: Number(discount),
  //     });
  //     createdOrder = orderResponse.data.data;

  //     const paymentResponse = await api.post('/payments/create', { orderId: createdOrder._id });
  //     const razorpayOrder = paymentResponse.data.data;

  //     const options = {
  //       key: razorpayKeyId,
  //       amount: razorpayOrder.amount,
  //       currency: razorpayOrder.currency,
  //       name: 'Restaurant Delight',
  //       description: `Order ${createdOrder._id.slice(-6).toUpperCase()}`,
  //       order_id: razorpayOrder.id,
  //       handler: async (paymentResult) => {
  //         try {
  //           setPaymentState('verifying');
  //           const verifyResponse = await api.post('/payments/verify', {
  //             orderId: createdOrder._id,
  //             razorpayPaymentId: paymentResult.razorpay_payment_id,
  //             razorpayOrderId: paymentResult.razorpay_order_id,
  //             razorpaySignature: paymentResult.razorpay_signature,
  //           });
  //           const verifiedOrder = verifyResponse.data.data;
  //           recordRecentOrder(verifiedOrder);
  //           clearCart();
  //           setPaymentSummary({
  //             orderId: verifiedOrder._id,
  //             transactionId: verifiedOrder.payment?.paymentId || paymentResult.razorpay_payment_id,
  //             amount: verifiedOrder.payment?.amount || verifiedOrder.total,
  //             status: verifiedOrder.payment?.status || 'PAID',
  //             tableNumber: verifiedOrder.tableNumber,
  //           });
  //           setPaymentState('success');
  //           toast.success('Payment successful');
  //         } catch (verifyError) {
  //           const message = verifyError.response?.data?.message || 'Payment verification failed. Please contact support.';
  //           setPaymentError(message);
  //           setPaymentState('error');
  //           toast.error(message);
  //         } finally {
  //           setLoading(false);
  //         }
  //       },
  //       modal: {
  //         ondismiss: () => {
  //           const message = 'Payment was cancelled. Your order is still pending.';
  //           setPaymentError(message);
  //           setPaymentState('cancelled');
  //           toast.error(message);
  //           setLoading(false);
  //         },
  //       },
  //     };

  //     const razorpay = new window.Razorpay(options);
  //     razorpay.open();
  //   } catch (err) {
  //     const message = err.response?.data?.message || 'Unable to place order';
  //     setPaymentError(message);
  //     setPaymentState('error');
  //     toast.error(message);
  //     setLoading(false);
  //   }
  // };

  const summary = useMemo(() => ({ subtotal: totals.subtotal, gst: totals.gst, total: totals.total, discount: Number(discount) || 0 }), [totals, discount]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <h2 className="text-2xl font-semibold">Review your order</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Confirm your table and order details before sending it to the kitchen.</p>
        </Card>
        {cartItems.length === 0 ? (
          <Card className="text-center">Your cart is empty. Add menu items to begin.</Card>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.foodId} className="space-y-4">
                <div className="flex items-start gap-4">
                  <img src={item.image} alt={item.name} className="h-24 w-24 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">₹{item.price} x {item.quantity}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.foodId, item.quantity - 1)} className="rounded-2xl border border-slate-200 px-3 py-1 text-sm dark:border-slate-700">-</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.foodId, item.quantity + 1)} className="rounded-2xl border border-slate-200 px-3 py-1 text-sm dark:border-slate-700">+</button>
                      <button onClick={() => removeItem(item.foodId)} className="rounded-2xl border border-rose-200 px-3 py-1 text-sm text-rose-700 dark:border-rose-600 dark:text-rose-300">Remove</button>
                    </div>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Special instructions
                  <textarea
                    value={item.instructions || ''}
                    onChange={(e) => updateInstructions(item.foodId, e.target.value)}
                    placeholder="Add cooking notes"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-6">
        <Card>
          <h3 className="text-xl font-semibold">Order summary</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Table</span>
              <span>{tableNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{summary.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>₹{summary.discount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
                <span>Total</span>
                <span>₹{(summary.total - summary.discount).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Discount (optional)
            <input
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              type="number"
              min="0"
              step="0.01"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Order notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests?"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <div className="mt-6">
            <Button onClick={handlePlaceOrder} className="w-full py-3" disabled={loading || cartItems.length === 0}>
              {loading ? (paymentState === 'verifying' ? 'Verifying payment...' : 'Processing payment...') : 'Place Order'}
            </Button>
          </div>
          {paymentState === 'success' && paymentSummary && (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              <h4 className="text-lg font-semibold">Order placed successfully</h4>
              <div className="mt-3 space-y-2">
                <p><span className="font-medium">Order ID:</span> {paymentSummary.orderId}</p>
                <p><span className="font-medium">Amount:</span> ₹{Number(paymentSummary.amount).toFixed(2)}</p>
                <p><span className="font-medium">Status:</span> {paymentSummary.status}</p>
                <p><span className="font-medium">Table:</span> {paymentSummary.tableNumber}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => navigate(`/receipt/${paymentSummary.orderId}`)}>View Receipt</Button>
                <Button onClick={() => window.open(`/receipt/${paymentSummary.orderId}?download=1`, '_blank')}>Download PDF</Button>
                <Button onClick={() => window.open(`/receipt/${paymentSummary.orderId}?print=1`, '_blank')}>Print Receipt</Button>
              </div>
            </div>
          )}
          {(paymentState === 'error' || paymentState === 'cancelled') && paymentError && (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <h4 className="text-lg font-semibold">{paymentState === 'cancelled' ? 'Payment cancelled' : 'Payment issue'}</h4>
              <p className="mt-2">{paymentError}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;
