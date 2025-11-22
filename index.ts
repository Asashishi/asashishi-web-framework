import type {
  AsashishiLogInfo,
  AsashishiRequest,
  AsashishiResponse,
  AsashishiServerInit,
  AsashishiRouterConfig,
  Asashishi,
  AsashishiRouterGroup,
} from './types';
import { nanoseconds, serve } from "bun";
import {
  globalUse,
  globalCros,
  singleUse,
  crosRegister,
  routerGroup,
  bunNativeConfigMap,
} from "./lib/router_and_cros";
import AsashishiStart from './utils/start';
import isValidUrl from './utils/is_valid_url';
import { loggerRegister } from "./lib/logger";
import AsashishiDevInfo from './utils/dev_info';
import { CROS_ALL } from './definitions/consts';
import convertAsashishiToBunNative from './lib/convert_to_native';

const AsashishiApp = (url: string = '/'): Asashishi => {
  const baseUrl: string = isValidUrl(url);
  return {
    ...routerGroup(baseUrl),
    routerGroup: (url: string) => AsashishiApp(isValidUrl(baseUrl, url)),
  }
};

async function asashishiServe(init?: AsashishiServerInit): Promise<void> {
  const startAt: number = nanoseconds();
  // countMemoryUsage 的处理
  const { host, port, websocket, productionMode, idleTimeout, tls, error } = { 
    port: 3000,
    idleTimeout: 10,
    host: 'localhost',
    websocket: undefined,
    productionMode: false,
    error: async function(error: Error): Promise<Response> {
      return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    },
    ...init,
  };
  const routes: Record<string, any> = {};
  convertAsashishiToBunNative(productionMode);
  for (const [url, handler] of bunNativeConfigMap.entries()) routes[url] = handler;
  serve({
    tls,
    port,
    error,
    idleTimeout,
    hostname: host,
    routes: routes,
    reusePort: true,
    development: false,
    websocket: websocket!, 
  });
  AsashishiStart(host, port, startAt, productionMode);
  if (!productionMode) AsashishiDevInfo(routes);
};

export default AsashishiApp;
export { CROS_ALL, singleUse, globalUse, crosRegister, globalCros, loggerRegister, asashishiServe };
export type { Asashishi, AsashishiRouterGroup, AsashishiLogInfo, AsashishiRequest, AsashishiResponse, AsashishiRouterConfig };