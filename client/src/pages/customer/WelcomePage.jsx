import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';

const WelcomePage = () => {
  const [searchParams] = useSearchParams();
  const [tableNumber, setTableNumber] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
      sessionStorage.setItem('rm-table', tableParam);
    } else {
      const stored = sessionStorage.getItem('rm-table');
      if (stored) setTableNumber(stored);
    }
  }, [searchParams]);

  const handleStart = () => {
    sessionStorage.setItem('rm-table', tableNumber);
    navigate('/menu');
  };

  return (
    <div className="grid min-h-[70vh] place-items-center py-10">
      <Card className="max-w-3xl text-center">
        <div className="mx-auto mb-6 h-24 w-24 rounded-3xl bg-sky-600 text-white shadow-lg shadow-sky-500/20 flex items-center justify-center text-3xl font-bold">R</div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Welcome to Restaurant Delight</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Scan your table QR code to begin a seamless dining experience with a digital menu, live order tracking, payments, and receipts.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-200">
            Detected table number
            <input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <Button onClick={handleStart} className="h-full w-full py-3">Start Ordering</Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomePage;
