declare module 'multer' {
  import { Request, RequestHandler } from 'express';
  
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  
  interface MulterRequest extends Request {
    file: File;
    files: {
      [fieldname: string]: File[];
    } | File[];
  }
  
  interface StorageEngine {
    _handleFile(req: Request, file: Express.Multer.File, callback: (error?: any, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, callback: (error: Error) => void): void;
  }
  
  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: Express.Multer.File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => void;
  }
  
  interface MemoryStorageOptions {}
  
  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?(req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void): void;
  }
  
  interface Multer {
    (options?: MulterOptions): Multer;
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: Array<{ name: string; maxCount?: number }>): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
    diskStorage(options: DiskStorageOptions): StorageEngine;
    memoryStorage(options?: MemoryStorageOptions): StorageEngine;
  }
  
  const multer: Multer;
  export = multer;
}
