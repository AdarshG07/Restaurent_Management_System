import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { ArrowLeft, Clock3, Flame, Leaf, Sparkles, Star } from 'lucide-react';

const FoodDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/menu/${id}`);
        setItem(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load food details.');
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    } else {
      setError('Invalid food ID.');
      setLoading(false);
    }
  }, [id]);

  const handleQuantity = (delta) => {
    setQuantity((value) => Math.max(1, value + delta));
  };

  const handleAddToCart = () => {
    if (!item) return;
    if (!item.isAvailable) {
      toast.error('This item is currently unavailable.');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }

    addToCart({
      foodId: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity,
      instructions: '',
    });
    toast.success(`${item.name} added to cart.`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
          Loading food details...
        </Card>
        <Card className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200" />
          <div className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-200" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-lg font-semibold text-rose-600">{error}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">The requested food item could not be loaded right now.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate('/menu')}>Back to menu</Button>
        </div>
      </Card>
    );
  }

  if (!item) {
    return (
      <Card className="space-y-4 text-center">
        <p className="text-lg font-semibold">Food item not found.</p>
        <Button onClick={() => navigate('/menu')}>Back to menu</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button onClick={() => navigate('/menu')} className="bg-slate-100 text-slate-700 hover:bg-slate-200">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to menu
        </Button>
      </div>
      <Card>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="overflow-hidden rounded-[2rem] bg-slate-100">
            <img src={item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'} alt={item.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {item.isSpecial && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Today’s Special
                    </span>
                  )}
                  {item.isRecommended && (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      Recommended
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${item.isVeg ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{item.name}</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.category?.name || 'Category'}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                ₹{Number(item.price).toFixed(2)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Preparation time</p>
                <div className="mt-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Clock3 className="h-4 w-4 text-sky-600" />
                  <span>{item.preparationTime} mins</span>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Spice level</p>
                <div className="mt-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>{item.spiceLevel}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
                <div className="mt-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span>{Number(item.rating || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Availability</p>
                  <p className={`mt-1 font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.isAvailable ? 'Available now' : 'Out of stock'}
                  </p>
                </div>
                {item.isVeg ? <Leaf className="h-5 w-5 text-emerald-600" /> : <Flame className="h-5 w-5 text-rose-600" />}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Description</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.description || 'A delicious dish prepared fresh for your table.'}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ingredients</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.ingredients || 'No ingredient details available.'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <button type="button" onClick={() => handleQuantity(-1)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">-</button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button type="button" onClick={() => handleQuantity(1)} className="rounded-2xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">+</button>
              </div>
              <Button onClick={handleAddToCart} className="w-full sm:w-auto" disabled={!item.isAvailable}>
                {item.isAvailable ? 'Add to cart' : 'Unavailable'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FoodDetailsPage;
