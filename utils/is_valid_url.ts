import { invalidUrl } from "../definitions/errors";
import { SEGMENTED_PATH } from "../definitions/consts";

function isValidUrl(baseUrl: string, url?: string): string {
  if (!SEGMENTED_PATH.test(baseUrl) && baseUrl !== '/') throw invalidUrl(baseUrl);
  if (!url) return baseUrl;
  let result: string;
  if (baseUrl === '/' && url[0] === '/') result = url;
  else result = baseUrl + url;
  if (!SEGMENTED_PATH.test(result)) throw invalidUrl(result);
  return result;
};

export default isValidUrl;
