declare module 'csv-parse' {
  import { Transform } from 'stream';
  
  interface Options {
    delimiter?: string;
    quote?: string;
    escape?: string;
    columns?: boolean | string[] | ((record: string[]) => string[]);
    comment?: string;
    relax_column_count?: boolean;
    relax_quotes?: boolean;
    skip_empty_lines?: boolean;
    trim?: boolean;
    ltrim?: boolean;
    rtrim?: boolean;
    auto_parse?: boolean;
    auto_parse_date?: boolean;
    cast?: boolean;
    cast_date?: boolean;
    from?: number;
    to?: number;
    skip_lines_with_empty_values?: boolean;
    skip_lines_with_error?: boolean;
    max_record_size?: number;
    record_delimiter?: string | string[];
    [key: string]: any;
  }
  
  interface Parser extends Transform {
    options: Options;
  }
  
  interface Callback {
    (err: Error | undefined, records: any[], info: any): void;
  }
  
  function parse(input: Buffer | string, options?: Options, callback?: Callback): Parser;
  function parse(options?: Options, callback?: Callback): Parser;
  
  namespace parse {
    function parse(input: Buffer | string, options?: Options, callback?: Callback): Parser;
    function parse(options?: Options, callback?: Callback): Parser;
  }
  
  export = parse;
}
