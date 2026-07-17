import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAME_DIR = path.join(__dirname, 'frames_pa');
fs.mkdirSync(FRAME_DIR, { recursive: true });
for (const f of fs.readdirSync(FRAME_DIR)) fs.unlinkSync(path.join(FRAME_DIR, f));

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file://' + path.join(__dirname, '..', 'public', 'index.html');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
const client = await page.target().createCDPSession();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await sleep(600);

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

captions.push({ start: 0, end: 3500, text: 'PriorAuthFlow — AI Prior Authorization' });
await hold(3500);
await page.evaluate(() => window.scrollTo({ top: document.getElementById('demo').offsetTop - 40, behavior: 'instant' }));
await hold(800);
await page.evaluate(() => { const c = document.querySelectorAll('#patientCards .patient-card'); if (c[0]) c[0].click(); });
captions.push({ start: now(), end: now() + 4500, text: 'Paste a chart + CPT code, then run the pipeline' });
await hold(2500);
await page.click('#runBtn');
await page.waitForFunction(() => document.getElementById('resultPanel').classList.contains('visible'), { timeout: 15000 });
await hold(3500);
await page.evaluate(() => window.scrollTo({ top: document.getElementById('resultContent').offsetTop - 80, behavior: 'instant' }));
captions.push({ start: now(), end: now() + 6000, text: '5-agent pipeline builds a submit-ready packet' });
await hold(6000);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.evaluate(() => { const c = document.querySelectorAll('#patientCards .patient-card'); if (c[1]) c[1].click(); });
captions.push({ start: now(), end: now() + 5500, text: 'Missing data? The safety loop flags it for review' });
await hold(2000);
await page.click('#runBtn');
await page.waitForFunction(() => document.getElementById('resultPanel').classList.contains('visible'), { timeout: 15000 });
await hold(3000);
await page.evaluate(() => window.scrollTo({ top: document.getElementById('resultContent').offsetTop - 80, behavior: 'instant' }));
await hold(5500);

const elapsed = now();
await browser.close();
fs.writeFileSync(path.join(__dirname, 'captions_pa.json'), JSON.stringify(captions, null, 2));
fs.writeFileSync(path.join(__dirname, 'meta_pa.json'), JSON.stringify({ frames: frame, elapsed_ms: elapsed }));
console.log('frames:', frame, 'elapsed_s:', (elapsed / 1000).toFixed(1), '=> fps', (frame / (elapsed / 1000)).toFixed(1));
