import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAME_DIR = path.join(__dirname, 'frames_dow');
fs.mkdirSync(FRAME_DIR, { recursive: true });
for (const f of fs.readdirSync(FRAME_DIR)) fs.unlinkSync(path.join(FRAME_DIR, f));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'https://docsonwheels.co.za';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
const client = await page.target().createCDPSession();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

const captions = [];
let frame = 0;
const t0 = Date.now();
const now = () => Date.now() - t0;
async function shot() {
  const { data } = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(FRAME_DIR, `frame_${String(frame).padStart(5, '0')}.png`), Buffer.from(data, 'base64'));
  frame++;
}
async function hold(ms, caption) {
  if (caption) captions.push({ start: now(), end: now() + ms, text: caption });
  const end = Date.now() + ms;
  while (Date.now() < end) { await shot(); }
}

// Landing
captions.push({ start: 0, end: 3500, text: "Doctors on Wheels — care that comes to you" });
await page.goto(BASE, { waitUntil: 'networkidle0' });
await hold(3500);
// scroll a bit to show features
await page.evaluate(() => window.scrollBy(0, 400));
await hold(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await hold(500);

// Demo login
captions.push({ start: now(), end: now() + 4000, text: "Sign in — your dashboard appears" });
await page.evaluate(() => {
  const set = (sel, val) => { const e = document.querySelector(sel); if (e) { e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); } };
  set('input[type=email], input[name=email]', 'test3@test.com');
  set('input[type=password], input[name=password]', 'pass');
});
await hold(2000);
try { await page.evaluate(() => { const b = [...document.querySelectorAll('button, a')].find(x => /login/i.test(x.textContent)); if (b) b.click(); }); } catch {}
await hold(3000);

// Dashboard view (scroll through)
captions.push({ start: now(), end: now() + 5000, text: "Book a video call or a home visit" });
for (let i = 0; i < 5; i++) { await page.evaluate((y) => window.scrollBy(0, 300), 0); await hold(900); }
await page.evaluate(() => window.scrollTo(0, 0));
await hold(1500);

const elapsed = now();
await browser.close();
fs.writeFileSync(path.join(__dirname, 'captions_dow.json'), JSON.stringify(captions, null, 2));
fs.writeFileSync(path.join(__dirname, 'meta_dow.json'), JSON.stringify({ frames: frame, elapsed_ms: elapsed }));
console.log('frames:', frame, 'elapsed_s:', (elapsed / 1000).toFixed(1), '=> fps', (frame / (elapsed / 1000)).toFixed(1));
