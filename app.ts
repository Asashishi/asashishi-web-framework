import AsashishiApp, { AsashishiLogInfo, AsashishiRequest, AsashishiResponse, AsashishiRouterGroup, asashishiServe, CROS_ALL, loggerRegister } from "./index";
import { Asashishi } from "./index";

const asashishi: Asashishi = AsashishiApp();

asashishi.GR_GET(async function (req, res): Promise<void> {
  res.json({ msg: 'Hello' });
});
// const asashishi_gr1: AsashishiRouterGroup = asashishi.routerGroup('/g1');
// const asashishi_gr2: AsashishiRouterGroup = asashishi_gr1.routerGroup('/g2');
// asashishi.GR_POST(async (req: AsashishiRequest, res: AsashishiResponse): Promise<void> => {
//   res.status(200).json({ msg: 'Hello' });
// });
// asashishi.GR_DELETE(async (req: AsashishiRequest, res: AsashishiResponse): Promise<void> => {
//   res.status(200).json({ msg: 'Hello' });
// });
// asashishi.GR_PUT(async (req: AsashishiRequest, res: AsashishiResponse): Promise<void> => {
//   res.status(200).json({ msg: 'Hello' });
// });
// asashishi.POST('/test/:woc/:ceshi', async (req: AsashishiRequest, res: AsashishiResponse): Promise<void> => {
//   console.log(req);
//   res.status(200).json({ msg: 'Hello' });
// });
// asashishi.USE(async () => {
//   throw new Error("111");
//   return false
// });
// asashishi.GR_CROS(CROS_ALL);
// loggerRegister(async (info: AsashishiLogInfo): Promise<void> => {
//   console.log('tiemCost:', ((info.res.timeAt - info.req.timeAt) / 1_000_000).toFixed(2), 'ms');
// });
asashishiServe({
  host: '0.0.0.0',
  port: 3000,
});