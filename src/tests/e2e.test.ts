import { describe, it, expect } from "vitest";
import puppeteer from "puppeteer";
import { spawn } from "child_process";
import path from "path";

const PROJECT_ROOT = path.resolve("C:\\Users\\SBTI Gaming 11\\hackathons\\sprints\\next-byte-hacks-v3");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

async function startServer() {
  const server = spawn("cmd", ["/c", "npx", "serve", PUBLIC_DIR, "-l", String(PORT)], {
    cwd: PROJECT_ROOT,
    stdio: "pipe",
  });
  await new Promise(resolve => setTimeout(resolve, 2500));
  return server;
}

describe("PriorAuthFlow Next Byte Hacks V3", () => {
  it("homepage loads with correct title", async () => {
    const browser = await puppeteer.launch({ headless: "new" as any });
    const server = await startServer();
    try {
      const page = await browser.newPage();
      await page.goto(BASE, { waitUntil: "load" });
      await page.waitForSelector("h1", { timeout: 3000 });
      const title = await page.$eval("h1", el => (el as any).textContent?.trim() || "");
      expect(title).toContain("PriorAuthFlow");
    } finally {
      await browser.close();
      server.kill("SIGTERM");
    }
  }, 20000);

  it("demo form is visible and functional", async () => {
    const browser = await puppeteer.launch({ headless: "new" as any });
    const server = await startServer();
    try {
      const page = await browser.newPage();
      await page.goto(BASE, { waitUntil: "load" });

      await page.waitForSelector("#patientId", { timeout: 3000 });
      await page.waitForSelector("#payer", { timeout: 3000 });
      await page.waitForSelector("#cptCode", { timeout: 3000 });
      await page.waitForSelector("#chartText", { timeout: 3000 });
      await page.waitForSelector("#runBtn", { timeout: 3000 });

      const patientOptions = await page.$$eval("#patientId option", opts => opts.map((o: any) => o.value));
      expect(patientOptions).toContain("PT-001");
      expect(patientOptions).toContain("PT-MISSING");

      await page.click("#runBtn");
      await page.waitForSelector("#resultPanel.visible", { timeout: 10000 });

      const statusBadge = await page.$eval("#statusBadge", el => (el as any).textContent?.trim() || "");
      expect(["submitted", "needs_review"]).toContain(statusBadge);

      const traces = await page.$$(".trace-item");
      expect(traces.length).toBeGreaterThanOrEqual(5);
    } finally {
      await browser.close();
      server.kill("SIGTERM");
    }
  }, 30000);

  it("human-speed timing check", async () => {
    const browser = await puppeteer.launch({ headless: "new" as any });
    const server = await startServer();
    try {
      const page = await browser.newPage();
      await page.goto(BASE, { waitUntil: "load" });

      const startTime = Date.now();
      await page.click("#runBtn");
      await page.waitForSelector("#tracesContainer", { timeout: 10000 });
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      expect(totalTime).toBeGreaterThanOrEqual(2000);
      expect(totalTime).toBeLessThan(15000);
    } finally {
      await browser.close();
      server.kill("SIGTERM");
    }
  }, 30000);
});
