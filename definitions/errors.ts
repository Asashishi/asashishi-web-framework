export const NO_SUCH_ROUTER: Error = new Error('No such router');
export const ABORTED: Error = new Error('Handle flow already abort');
export const ILLEGAL_STATUS: Error = new Error('Illegal status code');
export const NO_SUCH_PARSE_MODE: Error = new Error('No such AcceptType');
export const PARSE_MODE_NOT_MATCH: Error = new Error('AcceptType NotMatch');
export const CAN_NOT_USE_IN_PRODUCTION_STAGE: Error = new Error('Can not use this function at production stage');

export function alreadyHashandleFuncAt(url: string): Error { return new Error(`Already has handle func at ${url}`) };
export function processerOfRouterIsEmptyCanNotUseMiddleware(url: string): Error { return new Error(`Processer of router ${url} is empty, can not use middleware`) };
export function invalidUrl(url: string): Error { return new Error(`Invalid url: "${url}". Must match "/segment[/segment... || /:param...]" without trailing slash or consecutive slashes`) };