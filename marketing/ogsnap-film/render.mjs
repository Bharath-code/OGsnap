import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';


const [, , html, out, fps = '30', dur = '16'] = process.argv;
const exe = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`file://${html}`, { waitUntil: 'networkidle' });
await page.addStyleTag({ content: '.player{position:fixed!important;inset:0;width:1920px!important;height:1080px!important;max-width:none!important;border-radius:0!important;z-index:9}' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const size = await page.evaluate(() => [document.getElementById('cv').width, document.getElementById('cv').height]);
if (size[0] !== 1920 || size[1] !== 1080) throw new Error(`canvas is ${size}`);

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(+dur * +fps);
for (let i = 0; i < n; i++) {
  const url = await page.evaluate(v => window.__frame(v), i / +fps);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 60 === 0) console.log(`frame ${i}/${n}`);
}
ff.stdin.end();
await new Promise((r, j) => ff.on('close', c => (c ? j(new Error(`ffmpeg ${c}`)) : r())));
await browser.close();
console.log('done', out);
