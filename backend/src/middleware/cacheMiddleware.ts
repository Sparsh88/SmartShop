import { Request, Response, NextFunction } from 'express';

/**
 * Cache control middleware to configure caching headers for public GET routes.
 * s-maxage instructs CDNs (like Vercel Edge Network) to cache the response.
 * max-age instructs the browser to cache the response locally.
 * stale-while-revalidate allows the CDN to serve stale content while fetching fresh data in the background.
 *
 * @param durationSeconds Cache duration in seconds
 */
export const cacheControl = (durationSeconds: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set(
        'Cache-Control',
        `public, max-age=60, s-maxage=${durationSeconds}, stale-while-revalidate=${durationSeconds * 2}`
      );
    }
    next();
  };
};
