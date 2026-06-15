import { chromium, type Browser } from "playwright";

interface PooledBrowser {
  browser: Browser;
  inUse: boolean;
  isMinSize?: boolean;
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
      this.pool.push({ browser, inUse: false, isMinSize: true });
    }
  }

  async acquire(): Promise<Browser> {
    await this.init();

    const idle = this.pool.find((item) => !item.inUse);
    if (idle) {
      idle.inUse = true;
      return idle.browser;
    }

    const browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
    this.pool.push({ browser, inUse: true, isMinSize: false });
    return browser;
  }

  release(browser: Browser) {
    const index = this.pool.findIndex((item) => item.browser === browser);
    if (index !== -1) {
      const pooled = this.pool[index];
      if (!pooled.isMinSize) {
        pooled.browser.close().catch(() => {});
        this.pool.splice(index, 1);
      } else {
        pooled.inUse = false;
      }
    }
  }

  async closeAll() {
    await Promise.all(this.pool.map((item) => item.browser.close()));
    this.pool.length = 0;
  }
}

