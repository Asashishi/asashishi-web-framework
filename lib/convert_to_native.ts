import { nanoseconds, } from 'bun';
import type { BodyInit, Server } from 'bun';
import type {
    AsashishiRequest,
    AsashishiResponse,
    AsashishiRouterStorage,
    AsashishiRouterMethod,
    AsashishiBunNativeConfig,
} from '../types';
import logFunc from './logger';
import { CROS_ALL } from '../definitions/consts';
import { crosConfigMap, getGlobalCros, bunNativeConfigMap, routerMap, globalPrevHandleChain } from './router_and_cros';
import { buildAsashishiRequest, buildAsashishiResponse } from '../utils/handler_tools';

async function asashishiHandlerForNative(req: Request, server: Server<any>, storage: AsashishiRouterStorage, productionMode?: boolean): Promise<Response> {
  const startAt: number = nanoseconds();
  let isNext: boolean = true;
  let countOfGlobalHandle: number = 0;
  let countOfRouterHandle: number = 0;
  const reqUrl: URL = new URL(req.url);
  const flag: { isAbort: boolean } = { isAbort: false };
  const { processer, prevHandlechain, config, paramKeys } = storage;
  const requestedHeaders: string = req.headers.get("Access-Control-Request-Headers") || '';
  const crosConfig: Record<string, string> | undefined = {
    ...getGlobalCros(),
    ...(productionMode ? crosConfigMap.get(reqUrl.pathname) : { ...CROS_ALL, 'Access-Control-Allow-Headers': requestedHeaders }),
  };
  const responseContent: { body: BodyInit | null | undefined, init: ResponseInit | undefined } = { body: null, init: { status: 200, headers: {} } };
  const request: AsashishiRequest = await buildAsashishiRequest(req, server, reqUrl, config!, paramKeys);
  const response: AsashishiResponse = buildAsashishiResponse(responseContent, flag, productionMode);
  if (globalPrevHandleChain.length > 0) while (isNext && countOfGlobalHandle < globalPrevHandleChain.length) isNext = await globalPrevHandleChain[countOfGlobalHandle++]!(request, response);
  if (isNext) {
    while (prevHandlechain.length > 0 && countOfRouterHandle < prevHandlechain.length) isNext = await prevHandlechain[countOfRouterHandle++]!(request, response);
    if (isNext) await processer(request, response);
  };
  responseContent.init = {
    ...responseContent.init,
    headers: {
      ...crosConfig,
      ...responseContent.init!.headers as Record<string, string>,
      ...(!productionMode ? { 'X-POWERED-BY': 'Asashishi' } : undefined),
    },
  };
  if (logFunc.logger) logFunc.logger({
    req: { timeAt: startAt, data: req },
    res: { timeAt: nanoseconds(), data: responseContent },
  });
  return new Response(responseContent.body, responseContent.init);
};

function buildasashishiHandlerForNative(url: string, method: AsashishiRouterMethod, storage: AsashishiRouterStorage, productionMode?: boolean): void {
  let bunServeConfig: AsashishiBunNativeConfig | undefined = bunNativeConfigMap.get(url);
  if (!bunServeConfig) {
    bunServeConfig = {};
    bunNativeConfigMap.set(url, bunServeConfig);
  }
  bunServeConfig[method!] = async function (req: Request, server: Server<any>): Promise<Response> { return asashishiHandlerForNative(req, server, storage, productionMode) };
};

function buildAsashishiOptionsHndlerForNative(url: string, crosConfig: Record<string, string>): void {
  let bunServeConfig: AsashishiBunNativeConfig | undefined = bunNativeConfigMap.get(url);
  if (!bunServeConfig) {
    bunServeConfig = {};
    bunNativeConfigMap.set(url, bunServeConfig);
  }
  const methods: string[] = Object.keys(bunServeConfig);
  for (const method of methods) {
    if (method === 'POST' || method === 'PUT') {
      bunServeConfig.OPTIONS = async function () { return new Response(null, { status: 204, headers: crosConfig }) };
      break;
    }
  }
};

function convertAsashishiToBunNative(productionMode?: boolean): void {
  for (const [method, map] of Object.entries(routerMap)) for (const [url, storage] of map.entries()) buildasashishiHandlerForNative(url, method as AsashishiRouterMethod, storage, productionMode);
  if (productionMode) for (const [url, crosConfig] of crosConfigMap.entries()) buildAsashishiOptionsHndlerForNative(url, crosConfig);
  else for (const [, config] of bunNativeConfigMap.entries()) {
    const methods: string[] = Object.keys(config);
    for (const method of methods) {
      if (method === 'POST' || method === 'PUT') {
        config.OPTIONS = async (req) => {
          const requestedHeaders: string = req.headers.get("Access-Control-Request-Headers") || '';
          return new Response(null, { status: 204, headers: { ...CROS_ALL, 'Access-Control-Allow-Headers': requestedHeaders } });
        }
        break;
      }
    }
  }
};

export default convertAsashishiToBunNative;