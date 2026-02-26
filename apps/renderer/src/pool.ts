import { chromium, type Browser } from "playwright";

interface PooledBrowser {
  browser: Browser;
  inUse: boolean;
}

export class BrowserPool {
  private readonly pool: PooledBrowser[] = [];
  private readonly minSize: number;

  constructor(minSize = 2) {
    this.minSize = minSize;
  }

  async init() {
    if (this.pool.length > 0) return;
    for (let index = 0; index < this.minSize; index += 1) {
      const browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
      this.pool.push({ browser, inUse: false });
    }
  }

  async acquire(): Promise<Browser> {
    await this.init();

    const idle = this.pool.find((item) => !item.inUse);
    if (idle) {
      idle.inUse = true;
      return idle.browser;
    }

    const browser = await chromium.launch({ headless: true });
    this.pool.push({ browser, inUse: true });
    return browser;
  }

  release(browser: Browser) {
    const pooled = this.pool.find((item) => item.browser === browser);
    if (pooled) {
      pooled.inUse = false;
    }
  }

  async closeAll() {
    await Promise.all(this.pool.map((item) => item.browser.close()));
    this.pool.length = 0;
  }
}
