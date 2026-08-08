import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { toast } from 'sonner';

const AdminTablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tables');
      setTables(response.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const addTable = async () => {
    if (!tableNumber) return;
    try {
      await api.post('/tables', { number: tableNumber });
      toast.success('Table created');
      setTableNumber('');
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to create table');
    }
  };

  const removeTable = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await api.delete(`/tables/${id}`);
      toast.success('Table removed');
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to remove table');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Table management</h1>
      <Card>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Table number" className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100" />
          <Button onClick={addTable} className="h-12">Add table</Button>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tables.map((table) => {
          const url = `${import.meta.env.VITE_FRONTEND_URL || window.location.origin}/menu?table=${table.number}`;
          return (
            <Card key={table._id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">Table {table.number}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{table.status}</p>
                </div>
                <Button onClick={() => removeTable(table._id)} className="bg-rose-600 hover:bg-rose-700">Delete</Button>
              </div>
              <div className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-950">
                <QRCodeCanvas value={url} size={160} bgColor="#ffffff" fgColor="#0f172a" />
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                URL:
                <div className="break-words text-xs">{url}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTablesPage;
