import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from '../store/toastStore';
import { fixProductImage } from '../utils/imageHelper';
import { formatPrice } from '../utils/priceHelper';
import { Plus, Edit2, Trash2, X, Eye, Image as ImageIcon } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

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
    imageUrl: '',
    isFeatured: false,
    isTrending: false,
  });
  const [files, setFiles] = useState<FileList | null>(null);

  // Fetch products query
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get('/products', { params: { limit: 100 } });
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

  // Invalidate all queries so website immediately reflects changes
  const refreshAllCatalogQueries = () => {
    queryClient.invalidateQueries();
  };

  // Create Product mutation
  const createProductMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await api.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Product created and published to store successfully!');
      closeModal();
      refreshAllCatalogQueries();
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
      toast.success('Product updated across store successfully!');
      closeModal();
      refreshAllCatalogQueries();
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
      toast.success('Product removed from store successfully');
      refreshAllCatalogQueries();
    },
    onError: (_err: any) => {
      toast.error('Error deleting product');
    },
  });

  const handleEditClick = (product: any) => {
    setEditProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      discount: (product.discount ?? 0).toString(),
      stock: product.stock?.toString() || '',
      brand: product.brand || '',
      categoryId: product.categoryId || product.category?.id || '',
      imageUrl: product.images?.[0] || '',
      isFeatured: Boolean(product.isFeatured),
      isTrending: Boolean(product.isTrending),
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product from the store catalog?')) {
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
      imageUrl: '',
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

    if (formData.imageUrl && formData.imageUrl.trim()) {
      payload.append('imageUrl', formData.imageUrl.trim());
    }

    if (files && files.length > 0) {
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

  // Preview image URL
  const previewImg = formData.imageUrl || (files && files[0] ? URL.createObjectURL(files[0]) : '');

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-[#FAF9F6] dark:bg-[#0D0D0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200/80 dark:border-neutral-800 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
                Catalog Inventory
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                Manage Products
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1">Configure stock levels, specifications, prices, and catalog visibility across the store.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>
        </ScrollReveal>

        {/* Product listing table */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-soft-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-[#F4F3EF]/60 dark:bg-[#1C1C20]/60 p-4 text-neutral-400 font-bold uppercase text-[10px]">
                    <th className="p-4">Product Info</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {productsData?.map((p: any) => {
                    const img = fixProductImage(p.images?.[0], p.name);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img src={img} className="w-11 h-11 object-cover rounded-xl bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-200/80 dark:border-neutral-800 shrink-0" />
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white line-clamp-1 max-w-[200px]">{p.name}</div>
                            <div className="text-[10px] text-neutral-400">ID: {p.id.slice(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-300 font-semibold">{p.brand}</td>
                        <td className="p-4 text-neutral-500">{p.category?.name || 'Unassigned'}</td>
                        <td className="p-4 text-neutral-900 dark:text-white font-bold">
                          {formatPrice(p.discountPrice)}{' '}
                          {p.discount > 0 && <span className="text-[10px] text-neutral-400 font-normal line-through ml-1">{formatPrice(p.price)}</span>}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.stock > 5 
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 shrink-0">
                          <Link to={`/product/${p.id}`} className="p-1.5 inline-block text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition" title="Preview product page">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => handleEditClick(p)} className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer" title="Edit specifications">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(p.id)} className="p-1.5 text-neutral-400 hover:text-rose-500 transition cursor-pointer" title="Remove catalog item">
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

        {/* FULL VIEWPORT PORTAL MODAL */}
        {showModal && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative space-y-5 shadow-2xl my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeModal} 
                className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-0.5">
                  Admin Action
                </span>
                <h3 className="font-editorial text-2xl font-black text-neutral-900 dark:text-white">
                  {editProduct ? 'Edit Catalog Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">Changes made here will be published immediately to the live storefront.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Name */}
                <div className="flex flex-col sm:col-span-2 space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Product Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Classic Cotton Crewneck T-Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col sm:col-span-2 space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Description Details *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide material details, fit specifications, and styling recommendations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  ></textarea>
                </div>

                {/* Price & Discount */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Retail Price (₹) *</label>
                  <input
                    required
                    type="number"
                    step="1"
                    min="1"
                    placeholder="1999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                {/* Brand & Stock */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Brand / Label *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AuraStudio, UrbanThread"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Stock Quantity *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                {/* Category Selection */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Fashion Department *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Select Department</option>
                    {categories?.map((cat: any) => (
                      <option key={cat.id || cat.slug} value={cat.id || cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Direct Image URL Option */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Product Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white transition"
                  />
                </div>

                {/* Upload Image Files */}
                <div className="flex flex-col sm:col-span-2 space-y-1.5">
                  <label className="text-neutral-700 dark:text-neutral-300 font-bold">Or Upload Photo Files</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFiles(e.target.files)}
                    className="bg-[#F4F3EF] dark:bg-[#1C1C20] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2 text-neutral-600 dark:text-neutral-400 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Image Preview if available */}
                {previewImg && (
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-[#F4F3EF] dark:bg-[#1C1C20] rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <img src={previewImg} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-neutral-300 dark:border-neutral-700 shrink-0" />
                    <div>
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <ImageIcon size={13} /> Image Ready
                      </div>
                      <div className="text-[10px] text-neutral-500">This photo will be displayed on catalog cards and detail pages.</div>
                    </div>
                  </div>
                )}

                {/* Featured / Trending check boxes */}
                <div className="flex gap-6 py-1 sm:col-span-2">
                  <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-neutral-900 dark:accent-white w-4 h-4 rounded cursor-pointer"
                    />
                    Feature on Homepage
                  </label>
                  <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="accent-neutral-900 dark:accent-white w-4 h-4 rounded cursor-pointer"
                    />
                    Mark as Trending Look
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="sm:col-span-2 bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition shadow-soft-sm cursor-pointer mt-2"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending
                    ? 'Publishing Product...'
                    : editProduct
                      ? 'Update Product Details'
                      : 'Publish Product to Store'}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      </main>
    </div>
  );
}
