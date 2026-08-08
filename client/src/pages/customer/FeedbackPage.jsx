import { useState } from 'react';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import { toast } from 'sonner';

const FeedbackPage = () => {
  const [orderId, setOrderId] = useState('');
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', { orderId, foodRating, serviceRating, comment });
      toast.success('Thank you for your feedback');
      setOrderId('');
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <h1 className="text-3xl font-semibold">Feedback</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Share your experience after your order is completed.</p>
      </Card>
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Order ID
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Food rating
              <input type="number" min="1" max="5" value={foodRating} onChange={(e) => setFoodRating(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Service rating
              <input type="number" min="1" max="5" value={serviceRating} onChange={(e) => setServiceRating(Number(e.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Comment
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </label>
          <Button className="w-full py-3" type="submit" disabled={loading || !orderId}>
            {loading ? 'Submitting...' : 'Send feedback'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackPage;
