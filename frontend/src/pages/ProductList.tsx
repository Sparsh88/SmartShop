import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingSkeleton';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles, ChevronRight as BreadcrumbArrow, X } from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from '../components/ScrollReveal';

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
    staleTime: 60 * 1000,
  });

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (category) newParams.set('category', category);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-page-enter">
      
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 mb-6">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition">Home</Link>
        <BreadcrumbArrow size={12} />
        <Link to="/products" className="hover:text-neutral-900 dark:hover:text-white transition">Catalog</Link>
        {category && (
          <>
            <BreadcrumbArrow size={12} />
            <span className="text-neutral-900 dark:text-white capitalize">{category}</span>
          </>
        )}
      </div>

      {/* Header Summary & Sort Bar */}
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              Curated Collection
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
              {search ? `Search results for "${search}"` : 'All Products'}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1">
              Showing {data?.products?.length || 0} of {data?.pagination?.totalProducts || 0} items
            </p>
          </div>

          {/* Sort & Mobile Filter CTA */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 text-neutral-900 dark:text-white px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            
            <div className="flex items-center gap-2 bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 px-4 py-2.5 rounded-full text-xs shadow-sm">
              <ArrowUpDown size={14} className="text-neutral-400" />
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-transparent text-neutral-900 dark:text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="latest" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Latest Arrivals</option>
                <option value="price-asc" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Price: High to Low</option>
                <option value="rating" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Clothing Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {[
            { label: 'All Items', category: '' },
            { label: 'T-Shirts', category: 't-shirts' },
            { label: 'Shirts', category: 'shirts' },
            { label: 'Jeans', category: 'jeans' },
            { label: 'Pants & Trousers', category: 'pants-trousers' },
            { label: 'Jackets', category: 'jackets' },
            { label: 'Hoodies', category: 'hoodies' },
            { label: 'Sweaters', category: 'sweaters' },
            { label: 'Sneakers', category: 'sneakers' },
            { label: 'Shoes', category: 'shoes' },
            { label: 'Full Sets', category: 'full-sets' },
          ].map((pill, idx) => {
            const isSelected = (!pill.category && !category) || (pill.category === category);

            return (
              <button
                key={idx}
                onClick={() => {
                  const newParams = new URLSearchParams();
                  if (pill.category) newParams.set('category', pill.category);
                  if (sort && sort !== 'latest') newParams.set('sort', sort);
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition shrink-0 ${
                  isSelected
                    ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-soft-xs'
                    : 'bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SIDEBAR FILTERS - Desktop & Mobile Drawer */}
        <aside className={`lg:col-span-3 ${
          showMobileFilters 
            ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:static lg:bg-transparent lg:z-auto' 
            : 'hidden lg:block'
        }`}>
          <div className={`${
            showMobileFilters 
              ? 'w-80 h-full bg-white dark:bg-[#161618] p-6 overflow-y-auto shadow-2xl' 
              : 'bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-soft-sm'
          } space-y-6`}>
            
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-editorial text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Refine Selection
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold underline underline-offset-2">
                  Reset
                </button>
                {showMobileFilters && (
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white lg:hidden"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <h4 className="font-editorial font-bold text-xs uppercase tracking-widest text-neutral-400">
                Price Range (₹)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs w-full text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
                <span className="text-neutral-400 font-bold">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="bg-[#F4F3EF] dark:bg-[#1F1F24] border border-neutral-300/80 dark:border-neutral-700 rounded-xl p-2.5 text-xs w-full text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
            </div>

            {/* Ratings */}
            <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <h4 className="font-editorial font-bold text-xs uppercase tracking-widest text-neutral-400">
                Customer Rating
              </h4>
              <div className="flex flex-col gap-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateParam('rating', stars.toString())}
                    className={`text-left text-xs py-2 px-3 rounded-xl font-semibold transition ${
                      rating === stars.toString()
                        ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-[#F4F3EF] dark:hover:bg-[#1E1E22]'
                    }`}
                  >
                    ★ {stars}.0 & Above
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* PRODUCTS GRID SECTION */}
        <main className="lg:col-span-9 space-y-8">
          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : data?.products?.length === 0 ? (
            <ScrollReveal direction="up" distance={20}>
              <div className="text-center py-20 bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 space-y-4 shadow-soft-sm">
                <p className="text-neutral-600 dark:text-neutral-300 font-editorial text-lg font-bold">No products match your current filters</p>
                <p className="text-xs text-neutral-400">Try loosening your search keywords or resetting price and category filters.</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#121212] hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition"
                >
                  Clear All Filters
                </button>
              </div>
            </ScrollReveal>
          ) : (
            <>
              {data?.searchMessage && (
                <ScrollReveal direction="up" distance={15}>
                  <div className="bg-[#F4F3EF] dark:bg-[#1E1E22] border border-neutral-300/80 dark:border-neutral-700 rounded-2xl p-4 flex items-center gap-3 text-neutral-900 dark:text-white text-xs font-medium shadow-soft-sm">
                    <Sparkles className="text-neutral-900 dark:text-white shrink-0" size={18} />
                    <div>
                      <span>{data.searchMessage}</span>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Product Cards Grid */}
              <div 
                key={`${category || 'all'}-${page}-${sort}-${search}-${minPrice}-${maxPrice}-${rating}`} 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-page-enter"
              >
                {data?.products?.map((product: any) => (
                  <div key={product.id} className="transition-all duration-300">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {data?.pagination?.totalPages > 1 && (
                <ScrollReveal direction="up" distance={20}>
                  <div className="flex items-center justify-center gap-2 pt-8 border-t border-neutral-200/80 dark:border-neutral-800">
                    <button
                      disabled={parseInt(page) === 1}
                      onClick={() => updateParam('page', (parseInt(page) - 1).toString())}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white disabled:opacity-40 flex items-center justify-center transition"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: data.pagination.totalPages }).map((_, idx) => {
                      const pageVal = (idx + 1).toString();
                      return (
                        <button
                          key={idx}
                          onClick={() => updateParam('page', pageVal)}
                          className={`w-9 h-9 rounded-full font-bold text-xs transition ${
                            page === pageVal
                              ? 'bg-[#121212] text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                              : 'bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-900 dark:hover:border-white'
                          }`}
                        >
                          {pageVal}
                        </button>
                      );
                    })}

                    <button
                      disabled={parseInt(page) === data.pagination.totalPages}
                      onClick={() => updateParam('page', (parseInt(page) + 1).toString())}
                      className="w-9 h-9 rounded-full bg-white dark:bg-[#161618] border border-neutral-300/80 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white disabled:opacity-40 flex items-center justify-center transition"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </ScrollReveal>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
