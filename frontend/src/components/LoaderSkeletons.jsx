import React from 'react';

// Product Grid Card Loader
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm p-4 space-y-4">
      <div className="w-full h-48 rounded-xl shimmer"></div>
      <div className="space-y-2">
        <div className="h-4 w-1/3 rounded shimmer"></div>
        <div className="h-6 w-3/4 rounded shimmer"></div>
        <div className="h-4 w-1/2 rounded shimmer"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-1/4 rounded shimmer"></div>
        <div className="h-10 w-10 rounded-full shimmer"></div>
      </div>
    </div>
  );
};

// Product Detailed Loader
export const ProductDetailsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 py-8">
      {/* Images left */}
      <div className="space-y-4">
        <div className="w-full aspect-square rounded-2xl shimmer"></div>
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg shimmer"></div>
          <div className="w-20 h-20 rounded-lg shimmer"></div>
          <div className="w-20 h-20 rounded-lg shimmer"></div>
        </div>
      </div>
      {/* Metadata right */}
      <div className="space-y-6">
        <div className="h-4 w-20 rounded shimmer"></div>
        <div className="h-10 w-3/4 rounded shimmer"></div>
        <div className="h-5 w-24 rounded shimmer"></div>
        <div className="h-8 w-32 rounded shimmer"></div>
        <div className="h-20 w-full rounded shimmer"></div>
        <div className="flex gap-4">
          <div className="h-12 w-36 rounded-full shimmer"></div>
          <div className="h-12 w-36 rounded-full shimmer"></div>
        </div>
      </div>
    </div>
  );
};

// Admin Table Row Loader
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-3">
      {Array(rows).fill(0).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 py-3 border-b border-gray-100 dark:border-slate-800">
          {Array(cols).fill(0).map((_, cIdx) => (
            <div key={cIdx} className="h-5 flex-1 rounded shimmer"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Analytics Dashboard loader
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm space-y-3">
            <div className="h-4 w-1/3 rounded shimmer"></div>
            <div className="h-8 w-1/2 rounded shimmer"></div>
          </div>
        ))}
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl h-80 shimmer"></div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl h-80 shimmer"></div>
      </div>
    </div>
  );
};
