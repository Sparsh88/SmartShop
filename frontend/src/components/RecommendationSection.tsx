import { useQuery } from '@tanstack/react-query';
import { Sparkles, Bot, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './LoadingSkeleton';
import {
  recommendationApi,
  RecommendationApiResponse,
} from '../services/recommendationApi';
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from './ScrollReveal';

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
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className={`space-y-6 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-[#F4F3EF] dark:bg-[#1E1E22] text-neutral-900 dark:text-white border border-neutral-300/60 dark:border-neutral-700/60">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-1"></div>
            <div className="h-3.5 w-72 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
          </div>
        </div>
        <ProductGridSkeleton count={limit} />
      </section>
    );
  }

  const recommendations = data?.recommendations || [];

  if (isError || recommendations.length === 0) {
    return null;
  }

  const isAiPowered = data?.source === 'gemini-ai' || recommendations.some((r) => r.isAiGenerated);

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header with AI Pill and Subtitle */}
      <ScrollReveal direction="up" distance={20} duration={0.6}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-1.5 bg-[#F4F3EF] dark:bg-[#1E1E22] border border-neutral-300/80 dark:border-neutral-700/80 text-neutral-900 dark:text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {isAiPowered ? (
                  <>
                    <Bot size={12} />
                    <span>AI Tailored</span>
                  </>
                ) : (
                  <>
                    <Zap size={12} />
                    <span>Smart Recommendation</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">Real-Time Engine</span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">{subtitle}</p>
          </div>

          {showViewAll && (
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white hover:opacity-75 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              Explore Catalog <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </ScrollReveal>

      {/* Grid of Product Cards with AI Reason Pills */}
      <ScrollRevealGroup staggerDelay={0.1} delayChildren={0.05} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {recommendations.map((item, index) => (
          <ScrollRevealItem key={item.product.id || index} direction="up" distance={30}>
            <div className="flex flex-col h-full space-y-2">
              <div className="flex-grow">
                <ProductCard product={item.product as any} />
              </div>

              {item.reason && (
                <div className="bg-white dark:bg-[#161618] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl px-3.5 py-2 flex items-start gap-2 shadow-soft-sm">
                  <Sparkles size={13} className="text-neutral-900 dark:text-white shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug line-clamp-2">
                    <span className="font-bold text-neutral-900 dark:text-white">Why pick: </span>
                    {item.reason}
                  </p>
                </div>
              )}
            </div>
          </ScrollRevealItem>
        ))}
      </ScrollRevealGroup>
    </section>
  );
}
