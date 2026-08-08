import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';
import { downloadInvoicePdf, printInvoice } from '../../utils/pdfUtils.js';

const AdminBillingPage = () => {
  const [items, setItems] = useState([{ name: '', price: 0, quantity: 1 }]);
  const [tableNumber, setTableNumber] = useState('');
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [notes, setNotes] = useState('');
  const [bills, setBills] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing');
      setBills(response.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + gst + serviceCharge - discount).toFixed(2));
    return { subtotal, gst, total };
  }, [items, discount, serviceCharge]);

  const hasBillableItems = useMemo(() => items.some((item) => item.name?.trim() && Number(item.quantity || 0) > 0), [items]);

  const updateItem = (index, field, value) => {
    setItems((current) => current.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const addLine = () => setItems((current) => [...current, { name: '', price: 0, quantity: 1 }]);
  const removeLine = (index) => setItems((current) => current.filter((_, idx) => idx !== index));

  const handleCreate = async () => {
    if (!hasBillableItems) {
      toast.error('Add at least one billable item before generating an invoice');
      return;
    }

    try {
      const response = await api.post('/billing', { tableNumber, items, discount, serviceCharge, notes });
      setCurrentBill(response.data.data);
      toast.success('Invoice generated');
      setItems([{ name: '', price: 0, quantity: 1 }]);
      setTableNumber('');
      setDiscount(0);
      setServiceCharge(0);
      setNotes('');
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create bill');
    }
  };

  const handleDownloadPdf = async () => {
    if (!hasBillableItems) {
      toast.error('Add at least one billable item before downloading the invoice');
      return;
    }
    if (!currentBill) {
      toast.error('Generate an invoice first');
      return;
    }

    setPdfGenerating(true);
    try {
      downloadInvoicePdf(currentBill, { title: 'Invoice' });
      toast.success('Invoice PDF downloaded');
    } catch (err) {
      toast.error('Unable to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!hasBillableItems) {
      toast.error('Add at least one billable item before printing');
      return;
    }
    if (!currentBill) {
      toast.error('Generate an invoice first');
      return;
    }
    printInvoice(currentBill, { title: 'Invoice' });
    toast.success('Invoice print window opened');
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Custom billing</h1>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <h2 className="text-xl font-semibold">Create invoice</h2>
          <div className="mt-4 space-y-4">
            <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Table number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
            {items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} placeholder="Item name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', Number(e.target.value))} placeholder="Price" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} placeholder="Quantity" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
                  <button onClick={() => removeLine(index)} type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={addLine} type="button" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800">Add item</button>
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="Discount" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <input type="number" value={serviceCharge} onChange={(e) => setServiceCharge(Number(e.target.value))} placeholder="Service charge" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" />
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                <span>GST</span>
                <span>₹{totals.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                <span>Service</span>
                <span>₹{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex justify-between text-lg font-semibold text-slate-900 dark:text-slate-100">
                <span>Total</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleCreate} className="flex-1 py-3">Generate invoice</Button>
              <Button onClick={handleDownloadPdf} className="flex-1 py-3" disabled={!hasBillableItems || !currentBill || pdfGenerating}>{pdfGenerating ? 'Preparing PDF...' : 'Download Invoice PDF'}</Button>
              <Button onClick={handlePrint} className="flex-1 py-3" disabled={!hasBillableItems || !currentBill}>Print invoice</Button>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Recent bills</h2>
          <div className="mt-4 space-y-4">
            {bills.length === 0 ? <p>No invoices yet.</p> : bills.map((bill) => (
              <div key={bill._id} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">Bill {bill._id.slice(-6).toUpperCase()}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">₹{bill.total.toFixed(2)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Table {bill.tableNumber}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminBillingPage;
