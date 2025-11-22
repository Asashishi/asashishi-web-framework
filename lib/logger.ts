import type { AsashishiLogger } from "../types";

const logFunc: { logger: AsashishiLogger | undefined } = { logger: undefined };
function loggerRegister(logger: AsashishiLogger): void { logFunc.logger = logger };

export default logFunc;
export { loggerRegister };