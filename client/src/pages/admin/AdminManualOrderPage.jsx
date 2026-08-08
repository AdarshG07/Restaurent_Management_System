import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { Minus, Plus, Search, Trash2, UtensilsCrossed, ReceiptText, CircleAlert, CheckCircle2, Sofa } from 'lucide-react';

const AdminManualOrderPage = () => {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [instructions, setInstructions] = useState('');
  const [tablesLoading, setTablesLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [menuError, setMenuError] = useState('');

  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await api.get('/tables');
        setTables(response.data.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load tables');
      } finally {
        setTablesLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadTables();
    loadCategories();
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError('');
      try {
        const response = await api.get('/menu', {
          params: {
            search: searchTerm || undefined,
            category: selectedCategory || undefined,
            availability: 'available',
          },
        });
        setMenuItems(response.data.data || []);
      } catch (err) {
        setMenuError(err.response?.data?.message || 'Unable to load menu');
      } finally {
        setMenuLoading(false);
      }
    };

    const timeout = setTimeout(loadMenu, 250);
    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory]);

  const sortedTables = useMemo(() => {
    return [...tables].sort((a, b) => {
      if (a.status === b.status) return a.number.localeCompare(b.number);
      return a.status === 'AVAILABLE' ? -1 : 1;
    });
  }, [tables]);

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [orderItems]);

  const discountValue = useMemo(() => {
    const parsed = Number(discount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [discount]);

  const gst = useMemo(() => Number((subtotal * 0.05).toFixed(2)), [subtotal]);
  const total = useMemo(() => Number((subtotal + gst - discountValue).toFixed(2)), [subtotal, gst, discountValue]);

  const addItem = (item) => {
    if (!item.isAvailable) {
      toast.error(`${item.name} is currently unavailable`);
      return;
    }

    setOrderItems((current) => {
      const existing = current.find((entry) => entry._id === item._id);
      if (existing) {
        return current.map((entry) => (entry._id === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setOrderItems((current) =>
      current
        .map((entry) => {
          if (entry._id !== itemId) return entry;
          const nextQuantity = entry.quantity + delta;
          return nextQuantity > 0 ? { ...entry, quantity: nextQuantity } : null;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (itemId) => {
    setOrderItems((current) => current.filter((entry) => entry._id !== itemId));
  };

  const handleSubmit = async () => {
    if (!selectedTable) {
      toast.error('Please select a table');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Add at least one item to create the order');
      return;
    }

    if (!Number.isFinite(Number(discount)) || Number(discount) < 0) {
      toast.error('Discount must be zero or greater');
      return;
    }

    if (Number(discount) > subtotal) {
      toast.error('Discount cannot exceed the subtotal');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tableNumber: selectedTable.number,
        items: orderItems.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
          instructions: item.instructions || '',
        })),
        discount: Number(discount),
        customerNotes: instructions.trim() || 'Manual order created by admin',
      };

      const response = await api.post('/orders/manual', payload);
      const createdOrder = response.data.data;
      toast.success(`Order created successfully • ${createdOrder._id.slice(-6).toUpperCase()}`);
      setLastOrder(createdOrder);
      setOrderItems([]);
      setDiscount('0');
      setInstructions('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create manual order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Manual order entry</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Create a dine-in order for the kitchen</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Select a table, build the order, add notes, and send it directly into the existing kitchen workflow.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <UtensilsCrossed className="h-4 w-4 text-sky-600" />
            Existing order status system reused
          </div>
          <p className="mt-1">Manual orders enter the same kitchen flow as regular orders.</p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Select table</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Available tables are recommended for new manual orders.</p>
              </div>
              {tablesLoading ? <Spinner /> : null}
            </div>

            {tablesLoading ? null : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sortedTables.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">No tables are currently available.</div>
                ) : (
                  sortedTables.map((table) => (
                    <button
                      key={table._id}
                      onClick={() => setSelectedTable(table)}
                      className={`rounded-2xl border p-4 text-left transition ${selectedTable?._id === table._id ? 'border-sky-500 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{table.number}</div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${table.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                          {table.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Sofa className="h-4 w-4" />
                        {table.status === 'AVAILABLE' ? 'Ready for a new order' : 'Currently occupied'}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Choose menu items</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Search and select dishes from the existing menu catalog.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search dishes"
                    className="h-11 w-full min-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {menuLoading ? (
              <div className="mt-6 flex justify-center"><Spinner /></div>
            ) : menuError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{menuError}</div>
            ) : menuItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">No available dishes match the current search.</div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <UtensilsCrossed className="h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">{item.name}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.isVeg ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.category?.name || 'Uncategorized'}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">₹{Number(item.price).toFixed(2)}</p>
                          <Button onClick={() => addItem(item)} className="px-3 py-2">Add</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Current order</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Adjust quantities and add cooking notes before sending to the kitchen.</p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{orderItems.length} items</div>
            </div>

            {orderItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">The order builder is empty. Add dishes from the menu to begin.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {orderItems.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">₹{Number(item.price).toFixed(2)} each</div>
                      </div>
                      <button onClick={() => removeItem(item._id)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 p-1 dark:border-slate-700">
                        <button onClick={() => updateQuantity(item._id, -1)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-8 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Cooking instructions</label>
                <textarea
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="Less spicy, no onions, extra cheese..."
                  className="mt-2 h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Discount</label>
                <input
                  type="number"
                  value={discount}
                  min="0"
                  step="0.01"
                  onChange={(event) => setDiscount(event.target.value)}
                  placeholder="0.00"
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>Discount</span>
                  <span>-₹{discountValue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                  <span>Grand total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={submitting || !selectedTable || orderItems.length === 0}>
                {submitting ? 'Creating order...' : 'Create order'}
              </Button>
            </div>
          </Card>

          {lastOrder ? (
            <Card>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Order created</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Order ID:</span> {lastOrder._id}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Table:</span> {lastOrder.tableNumber}</p>
                <p><span className="font-semibold text-slate-900 dark:text-slate-100">Total:</span> ₹{Number(lastOrder.total).toFixed(2)}</p>
                <p className="flex items-center gap-2 text-sky-600 dark:text-sky-400"><ReceiptText className="h-4 w-4" /> This order has entered the kitchen workflow.</p>
              </div>
            </Card>
          ) : (
            <Card className="flex items-start gap-3 border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
              <CircleAlert className="mt-0.5 h-5 w-5" />
              <div className="text-sm">The backend recalculates the final total from actual menu prices, quantities, and discount rules before the order is accepted.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManualOrderPage;
