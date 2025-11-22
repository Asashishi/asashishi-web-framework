import type { AsashishiRouterMethod } from '../types';
import { globalPrevHandleChain, routerMap } from '../lib/router_and_cros';

function AsashishiDevInfo(routes: Record<string, any>): void {
  const pathArray: string[] = Object.keys(routes).sort((x: string, y: string) => x.length - y.length);
  for (const path of pathArray) {
    let info: string = '';
    const handler: any = routes[path];
    const methods: string[] = Object.keys(handler);
    const baseHandlersCount: number = globalPrevHandleChain.length;
    for (const method of methods) {
      if (method === 'OPTIONS') info += `\x1b[93m${method}\x1b[90m[\x1b[94m1\x1b[90m]\x1b[0m, `;
      else info += `\x1b[93m${method}\x1b[90m[\x1b[94m${(routerMap[method as AsashishiRouterMethod]?.get(path)?.prevHandlechain.length! + baseHandlersCount || baseHandlersCount) + 1}\x1b[90m]\x1b[97m, `;
    }
    console.log(`\x1b[96mPath: \x1b[97m${path}\x1b[0m \x1b[90m-> \x1b[92mHandlers:\x1b[0m ${info.slice(0, -2)}\x1b[0m`);
  };
};
export default AsashishiDevInfo;