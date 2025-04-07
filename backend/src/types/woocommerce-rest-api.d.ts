declare module '@woocommerce/woocommerce-rest-api' {
  interface WooCommerceRestApiOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version?: string;
    wpAPIPrefix?: string;
    queryStringAuth?: boolean;
    timeout?: number;
    axiosConfig?: any;
  }

  class WooCommerceRestApi {
    constructor(options: WooCommerceRestApiOptions);
    get(endpoint: string, params?: any): Promise<any>;
    post(endpoint: string, data: any, params?: any): Promise<any>;
    put(endpoint: string, data: any, params?: any): Promise<any>;
    delete(endpoint: string, params?: any): Promise<any>;
    options(endpoint: string, params?: any): Promise<any>;
  }

  export = WooCommerceRestApi;
}
