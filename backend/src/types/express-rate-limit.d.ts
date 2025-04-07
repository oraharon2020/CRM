declare module 'express-rate-limit' {
  import { Request, Response, NextFunction, RequestHandler } from 'express';
  
  interface RateLimitRequestHandler extends RequestHandler {
    resetKey(key: string): void;
  }
  
  interface Options {
    windowMs?: number;
    max?: number;
    message?: any;
    statusCode?: number;
    headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    requestWasSuccessful?: (req: Request, res: Response) => boolean;
    skip?: (req: Request, res: Response) => boolean;
    keyGenerator?: (req: Request, res: Response) => string;
    handler?: (req: Request, res: Response, next: NextFunction, options: Options) => void;
    onLimitReached?: (req: Request, res: Response, options: Options) => void;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    store?: any;
    draft_polli_ratelimit_headers?: boolean;
  }
  
  function rateLimit(options?: Options): RateLimitRequestHandler;
  
  export = rateLimit;
}
