import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = (n) => path.join(__dirname, n);
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'file://' + path.join(__dirname, '..', 'public', 'index.html');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await sleep(800);

// 1. Hero
await page.screenshot({ path: out('shot_1_hero.png') });

// 2. Demo form (PT-001 selected by default)
await page.evaluate(() => document.getElementById('demo').scrollIntoView());
await sleep(600);
await page.screenshot({ path: out('shot_2_demo.png') });

// 3. Happy path: run with PT-001, capture mid-run + result
await page.click('#runBtn');
await sleep(2200); // stages animating
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: out('shot_3_running.png') });
await page.waitForFunction(() => document.getElementById('resultPanel').classList.contains('visible'), { timeout: 15000 });
await sleep(400);
await page.screenshot({ path: out('shot_4_happy.png') });

// 4. Escalation path: select PT-MISSING, run
await page.evaluate(() => {
  const cards = document.querySelectorAll('#patientCards .patient-card');
  if (cards[1]) cards[1].click();
});
await sleep(300);
await page.click('#runBtn');
await page.waitForFunction(
  () => document.getElementById('resultPanel').classList.contains('visible'),
  { timeout: 15000 }
);
await sleep(400);
await page.screenshot({ path: out('shot_5_escalation.png') });

await browser.close();
console.log('screenshots written: shot_1..shot_5');
