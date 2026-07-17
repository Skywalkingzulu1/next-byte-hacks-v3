import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = (n) => path.join(__dirname, n);
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'https://docsonwheels.co.za';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

async function shot(name, fn) {
  await page.goto(BASE + (fn || ''), { waitUntil: 'networkidle0' });
  await sleep(900);
  await page.screenshot({ path: out(name) });
  console.log('shot', name);
}

// Landing / login
await shot('dow_1_landing.png', '/');
// Register
await shot('dow_2_register.png', '/register.html');
// Login as demo
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  const set = (sel, val) => { const e = document.querySelector(sel); if (e) { e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); } };
  set('input[type=email], input[name=email]', 'test3@test.com');
  set('input[type=password], input[name=password]', 'pass');
});
await sleep(300);
await page.screenshot({ path: out('dow_3_login.png') });
// Try submit login
try {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, a')].find(b => /login/i.test(b.textContent));
    if (btn) btn.click();
  });
  await sleep(2500);
} catch (e) {}
await page.screenshot({ path: out('dow_4_dashboard.png') });

// Find a Doctor + Book Appointment
for (const slug of ['/find-doctors', '/doctors', '/book', '/book-appointment', '/appointment']) {
  try {
    await page.goto(BASE + slug, { waitUntil: 'networkidle0', timeout: 8000 });
    await sleep(900);
    await page.screenshot({ path: out('dow_5_book.png') });
    console.log('shot dow_5_book via', slug);
    break;
  } catch (e) {}
}

await browser.close();
console.log('done');
