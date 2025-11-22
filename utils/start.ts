import { nanoseconds } from 'bun';
import { START_BANNER_WIDTH } from '../definitions/consts';

function stripAnsi(str: string): string { return str.replace(/\x1b\[[0-9;]*m/g, '') };

function padLine (text: string, color: string = '\x1b[0m'): string {
  const plainLen: number = stripAnsi(text).length;
  const spaces: number = START_BANNER_WIDTH - plainLen - 1;
  return `\x1b[94m║\x1b[0m ${color}${text}\x1b[0m${' '.repeat(spaces)}\x1b[94m║\x1b[0m`;
};

function AsashishiStart(host: string, port: number, startAt: number, productionMode: boolean): void {
  console.log(`
\x1b[94m╔${'═'.repeat(START_BANNER_WIDTH)}╗\x1b[0m
${padLine('🦁  Powered by Bun.js and Asashishi ~(=^･ω･^=)~', '\x1b[93m')}
\x1b[94m╠${'═'.repeat(START_BANNER_WIDTH)}╣\x1b[0m
${padLine(`>>> Stage: ${productionMode ? 'Production' : 'Development'}`, '\x1b[92m')}
${padLine('>>> Listening: ' + host + ':' + port, '\x1b[96m')}
${padLine('>>> Start at: ' + new Date().toLocaleString(), '\x1b[95m')}
${padLine('>>> Start time cost: ' + ((nanoseconds() - startAt) / 1_000_000).toFixed(2) + 'ms ', '\x1b[33m')}
\x1b[94m╚${'═'.repeat(START_BANNER_WIDTH)}╝\x1b[0m
`);
}

export default AsashishiStart;