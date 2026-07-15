import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read URL parameters
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const sort = searchParams.get('sort') || 'latest';

  // Fetch products query
  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, category, brand, minPrice, maxPrice, rating, sort],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          page,
          search,
          category,
          brand,
          minPrice,
          maxPrice,
          rating,
          sort,
        },
      });
      return res.data;
    },
  });

  // Fetch categories query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/products/categories');
      return res.data.categories;
    },
  });

  // Fetch brands query
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const res = await api.get('/products/brands');
      return res.data.brands;
    },
  });

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset to page 1 on filter update
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page-enter">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-display text-white">
            {search ? `Search results for "${search}"` : 'All Products'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Showing {data?.products?.length || 0} of {data?.pagination?.totalProducts || 0} products
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold hover:border-indigo-500"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS - Desktop */}
        <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6 lg:bg-transparent bg-slate-950 p-6 lg:p-0 rounded-2xl border lg:border-none border-slate-800`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <h3 className="font-bold text-lg text-white">Filter Products</h3>
            <button onClick={clearFilters} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold">
              Reset Filters
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-200">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => updateParam('category', '')}
                className={`text-left text-sm py-1 px-2.5 rounded-lg transition ${
                  !category ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                All Categories
              </button>
              {categoriesData?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`text-left text-sm py-1 px-2.5 rounded-lg transition ${
                    category === cat.slug ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-200">Brands</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => updateParam('brand', '')}
                className={`text-left text-sm py-1 px-2.5 rounded-lg transition ${
                  !brand ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                All Brands
              </button>
              {brandsData?.map((b: string) => (
                <button
                  key={b}
                  onClick={() => updateParam('brand', b)}
                  className={`text-left text-sm py-1 px-2.5 rounded-lg transition ${
                    brand === b ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-200">Price Bounds</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs w-full text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs w-full text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-200">Customer Rating</h4>
            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateParam('rating', stars.toString())}
                  className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition ${
                    rating === stars.toString()
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {stars}★ & Above
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS GRID SECTION */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : data?.products?.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 mb-4 font-semibold text-lg">No such product available</p>
              <button
                onClick={clearFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.products?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {data?.pagination?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-850">
                  <button
                    disabled={parseInt(page) === 1}
                    onClick={() => updateParam('page', (parseInt(page) - 1).toString())}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 disabled:opacity-40 disabled:hover:border-slate-800 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: data.pagination.totalPages }).map((_, idx) => {
                    const pageVal = (idx + 1).toString();
                    return (
                      <button
                        key={idx}
                        onClick={() => updateParam('page', pageVal)}
                        className={`w-9 h-9 rounded-lg font-semibold text-sm transition ${
                          page === pageVal
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 hover:border-indigo-500'
                        }`}
                      >
                        {pageVal}
                      </button>
                    );
                  })}

                  <button
                    disabled={parseInt(page) === data.pagination.totalPages}
                    onClick={() => updateParam('page', (parseInt(page) + 1).toString())}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 disabled:opacity-40 disabled:hover:border-slate-800 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
