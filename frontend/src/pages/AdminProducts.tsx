import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '',
    stock: '',
    brand: '',
    categoryId: '',
    isFeatured: false,
    isTrending: false,
  });
  const [files, setFiles] = useState<FileList | null>(null);

  // Fetch products query
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 100 } }); // Fetch a larger batch for admin view
      return res.data.products;
    },
  });

  // Fetch categories query
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data.categories;
    },
  });

  // Create Product mutation
  const createProductMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await api.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Product created successfully!');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating product');
    },
  });

  // Update Product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormData }) => {
      const res = await api.put(`/products/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Product updated successfully!');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error updating product');
    },
  });

  // Delete Product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: (err: any) => {
      toast.error('Error deleting product');
    },
  });

  const handleEditClick = (product: any) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      stock: product.stock.toString(),
      brand: product.brand,
      categoryId: product.categoryId,
      isFeatured: product.isFeatured,
      isTrending: product.isTrending,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount: '',
      stock: '',
      brand: '',
      categoryId: '',
      isFeatured: false,
      isTrending: false,
    });
    setFiles(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('discount', formData.discount || '0');
    payload.append('stock', formData.stock);
    payload.append('brand', formData.brand);
    payload.append('categoryId', formData.categoryId);
    payload.append('isFeatured', String(formData.isFeatured));
    payload.append('isTrending', String(formData.isTrending));

    if (files) {
      Array.from(files).forEach((file) => {
        payload.append('images', file);
      });
    }

    if (editProduct) {
      updateProductMutation.mutate({ id: editProduct.id, payload });
    } else {
      createProductMutation.mutate(payload);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-slate-950 animate-page-enter">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black font-display text-white">Manage Products</h1>
            <p className="text-slate-400 text-sm mt-1">Configure stock parameters, description specs, and catalog listings.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-1.5 transition"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Product listing table */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-slate-900 border border-slate-800 rounded-lg"></div>
            <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 p-4 text-slate-500 font-bold uppercase">
                    <th className="p-4">Info</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {productsData?.map((p: any) => {
                    const img = fixProductImage(p.images?.[0], p.name);
                    return (
                      <tr key={p.id} className="hover:bg-slate-950/20 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img src={img} className="w-10 h-10 object-cover rounded bg-slate-950 border border-slate-800" />
                          <div className="font-bold text-slate-200 line-clamp-1 max-w-[200px]">{p.name}</div>
                        </td>
                        <td className="p-4 text-slate-400 font-semibold">{p.brand}</td>
                        <td className="p-4 text-slate-400">{p.category?.name}</td>
                        <td className="p-4 text-slate-200 font-semibold">
                          {formatPrice(p.discountPrice)}{' '}
                          {p.discount > 0 && <span className="text-[10px] text-slate-500 line-through">{formatPrice(p.price)}</span>}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stock > 5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-3 shrink-0">
                          <Link to={`/product/${p.id}`} className="text-slate-500 hover:text-indigo-400 transition" title="Preview product page">
                            <Eye size={16} className="inline" />
                          </Link>
                          <button onClick={() => handleEditClick(p)} className="text-slate-500 hover:text-indigo-400 transition" title="Edit specifications">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(p.id)} className="text-slate-500 hover:text-rose-500 transition" title="Remove catalog item">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full relative space-y-6 animate-in zoom-in-95 duration-200">
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold font-display text-white border-b border-slate-800 pb-3">
                {editProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-slate-500 font-bold mb-1">Product Title</span>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col sm:col-span-2">
                  <span className="text-slate-500 font-bold mb-1">Description Details</span>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  ></textarea>
                </div>

                {/* Price & Discount */}
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Retail Price (₹)</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Discount Value (%)</span>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                {/* Brand & Stock */}
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Manufacturer Brand</span>
                  <input
                    required
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Stock Quantity</span>
                  <input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none"
                  />
                </div>

                {/* Category ID Select */}
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Product Category</span>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Files */}
                <div className="flex flex-col">
                  <span className="text-slate-500 font-bold mb-1">Select Images {editProduct && '(Optional replacement)'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-slate-400 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Featured / Trending check boxes */}
                <div className="flex gap-6 py-2 sm:col-span-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-indigo-650"
                    />
                    Mark as Featured Product
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="accent-indigo-650"
                    />
                    Mark as Trending Product
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? 'Saving Changes...'
                    : editProduct
                      ? 'Update Product Details'
                      : 'Create Catalog Product'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
