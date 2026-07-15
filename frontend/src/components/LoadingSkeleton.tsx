export function ProductCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-56 bg-slate-800"></div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
        <div className="h-6 bg-slate-800 rounded w-3/4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/4"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-9 bg-slate-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-800 rounded-2xl w-full"></div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-slate-800 rounded-lg"></div>
            <div className="w-20 h-20 bg-slate-800 rounded-lg"></div>
            <div className="w-20 h-20 bg-slate-800 rounded-lg"></div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="space-y-6">
          <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-slate-800 rounded w-20"></div>
            <div className="h-4 bg-slate-800 rounded w-12"></div>
          </div>
          <div className="h-6 bg-slate-800 rounded w-28"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-800 rounded w-4/5"></div>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-slate-800 rounded-full w-40"></div>
            <div className="h-12 bg-slate-800 rounded-full w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Chart and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-slate-900 border border-slate-800 rounded-xl"></div>
        <div className="h-80 bg-slate-900 border border-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}
