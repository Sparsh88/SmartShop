import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/LoaderSkeletons';
import { 
  SlidersHorizontal, 
  Search, 
  Camera, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Shop = ({ onToast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL queries
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';

  // Local state filters
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Data fetching state
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // AI-Assisted search details from backend
  const [aiRouted, setAiRouted] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  // Image Upload state for Visual Search
  const [visualSearchLoading, setVisualSearchLoading] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState(null);

  // Options loaded from catalog
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState(['Dell', 'HP', 'Lenovo', 'Puma', 'Adidas', 'boAt', 'Sony', 'ErgoSteel']);

  // Sync state search with URL search change
  useEffect(() => {
    setSearch(urlSearch);
    setCategory(urlCategory);
    setPage(1); // Reset page on query change
  }, [urlSearch, urlCategory]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    loadCategories();
  }, []);

  // Fetch products based on filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8,
        sort
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (brand) params.brand = brand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;
      if (inStock) params.inStock = 'true';

      const { data } = await api.get('/products', { params });
      
      setProducts(data.products);
      setTotalPages(data.pages);
      setTotalProducts(data.total);
      
      // AI check
      setAiRouted(data.isAiRouted || false);
      setAiExplanation(data.aiExplanation || '');
      setDetectedProduct(null); // Clear image search state when normal search runs
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, brand, rating, inStock, sort, page, urlSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search.trim() ? { search: search.trim() } : {});
  };

  // Image upload triggers visual search
  const handleVisualSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVisualSearchLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      onToast('AI recognizing image details... 🤖');
      const { data } = await api.post('/products/visual-search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProducts(data.products);
      setDetectedProduct(data.detectedProduct);
      setTotalPages(1);
      setTotalProducts(data.products.length);
      setAiRouted(false);
      
      onToast(`Visual match: ${data.detectedProduct}! ✨`);
    } catch (error) {
      console.error('Visual Search failed:', error.message);
      onToast('Visual Search failed, please try another image.');
    } finally {
      setVisualSearchLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    setSort('newest');
    setSearchParams({});
    setDetectedProduct(null);
    setAiRouted(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Smart Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Filter, sort, or utilize AI visual matching to find products</p>
        </div>

        {/* Visual Search file uploader */}
        <label className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/30 dark:hover:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold px-4 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm text-xs border border-primary-100 dark:border-primary-900/50">
          {visualSearchLoading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <Camera className="h-4.5 w-4.5" />
          )}
          <span>{visualSearchLoading ? 'Analyzing...' : 'Visual Search'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleVisualSearch}
            className="hidden"
            disabled={visualSearchLoading}
          />
        </label>
      </div>

      {/* AI Smart Search Indicator Banner */}
      {aiRouted && (
        <div className="bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md flex items-start gap-4 mx-1 border border-rose-400/20">
          <Sparkles className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
              <span>🔍 No such product found in inventory</span>
            </h4>
            <p className="text-xs font-bold text-rose-100 mt-1">
              But you can shop similar items recommended by our AI below:
            </p>
            <p className="text-xs text-indigo-100 mt-2 bg-black/25 px-3.5 py-2.5 rounded-xl leading-relaxed border border-white/5 font-medium">
              {aiExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Visual Search detected banner */}
      {detectedProduct && (
        <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <Check className="h-5 w-5 bg-white/20 p-0.5 rounded-full" />
          <p className="text-sm font-bold">Visually matched products for: <span className="underline font-black">{detectedProduct}</span></p>
        </div>
      )}

      {/* 2. Main content grids */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-6 h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors font-semibold"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Search form in sidebar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500"
            />
            <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-primary-500">
              <Search className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Category selection */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Categories</h4>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => setCategory('')}
                className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  !category ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-500 font-bold' : 'hover:bg-gray-50 dark:hover:bg-slate-700/55'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.name)}
                  className={`text-xs text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    category === cat.name ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-500 font-bold' : 'hover:bg-gray-50 dark:hover:bg-slate-700/55'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand selection */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Brands</h4>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Price Range selection */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Price limits (₹)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-2.5 py-2 rounded-lg text-center"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-2.5 py-2 rounded-lg text-center"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold py-2 rounded-xl mt-2 shadow-sm transition-colors"
            >
              Apply Price
            </button>
          </div>

          {/* Star ratings selection */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Rating Limit</h4>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-3.5 py-2.5 rounded-xl"
            >
              <option value="">All Ratings</option>
              <option value="4.5">⭐⭐⭐⭐⭐ 4.5 & up</option>
              <option value="4.0">⭐⭐⭐⭐ 4.0 & up</option>
              <option value="3.0">⭐⭐⭐ 3.0 & up</option>
            </select>
          </div>

          {/* Stock availability toggle */}
          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4 bg-gray-50 border-gray-200"
            />
            <span>Exclude Out of Stock</span>
          </label>
        </aside>

        {/* PRODUCTS GRID LIST */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Top Sort controller */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm text-xs font-medium">
            <p className="text-gray-500 dark:text-gray-400">Showing <span className="font-bold text-gray-800 dark:text-white">{totalProducts}</span> products</p>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))
            ) : products.length > 0 ? (
              products.map(prod => (
                <ProductCard key={prod._id} product={prod} onToast={onToast} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="font-extrabold text-lg text-gray-800 dark:text-white">No products match the filters</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">Try clearing search terms or resetting filters in the sidebar panel.</p>
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </button>
              <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default Shop;
