export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-3.5 space-y-3 shadow-soft-sm animate-pulse">
      <div className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-full"></div>
      <div className="space-y-2 p-1">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/4"></div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full w-12"></div>
        </div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-3/4"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/3"></div>
          <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side: Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-3xl w-full"></div>
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
            <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="space-y-6">
          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/4"></div>
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full w-3/4"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-20"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-12"></div>
          </div>
          <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full w-28"></div>
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full w-4/5"></div>
          </div>
          <div className="flex gap-4 pt-4">
            <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full w-44"></div>
            <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full w-44"></div>
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
          <div key={i} className="h-28 bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 space-y-3">
            <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/3"></div>
            <div className="h-7 bg-neutral-200 dark:bg-neutral-800 rounded-full w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Chart and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl"></div>
        <div className="h-80 bg-white dark:bg-[#161618] border border-neutral-200 dark:border-neutral-800 rounded-3xl"></div>
      </div>
    </div>
  );
}
