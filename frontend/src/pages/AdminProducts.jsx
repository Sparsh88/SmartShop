import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { TableSkeleton } from '../components/LoaderSkeletons';
import { Trash2, Edit2, Plus, Sparkles, Loader, X } from 'lucide-react';

const AdminProducts = ({ onToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [isDeal, setIsDeal] = useState(false);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  
  // Specs: [{ name: '', value: '' }]
  const [specs, setSpecs] = useState([]);

  // Option categories loaded from server
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params: { limit: 50 } });
      setProducts(data.products || []);
    } catch (err) {
      console.error(err.message);
      onToast('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {}
    };
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      onToast('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      onToast('Failed to delete product');
    }
  };

  const handleOpenCreateModal = () => {
    setEditProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory(categories[0]?.name || 'Laptops');
    setBrand('');
    setStock('');
    setIsTrending(false);
    setIsDeal(false);
    setIsFlashSale(false);
    setSpecs([]);
    setImageFiles([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice);
    setCategory(prod.category);
    setBrand(prod.brand);
    setStock(prod.stock);
    setIsTrending(prod.isTrending || false);
    setIsDeal(prod.isDeal || false);
    setIsFlashSale(prod.isFlashSale || false);
    setSpecs(prod.specs || []);
    setImageFiles([]);
    setShowModal(true);
  };

  const handleAddSpecRow = () => {
    setSpecs(prev => [...prev, { name: '', value: '' }]);
  };

  const handleSpecChange = (idx, field, val) => {
    setSpecs(prev => prev.map((spec, i) => i === idx ? { ...spec, [field]: val } : spec));
  };

  const handleRemoveSpecRow = (idx) => {
    setSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('originalPrice', originalPrice);
    formData.append('category', category);
    formData.append('brand', brand);
    formData.append('stock', stock);
    formData.append('isTrending', isTrending);
    formData.append('isDeal', isDeal);
    formData.append('isFlashSale', isFlashSale);
    
    // Filter empty specifications
    const filteredSpecs = specs.filter(s => s.name.trim() && s.value.trim());
    formData.append('specs', JSON.stringify(filteredSpecs));

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        formData.append('images', file);
      }
    }

    setLoading(true);
    try {
      if (editProduct) {
        // PUT edit
        await api.put(`/products/${editProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onToast('Product updated successfully! ✨');
      } else {
        // POST create
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        onToast('Product created successfully! 📦');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      onToast(err.response?.data?.message || 'Failed to save product details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Manage Products</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add, edit details, or remove inventory records</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-600/30 flex items-center gap-1 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {loading && products.length === 0 ? (
        <TableSkeleton cols={5} />
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-750 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-semibold text-left text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-750 text-gray-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Price / Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-750">
                {products.map(prod => (
                  <tr key={prod._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0" />
                      <div>
                        <p className="font-extrabold text-gray-900 dark:text-white">{prod.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">ID: {prod._id.substring(prod._id.length - 8).toUpperCase()}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white">{prod.category}</td>
                    <td className="p-4">{prod.brand}</td>
                    <td className="p-4">
                      <p className="text-gray-900 dark:text-white font-extrabold">₹{prod.price.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{prod.stock} units left</p>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-gray-500"
                        title="Edit Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="p-2 border border-red-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-750 flex-shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" /> {editProduct ? 'Edit Product Details' : 'Create Product Entry'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs font-semibold">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-450">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-gray-450">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-gray-450">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                    >
                      {categories.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-450">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-450">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-450">Stock Available</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-gray-450">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="3"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Checkboxes Row */}
              <div className="flex gap-6 border-y border-gray-100 dark:border-slate-750 py-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="rounded text-primary-500 focus:ring-primary-500 h-4.5 w-4.5"
                  />
                  <span>Trending Item</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isDeal}
                    onChange={(e) => setIsDeal(e.target.checked)}
                    className="rounded text-primary-500 focus:ring-primary-500 h-4.5 w-4.5"
                  />
                  <span>Today's Deal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isFlashSale}
                    onChange={(e) => setIsFlashSale(e.target.checked)}
                    className="rounded text-primary-500 focus:ring-primary-500 h-4.5 w-4.5"
                  />
                  <span>Flash Sale</span>
                </label>
              </div>

              {/* Image files upload */}
              <div className="space-y-1.5">
                <label className="text-gray-450">Upload Product Images (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full cursor-pointer text-xs"
                />
              </div>

              {/* Specifications Sub-fields */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold uppercase text-[10px] text-gray-400">Specifications (Key-Values)</h4>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs font-bold text-primary-500 hover:text-primary-600"
                  >
                    + Add row
                  </button>
                </div>

                <div className="space-y-2.5">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. RAM)"
                        value={spec.name}
                        onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-250 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 16GB)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-255 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(index)}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-750 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-primary-500/20"
                >
                  {loading && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
