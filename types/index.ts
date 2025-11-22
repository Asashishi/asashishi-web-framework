import type { BodyInit, Server, TLSOptions, WebSocketHandler } from "bun";
import {
  ABORTED,
  ILLEGAL_STATUS,
  CAN_NOT_USE_IN_PRODUCTION_STAGE,
} from '../definitions/errors';

export type AsashishiRedirectMode = 'api' | 'page';
export type AsashishiAccept = 'json' | 'form' | 'text' | 'request';
export type AsashishiRouterMethod =  'GET' | 'POST' | 'PUT' | 'DELETE';
export type AsashishiRouterConfig = {
  paramsParse?: boolean,
  accept?: AsashishiAccept,
};
export type AsashishiRouterStorage = {
  groupUid: string,
  processer: Function,
  prevHandlechain: Function[],
  config: AsashishiRouterConfig,
  paramKeys?: { idx: number, key: string }[]
};
export type AsashishiCrosConfigMap = Map<string, Record<string, string>>;
export type AsashishiBunNativeConfig = Record<string, ((req: Request, server: Server<any>) => Promise<Response>) | (() => Promise<Response>)>;
export type AsashishiBunNativeConfigMap = Map<string, AsashishiBunNativeConfig>;

export type RouterMap = {
  'GET': Map<string, AsashishiRouterStorage>,
  "PUT": Map<string, AsashishiRouterStorage>,
  "POST": Map<string, AsashishiRouterStorage>,
  "DELETE": Map<string, AsashishiRouterStorage>,
};

export type AsashishiURLCache = {
    data: URL,
    storedAt: number,
};

export type AsashishiRequest = {
  body?: any,
  url: string,
  path: string,
  raw?: Request,
  method: string,
  headers: Headers,
  server: Server<any>,
  query: URLSearchParams,
  slot: Record<string, any>,
  params?: Record<string, string>,
};

export class AsashishiResponse {

  private flag: { isAbort: boolean };
  private readonly productionMode: boolean;
  private responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined };

  constructor(productionMode: boolean, flag: { isAbort: boolean }, responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined }) {
    this.flag = flag;
    this.productionMode = productionMode;
    this.responseContent = responseContent;
  };

  public send(data: BodyInit): void {
    if (this.flag.isAbort) throw ABORTED;
    this.flag.isAbort = true;
    this.responseContent.body = data;
  };

  public json(data: Record<string, any>): void {
    if (this.flag.isAbort) throw ABORTED;
    this.flag.isAbort = true;
    this.responseContent.body = JSON.stringify(data);
  };

  public status(code: number): AsashishiResponse {
    if (code > 599 || code < 100) throw ILLEGAL_STATUS;
    if (this.flag.isAbort) throw ABORTED;
    this.responseContent.init = { ...this.responseContent.init, status: code };
    return this;
  };

  public headers(content: Record<string, string>): AsashishiResponse {
    if (this.flag.isAbort) throw ABORTED;
    const headers: Record<string, string> = {
      ...content,
      ...this.responseContent.init?.headers as Record<string, string>,
    };
    this.responseContent.init = { ...this.responseContent.init, headers };
    return this;
  };

  public redirect(location: string, mode: AsashishiRedirectMode = 'page'): void {
    if (this.flag.isAbort) throw ABORTED;
    this.flag.isAbort = true;
    this.responseContent.body = null;
    let newInit: Record<string, any> = this.responseContent.init as Record<string, any>;
    newInit = {
      status: mode === 'api' ? 307 : 302,
      headers: {
        ...this.responseContent.init,
        Location: location,
      },
    };
    this.responseContent.init = newInit as ResponseInit;
  };

  public getResponseContent(): { body: BodyInit | null | undefined, init: ResponseInit | undefined } {
    if (!this.productionMode) return this.responseContent;
    throw CAN_NOT_USE_IN_PRODUCTION_STAGE;
  };

};

export type AsashishiRouterGroupBase = {
  GR_CROS: (config: Record<string, string>) => void,
  USE: (func: ((req: AsashishiRequest, res: AsashishiResponse) => Promise<boolean>) | (() => Promise<boolean>)) => void,
  GR_GET: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  GR_PUT: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  GR_POST: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  GR_DELETE: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  GET: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  PUT: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  POST: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
  DELETE: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig) => void,
};

export type Asashishi = AsashishiRouterGroupBase & { routerGroup: (url: string) => Asashishi };
export type AsashishiRouterGroup = Asashishi;

export type AsashishiLogInfo = {
  req: {
    timeAt: number,
    data: Request,
  },
  res: {
    timeAt: number,
    data: {
        init: ResponseInit | undefined,
        body: Bun.BodyInit | null | undefined,
    },
  },
};
export type AsashishiLogger = (info: AsashishiLogInfo) => Promise<void>;

export type AsashishiServerInit = {
  host?: string,
  port?: number,
  idleTimeout?: number,
  productionMode?: boolean,
  tls?: TLSOptions | TLSOptions[],
  websocket?: WebSocketHandler<any>,
  error?: (error: Error) => Promise<Response>,
};
export type AsashishiServe = (init?: AsashishiServerInit) => Promise<void>;