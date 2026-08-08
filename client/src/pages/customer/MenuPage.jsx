import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../services/api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { Heart, Search, ArrowUpDown, Star, CheckCircle2, XCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [dietFilter, setDietFilter] = useState('all');
  const { addToCart, favorites, toggleFavorite, recentOrders } = useCart();

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const [menuRes, categoryRes] = await Promise.all([
        api.get('/menu', {
          params: {
            search,
            category,
            sortBy,
            availability: showAvailableOnly ? 'available' : undefined,
            isVeg: dietFilter === 'veg' ? 'true' : dietFilter === 'nonveg' ? 'false' : undefined,
          },
        }),
        api.get('/categories'),
      ]);
      setItems(Array.isArray(menuRes.data?.data) ? menuRes.data.data : []);
      setCategories(Array.isArray(categoryRes.data?.data) ? categoryRes.data.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load menu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, [search, category, sortBy, showAvailableOnly, dietFilter]);

  const featured = useMemo(() => items.filter((item) => item.isSpecial || item.isRecommended).slice(0, 3), [items]);

  const handleAdd = (food) => {
    if (!food.isAvailable) {
      toast.error('Item is currently unavailable');
      return;
    }
    addToCart({ foodId: food._id, name: food.name, price: food.price, image: food.image, quantity: 1, instructions: '' });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Digital Menu</p>
              <h2 className="mt-2 text-3xl font-semibold">Discover today’s favorites</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Search, filter, and add items to your cart instantly.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes"
                  className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400 dark:text-slate-100"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowAvailableOnly((prev) => !prev)}
                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition ${showAvailableOnly ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'}`}
              >
                {showAvailableOnly ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                {showAvailableOnly ? 'Available only' : 'All items'}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select value={dietFilter} onChange={(e) => setDietFilter(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              <option value="all">All</option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
              <option value="">Sort by</option>
              <option value="priceAsc">Price low to high</option>
              <option value="priceDesc">Price high to low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </Card>
        <Card className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold">Recommended for you</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Today's specials and popular dishes curated for you.</p>
          </div>
          <div className="space-y-4">
            {featured.length === 0 && <p className="text-sm text-slate-500">No recommendations available.</p>}
            {featured.map((item) => (
              <div key={item._id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.category?.name || 'Category'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4 text-amber-400" />
                    {item.rating}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">₹{item.price}</span>
                  <Button onClick={() => handleAdd(item)} className="px-3 py-2 text-xs">Add</Button>
                </div>
              </div>
            ))}
          </div>
          {recentOrders.length > 0 && (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <h3 className="text-lg font-semibold">Recently ordered</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Repeat a recent order with one click.</p>
              </div>
              {recentOrders.map((history) => (
                <div key={history.orderId} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Order {history.orderId.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(history.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    onClick={() => {
                      history.items.forEach((item) => addToCart({ foodId: item.food, name: item.name, price: item.price, image: item.image, quantity: item.quantity, instructions: item.instructions || '' }));
                      toast.success('Repeated previous order');
                    }}
                    className="text-sm"
                  >
                    Repeat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Card className="text-center text-red-500">{error}</Card>
      ) : items.length === 0 ? (
        <Card className="text-center">No items found for the selected filters.</Card>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item._id} className="group overflow-hidden">
              <div className="relative h-44 overflow-hidden rounded-[2rem] bg-slate-100">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-3.5 w-3.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
                <button onClick={() => toggleFavorite(item._id)} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-sky-600 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  <Heart className={`h-4 w-4 ${favorites.includes(item._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                <Link to={`/menu/${item._id}`} className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">View details</Link>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>{item.preparationTime} mins</span>
                <span>{item.spiceLevel}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.isAvailable ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">Available</span>
                  ) : (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">Unavailable</span>
                  )}
                  <button onClick={() => handleAdd(item)} disabled={!item.isAvailable} className="rounded-2xl bg-sky-600 px-3 py-2 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                    Add
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
};

export default MenuPage;
