import { useEffect, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/reviews');
        setReviews(response.data.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchReviews();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Customer reviews</h1>
      {reviews.length === 0 ? (
        <Card>No reviews available yet.</Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Order {review.orderId.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Table {review.tableNumber}</p>
                </div>
                <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <span>Food: {review.foodRating}</span>
                  <span>Service: {review.serviceRating}</span>
                </div>
              </div>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{review.comment || 'No comment provided.'}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
