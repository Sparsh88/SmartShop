import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Bot, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './LoadingSkeleton';
import {
  recommendationApi,
  RecommendationApiResponse,
} from '../services/recommendationApi';

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  type?: 'personalized' | 'related' | 'cart';
  productId?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function RecommendationSection({
  title = 'Recommended For You',
  subtitle = 'Curated by SmartShop AI based on your preferences & activity',
  type = 'personalized',
  productId,
  limit = 4,
  showViewAll = true,
  className = '',
}: RecommendationSectionProps) {
  const { data, isLoading, isError } = useQuery<RecommendationApiResponse>({
    queryKey: ['recommendations', type, productId || 'global', limit],
    queryFn: async () => {
      if (type === 'related' && productId) {
        return await recommendationApi.getRelated(productId, limit);
      } else if (type === 'cart') {
        return await recommendationApi.getCartRecommendations(limit);
      } else {
        return await recommendationApi.getPersonalized(limit);
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes fresh cache
  });

  if (isLoading) {
    return (
      <section className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <div>
            <div className="h-7 w-48 bg-slate-800 rounded-lg animate-pulse mb-1"></div>
            <div className="h-4 w-72 bg-slate-850 rounded animate-pulse"></div>
          </div>
        </div>
        <ProductGridSkeleton count={limit} />
      </section>
    );
  }

  const recommendations = data?.recommendations || [];

  if (isError || recommendations.length === 0) {
    return null; // Gracefully omit empty recommendations rather than showing broken UI
  }

  const isAiPowered = data?.source === 'gemini-ai' || recommendations.some((r) => r.isAiGenerated);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`space-y-6 ${className}`}
    >
      {/* Header with AI Pill and Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide">
              {isAiPowered ? (
                <>
                  <Bot size={13} className="text-indigo-400" />
                  <span>AI Powered</span>
                </>
              ) : (
                <>
                  <Zap size={13} className="text-amber-400" />
                  <span>Smart Pick</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Real-Time Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">{subtitle}</p>
        </div>

        {showViewAll && (
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1.5 transition-colors duration-200 group self-start sm:self-auto"
          >
            Explore Catalog{' '}
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Grid of Product Cards with AI Explanations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((item, index) => (
          <div key={item.product.id || index} className="flex flex-col h-full space-y-2">
            {/* Standard Product Card */}
            <div className="flex-grow">
              <ProductCard product={item.product as any} />
            </div>

            {/* Smart Reason Chip under Card */}
            {item.reason && (
              <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3 py-2 flex items-start gap-2 shadow-sm">
                <Sparkles size={13} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight line-clamp-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Why recommended: </span>
                  {item.reason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
