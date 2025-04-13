declare module 'morgan' {
  import { RequestHandler } from 'express';
  
  interface FormatFn {
    (tokens: TokenIndexer, req: any, res: any): string;
  }
  
  interface TokenCallbackFn {
    (req: any, res: any, arg?: string | number | boolean): string;
  }
  
  interface TokenIndexer {
    [tokenName: string]: TokenCallbackFn;
  }
  
  interface Morgan {
    (format: string | FormatFn, options?: Options): RequestHandler;
    compile: (format: string) => FormatFn;
    format(name: string, fmt: string | FormatFn): Morgan;
    token(name: string, callback: TokenCallbackFn): Morgan;
    
    // Common formats
    combined: string;
    common: string;
    dev: string;
    short: string;
    tiny: string;
  }
  
  interface Options {
    immediate?: boolean;
    skip?: (req: any, res: any) => boolean;
    stream?: { write: (str: string) => void };
  }
  
  const morgan: Morgan;
  export = morgan;
}
