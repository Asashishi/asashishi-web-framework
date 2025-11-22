export const START_BANNER_WIDTH: number = 75;
export const UN_SUPPORT_METHOD: string = 'Unsupport method';
export const NO_SUCH_ROUTER_CHAIN: string = 'No such router chain';
export const NO_SUCH_CROS_CONFIG: string = 'No such router cross config';
export const SEGMENTED_PATH = /^\/([A-Za-z0-9\-_]+|:[A-Za-z0-9\-_]+)(\/([A-Za-z0-9\-_]+|:[A-Za-z0-9\-_]+))*$/;

export const CROS_ALL: Record<string, string> = {
  'Access-Control-Max-Age': '600',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const METHOD: string[] = ['GET' , 'POST' , 'PUT' , 'DELETE'];