import type { BodyInit, Server } from 'bun';
import {
    type AsashishiAccept,
    type AsashishiRequest,
    AsashishiResponse,
    type AsashishiRouterStorage,
    type AsashishiRouterMethod,
    type AsashishiRouterConfig,
} from '../types';
import { routerMap } from '../lib/router_and_cros'; 
import {
  NO_SUCH_PARSE_MODE,
  PARSE_MODE_NOT_MATCH,
} from '../definitions/errors';
import { NO_SUCH_ROUTER_CHAIN, UN_SUPPORT_METHOD } from '../definitions/consts';

export async function getReqBody(req: Request, accept: AsashishiAccept): Promise<any> {
  try {
    switch (accept) {
      case 'json':
        return (await req.json());
      case 'form':
        return (await req.formData());
      case 'text':
        return (await req.text());
      case 'request':
        return undefined;
      default:
        throw NO_SUCH_PARSE_MODE;
    };
  } catch {
    throw PARSE_MODE_NOT_MATCH;
  }
};

export function getRequestParams(pathname: string, paramKeys: { idx: number, key: string }[] | undefined): Record<string, string> | undefined {
  if (paramKeys) {
    const params: Record<string, string> = {};
    const urlParts: string[] = pathname.split('/');
    for (const paramSet of paramKeys) params[paramSet.key] = urlParts[paramSet.idx]!;
    return params;
  };
};

export function getRouterMap(method: string, responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined }, flag: { isAbort: boolean }): Map<string, AsashishiRouterStorage> | undefined {
  if (!flag.isAbort) {
    const map: Map<string, AsashishiRouterStorage> | undefined = routerMap[method as AsashishiRouterMethod];
    if (!map) {
        flag.isAbort = true;
        responseContent.init = { status: 400 };
        responseContent.body = UN_SUPPORT_METHOD;
    }
    return map;
  }
};

export function getAsashishiRouterStorage(pathname: string, map: Map<string, AsashishiRouterStorage>, responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined }, flag: { isAbort: boolean }): AsashishiRouterStorage | undefined {
  const storage: AsashishiRouterStorage | undefined = map.get(pathname);
  if (!storage) {
      flag.isAbort = true;
      responseContent.init = { status: 404 };
      responseContent.body = NO_SUCH_ROUTER_CHAIN;
  };
  return storage;
};

export async function buildAsashishiRequest(req: Request, server: Server<any>, reqUrl: URL, config: AsashishiRouterConfig, paramKeys?: { idx: number, key: string }[]): Promise<AsashishiRequest> {
  const { paramsParse, accept } = config;
  const formatedRequest: any = await getReqBody(req, accept!);
  return {
    server,
    slot: {},
    url: req.url,
    method: req.method,
    headers: req.headers,
    path: reqUrl.pathname,
    query: reqUrl.searchParams,
    ...(formatedRequest ? { body: formatedRequest } : { raw: req }),
    params: paramsParse ? getRequestParams(reqUrl.pathname, paramKeys!) : undefined,
  };
};

export function buildAsashishiResponse(responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined }, flag: { isAbort: boolean }, productionMode: boolean = false): AsashishiResponse {
  return new AsashishiResponse(productionMode, flag, responseContent);
}