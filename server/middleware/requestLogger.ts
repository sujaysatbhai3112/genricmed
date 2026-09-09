/**
 * Request logger middleware
 * Logs all incoming API requests with method, URL, status, and duration
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';
    console.log(`${color} ${method} ${url} → ${statusCode} (${duration}ms)`);
  });

  next();
}
