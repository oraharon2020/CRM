declare module 'express' {
  import { Server } from 'http';
  
  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
    cookies: any;
    path: string;
    url: string;
    originalUrl: string;
    method: string;
    protocol: string;
    secure: boolean;
    ip: string;
    ips: string[];
    subdomains: string[];
    hostname: string;
    host: string;
    fresh: boolean;
    stale: boolean;
    xhr: boolean;
    user?: any;
    [key: string]: any;
  }
  
  export interface Response {
    status(code: number): Response;
    send(body: any): Response;
    json(body: any): Response;
    jsonp(body: any): Response;
    sendFile(path: string): Response;
    sendStatus(code: number): Response;
    download(path: string): Response;
    contentType(type: string): Response;
    type(type: string): Response;
    format(obj: any): Response;
    attachment(filename?: string): Response;
    set(field: any): Response;
    set(field: string, value?: string): Response;
    header(field: any): Response;
    header(field: string, value?: string): Response;
    get(field: string): string;
    clearCookie(name: string, options?: any): Response;
    cookie(name: string, val: string, options?: any): Response;
    location(url: string): Response;
    redirect(url: string): Response;
    redirect(status: number, url: string): Response;
    render(view: string, options?: any, callback?: (err: Error, html: string) => void): void;
    locals: any;
    charset: string;
    [key: string]: any;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }
  
  export type RouterHandler = RequestHandler | Router;
  
  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
  }
  
  export interface Application {
    use(handler: RouterHandler): Application;
    use(path: string, handler: RouterHandler): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    patch(path: string, ...handlers: RequestHandler[]): Application;
    options(path: string, ...handlers: RequestHandler[]): Application;
    head(path: string, ...handlers: RequestHandler[]): Application;
    all(path: string, ...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): Server;
    listen(port: number, hostname: string, callback?: () => void): Server;
    set(setting: string, val: any): Application;
    engine(ext: string, fn: Function): Application;
    _router: any;
    [key: string]: any;
  }
  
  export interface Router {
    use(handler: RequestHandler): Router;
    use(path: string, handler: RequestHandler): Router;
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    put(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
    patch(path: string, ...handlers: RequestHandler[]): Router;
    options(path: string, ...handlers: RequestHandler[]): Router;
    head(path: string, ...handlers: RequestHandler[]): Router;
    all(path: string, ...handlers: RequestHandler[]): Router;
    route(path: string): Router;
    [key: string]: any;
  }
  
  export function Router(options?: any): Router;
  
  export interface Express extends Application {
    request: Request;
    response: Response;
    Router: typeof Router;
    [key: string]: any;
  }
  
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;
  export function static(root: string, options?: any): RequestHandler;
  
  namespace express {
    export function json(options?: any): RequestHandler;
    export function urlencoded(options?: any): RequestHandler;
    export function static(root: string, options?: any): RequestHandler;
  }
  
  export default function createApplication(): Express;
}
