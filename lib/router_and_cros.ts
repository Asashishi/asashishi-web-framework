import type {
  AsashishiRouterMethod,
  RouterMap,
  AsashishiRouterStorage,
  AsashishiRequest,
  AsashishiResponse,
  AsashishiRouterConfig,
  AsashishiCrosConfigMap,
  AsashishiBunNativeConfigMap,
  AsashishiRouterGroupBase,
} from '../types';
import { METHOD } from '../definitions/consts';
import isValidUrl from '../utils/is_valid_url';
import { alreadyHashandleFuncAt, processerOfRouterIsEmptyCanNotUseMiddleware, NO_SUCH_ROUTER } from '../definitions/errors';
import { nanoseconds } from 'bun';

const routerMap: RouterMap = {
  'GET': new Map(),
  'PUT': new Map(), 
  'POST': new Map(),
  'DELETE': new Map(),
};
const globalPrevHandleChain: Function[] = [];
const crosConfigMap: AsashishiCrosConfigMap = new Map();
const bunNativeConfigMap: AsashishiBunNativeConfigMap = new Map();
let globalCrosConfig: Record<string, string> | undefined = undefined;

function register(info: {
  url: string,
  groupUid: string,
  method: AsashishiRouterMethod,
  config: AsashishiRouterConfig,
  func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>,
}): void {
  const { url, method, func, config, groupUid } = info;
  const map: Map<string, AsashishiRouterStorage> = routerMap[method]!;
  if (!map.has(url)) {
      const urlParts: string[] = url.split("/");
      const paramKeys: { idx: number, key: string }[] = [];
      for (let i: number = 0; i < urlParts.length; i++) if (urlParts[i]![0] === ':') paramKeys.push({ idx: i, key: urlParts[i]!.slice(1) })
      map.set(url, { groupUid, processer: func, prevHandlechain: [], config, paramKeys: paramKeys });
  }
  else throw alreadyHashandleFuncAt(url);
};

function getGlobalCros(): Record<string, string> | undefined { return globalCrosConfig };
function globalCros(config: Record<string, string>): void { globalCrosConfig = config };
function crosRegister(url: string, config: Record<string, string>, noFormat?: boolean): void {
  if (!noFormat) crosConfigMap.set(isValidUrl(url), config);
  else crosConfigMap.set(url, config);
};

function globalUse(func: ((req: AsashishiRequest, res: AsashishiResponse) => Promise<boolean>) | (() => Promise<boolean>)): void { globalPrevHandleChain.push(func); }
function singleUse(
  url: string, method: AsashishiRouterMethod,
  func: ((req: AsashishiRequest, res: AsashishiResponse) => Promise<boolean>) | (() => Promise<boolean>),
  noFormat?: boolean,
): void {
  if (!noFormat) url = isValidUrl(url);
  const map: Map<string, AsashishiRouterStorage> = routerMap[method]!;
  if (map.has(url)) {
    const processer: Function | undefined = map.get(url)?.processer;
    if (!processer) throw processerOfRouterIsEmptyCanNotUseMiddleware(url);
    else map.get(url)!.prevHandlechain.push(func);
  } else throw NO_SUCH_ROUTER;
};

function getRegister(url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config: AsashishiRouterConfig, groupUid: string): void { register({url, method: 'GET', func, config, groupUid}) };
function putRegister(url: string, func:  (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config: AsashishiRouterConfig, groupUid: string): void { register({url, method: 'PUT', func, config, groupUid}) };
function postRegister(url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config: AsashishiRouterConfig, groupUid: string): void { register({url, method: 'POST', func, config, groupUid}) };
function deleteRegister(url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config: AsashishiRouterConfig, groupUid: string): void { register({url, method: 'DELETE', func, config, groupUid}) };

const routerGroup = (url: string = '/'): AsashishiRouterGroupBase => {
  const baseUrl: string = isValidUrl(url);
  const groupUid: string = nanoseconds() + baseUrl;
  const group: AsashishiRouterGroupBase = {
    USE: (func: ((req: AsashishiRequest, res: AsashishiResponse) => Promise<boolean>) | (() => Promise<boolean>)): void => {
      for (const key of METHOD) {
        const map: Map<string, AsashishiRouterStorage> = routerMap[key as AsashishiRouterMethod]!;
        for (const storage of map.values()) {
            if (!storage.processer) throw NO_SUCH_ROUTER;
            if (storage.groupUid === groupUid) storage.prevHandlechain.push(func);
        }
      };
    },
    GR_CROS: (config: Record<string, string>): void => {
      for (const key of METHOD) {
        const map: Map<string, AsashishiRouterStorage> = routerMap[key as AsashishiRouterMethod]!;
        for (const [url, storage] of map.entries()) {
            if (!storage.processer) throw NO_SUCH_ROUTER;
            if (storage.groupUid === groupUid) crosRegister(url, config, true);
        }
      };
    },
    GET: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => getRegister(isValidUrl(baseUrl, url), func, { accept: 'request', ...config }, groupUid),
    PUT: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => putRegister(isValidUrl(baseUrl, url), func, { accept: 'json', ...config }, groupUid),
    POST: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => postRegister(isValidUrl(baseUrl, url), func, { accept: 'json', ...config }, groupUid),
    DELETE: (url: string, func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => deleteRegister(isValidUrl(baseUrl, url), func, { accept: 'request', ...config }, groupUid),
    GR_GET: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => group.GET('', func, { accept: 'request', ...config }),
    GR_PUT: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig ): void => group.PUT('', func, { accept: 'json', ...config }),
    GR_POST: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => group.POST('', func, { accept: 'json', ...config }),
    GR_DELETE: (func: (req: AsashishiRequest, res: AsashishiResponse) => Promise<void>, config?: AsashishiRouterConfig): void => group.DELETE('', func, { accept: 'request', ...config }),
  };
  return group;
};

export {
  register,
  globalUse,
  globalCros,
  routerMap,
  singleUse,
  routerGroup,
  crosRegister,
  crosConfigMap,
  getGlobalCros,
  bunNativeConfigMap,
  globalPrevHandleChain,
};