import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '../../services/api.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { register, handleSubmit, reset } = useForm({ defaultValues: { name: '', description: '' } });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryRes, menuRes] = await Promise.all([api.get('/categories'), api.get('/menu')]);
      setCategories(categoryRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const foodCounts = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category._id] = menuItems.filter((item) => (item.category?._id || item.category) === category._id).length;
      return acc;
    }, {});
  }, [categories, menuItems]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    reset({ name: category.name, description: category.description || '' });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    const trimmedName = data.name?.trim();
    if (!trimmedName) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, { name: trimmedName, description: data.description?.trim() || '' });
        toast.success('Category updated');
      } else {
        await api.post('/categories', { name: trimmedName, description: data.description?.trim() || '' });
        toast.success('Category created');
      }
      setIsDialogOpen(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDelete = (category) => {
    if ((foodCounts[category._id] || 0) > 0) {
      toast.error(`Cannot delete ${category.name} because food items still use it.`);
      return;
    }
    setDeleteTarget(category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);
    try {
      await api.delete(`/categories/${deleteTarget._id}`);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Category management</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Manage dish categories</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create, edit, and keep categories organized for your menu.</p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add category
        </Button>
      </Card>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Card className="text-center text-rose-600">{error}</Card>
      ) : categories.length === 0 ? (
        <Card className="text-center text-slate-600 dark:text-slate-300">No categories found.</Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900 md:block">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              <span>Category</span>
              <span>Food items</span>
              <span>Created</span>
              <span>Actions</span>
            </div>
            {categories.map((category) => (
              <div key={category._id} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] items-center border-t border-slate-200 px-4 py-4 text-sm dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <FolderOpen className="h-4 w-4 text-sky-600" />
                    {category.name}
                  </div>
                  {category.description ? <p className="mt-1 text-slate-500 dark:text-slate-400">{category.description}</p> : null}
                </div>
                <span className="text-slate-700 dark:text-slate-300">{foodCounts[category._id] || 0}</span>
                <span className="text-slate-700 dark:text-slate-300">{new Date(category.createdAt).toLocaleDateString()}</span>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => openEditDialog(category)} className="bg-slate-700 px-3 py-2 hover:bg-slate-800">Edit</Button>
                  <Button onClick={() => requestDelete(category)} className="bg-rose-600 px-3 py-2 hover:bg-rose-700">Delete</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 md:hidden">
            {categories.map((category) => (
              <Card key={category._id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                      <FolderOpen className="h-4 w-4 text-sky-600" />
                      {category.name}
                    </div>
                    {category.description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{category.description}</p> : null}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{foodCounts[category._id] || 0} food items</span>
                  <span>{new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => openEditDialog(category)} className="flex-1 bg-slate-700 px-3 py-2 hover:bg-slate-800">Edit</Button>
                  <Button onClick={() => requestDelete(category)} className="flex-1 bg-rose-600 px-3 py-2 hover:bg-rose-700">Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-600">{editingCategory ? 'Edit category' : 'Add category'}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{editingCategory ? 'Update category details' : 'Create a new category'}</h3>
              </div>
              <button onClick={() => setIsDialogOpen(false)} className="rounded-2xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Category name</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Starters"
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Short description"
                  className="mt-2 h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 dark:border-slate-800 dark:bg-slate-900"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" onClick={() => setIsDialogOpen(false)} className="bg-slate-700 hover:bg-slate-800">Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingCategory ? 'Save changes' : 'Create category'}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Delete category?</h3>
              <button onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{deleteTarget.name}</span>?</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" onClick={() => setDeleteTarget(null)} className="bg-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="button" onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700" disabled={submitting}>{submitting ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
