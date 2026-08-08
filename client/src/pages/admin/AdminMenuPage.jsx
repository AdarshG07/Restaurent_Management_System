import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';
import { LOW_STOCK_THRESHOLD } from '../../config/constants.js';

const getStockStatus = (quantity, isAvailable) => {
  if (quantity === 0) return 'Out of stock';
  if (typeof quantity === 'number' && quantity > 0 && quantity <= LOW_STOCK_THRESHOLD) return 'Low stock';
  return isAvailable ? 'In stock' : 'Unavailable';
};

const getStatusClass = (status) => {
  if (status === 'Out of stock') return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
  if (status === 'Low stock') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
};

const AdminMenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([api.get('/categories'), api.get('/menu')]);
      setCategories(catRes.data.data);
      setItems(itemRes.data.data);
    } catch (err) {
      toast.error('Unable to load menu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (selected) {
        await api.put(`/menu/${selected._id}`, data);
        toast.success('Item updated');
      } else {
        await api.post('/menu', data);
        toast.success('Item added');
      }
      reset();
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save item');
    }
  };

  const editItem = (item) => {
    setSelected(item);
    reset({
      name: item.name,
      description: item.description,
      ingredients: item.ingredients,
      price: item.price,
      image: item.image,
      category: item.category?._id || '',
      preparationTime: item.preparationTime,
      spiceLevel: item.spiceLevel,
      rating: item.rating,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      stockQuantity: item.stockQuantity ?? '',
      isSpecial: item.isSpecial,
      isRecommended: item.isRecommended,
    });
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete item');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <Card>
          <h2 className="text-xl font-semibold">{selected ? 'Edit item' : 'Add new item'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <input {...register('name')} placeholder="Name" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <textarea {...register('description')} placeholder="Description" className="h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <input {...register('ingredients')} placeholder="Ingredients" className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="number" step="0.01" {...register('price')} placeholder="Price" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
              <input type="number" {...register('preparationTime')} placeholder="Prep time" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <select {...register('category')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              <input {...register('image')} placeholder="Image URL" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
              <input
                type="number"
                step="1"
                min="0"
                {...register('stockQuantity')}
                placeholder="Stock quantity"
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <select {...register('spiceLevel')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Spicy">Spicy</option>
              </select>
              <input type="number" step="0.1" max="5" min="0" {...register('rating')} placeholder="Rating" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900" />
              <select {...register('isVeg')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value={true}>Veg</option>
                <option value={false}>Non-Veg</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select {...register('isAvailable')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value={true}>Available</option>
                <option value={false}>Out of stock</option>
              </select>
              <select {...register('isSpecial')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value={false}>Normal</option>
                <option value={true}>Today's special</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select {...register('isRecommended')} className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                <option value={false}>Regular</option>
                <option value={true}>Recommended</option>
              </select>
              <Button type="submit" className="h-12 w-full">{selected ? 'Update item' : 'Create item'}</Button>
            </div>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Menu items</h2>
          <div className="mt-4 space-y-4">
            {items.length === 0 ? <p>No menu items available.</p> : items.map((item) => (
              <div key={item._id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.category?.name}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-900 dark:text-slate-300">Stock: {item.stockQuantity ?? 'N/A'}</span>
                      <span className={`rounded-full px-2.5 py-1 font-semibold ${getStatusClass(getStockStatus(item.stockQuantity, item.isAvailable))}`}>
                        {getStockStatus(item.stockQuantity, item.isAvailable)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => editItem(item)}>Edit</Button>
                    <Button onClick={() => deleteItem(item._id)} className="bg-rose-600 hover:bg-rose-700">Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminMenuPage;
