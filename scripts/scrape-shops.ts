import { chromium, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

interface ShopData {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  review_count: string;
  city: string;
}

const CITIES = ["Berlin", "Munich"];
const SEARCH_QUERY = "Fahrrad Reparatur"; // "Bike repair" in German
const OUTPUT_FILE = "bike-shops.csv";
const SCROLL_PAUSE_MS = 2000;
const MAX_SCROLLS = 20;

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollResultsList(page: Page): Promise<void> {
  const resultsSelector = 'div[role="feed"]';

  for (let i = 0; i < MAX_SCROLLS; i++) {
    const previousCount = await page.locator('div[role="feed"] > div').count();

    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, resultsSelector);

    await delay(SCROLL_PAUSE_MS);

    const newCount = await page.locator('div[role="feed"] > div').count();

    // Check if we've reached the end (no new results loaded)
    if (newCount === previousCount) {
      console.log(`  Finished scrolling after ${i + 1} scrolls (${newCount} results)`);
      break;
    }

    console.log(`  Scroll ${i + 1}: ${newCount} results loaded...`);
  }
}

async function extractShopDetails(page: Page, city: string): Promise<ShopData[]> {
  const shops: ShopData[] = [];

  // Get all result items
  const results = page.locator('div[role="feed"] > div > div > a');
  const count = await results.count();

  console.log(`  Found ${count} shop links to process`);

  for (let i = 0; i < count; i++) {
    try {
      // Re-query to avoid stale elements
      const result = page.locator('div[role="feed"] > div > div > a').nth(i);

      // Check if element exists and is visible
      if (!(await result.isVisible().catch(() => false))) {
        continue;
      }

      // Click to open details panel
      await result.click();
      await delay(1500);

      // Extract data from the details panel
      const shop = await page.evaluate(() => {
        const getName = (): string => {
          const el = document.querySelector('h1.DUwDvf');
          return el?.textContent?.trim() || "";
        };

        const getAddress = (): string => {
          const el = document.querySelector('button[data-item-id="address"]');
          return el?.textContent?.trim() || "";
        };

        const getPhone = (): string => {
          const el = document.querySelector('button[data-item-id^="phone:"]');
          return el?.textContent?.trim() || "";
        };

        const getWebsite = (): string => {
          const el = document.querySelector('a[data-item-id="authority"]');
          return el?.getAttribute("href") || "";
        };

        const getRating = (): string => {
          const el = document.querySelector('div.F7nice span[aria-hidden="true"]');
          return el?.textContent?.trim() || "";
        };

        const getReviewCount = (): string => {
          const el = document.querySelector('div.F7nice span[aria-label*="review"]');
          const text = el?.getAttribute("aria-label") || "";
          const match = text.match(/(\d[\d,\.]*)/);
          return match ? match[1].replace(/[,\.]/g, "") : "";
        };

        return {
          name: getName(),
          address: getAddress(),
          phone: getPhone(),
          website: getWebsite(),
          rating: getRating(),
          review_count: getReviewCount(),
        };
      });

      if (shop.name) {
        shops.push({ ...shop, city });
        console.log(`    [${i + 1}/${count}] ${shop.name}`);
      }
    } catch (error) {
      console.log(`    [${i + 1}/${count}] Skipped (error extracting data)`);
    }
  }

  return shops;
}

async function scrapeCity(page: Page, city: string): Promise<ShopData[]> {
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    `${SEARCH_QUERY} ${city}`
  )}`;

  console.log(`\nScraping ${city}...`);
  console.log(`  URL: ${searchUrl}`);

  await page.goto(searchUrl, { waitUntil: "networkidle" });

  // Accept cookies if dialog appears
  try {
    const acceptButton = page.locator('button:has-text("Accept all")');
    if (await acceptButton.isVisible({ timeout: 3000 })) {
      await acceptButton.click();
      await delay(1000);
    }
  } catch {
    // Cookie dialog might not appear
  }

  // Wait for results to load
  await page.waitForSelector('div[role="feed"]', { timeout: 10000 });

  // Scroll to load all results
  console.log("  Scrolling to load all results...");
  await scrollResultsList(page);

  // Extract shop details
  console.log("  Extracting shop details...");
  const shops = await extractShopDetails(page, city);

  console.log(`  Extracted ${shops.length} shops from ${city}`);
  return shops;
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function writeCsv(shops: ShopData[], filename: string): void {
  const headers = ["name", "address", "phone", "website", "rating", "review_count", "city"];
  const rows = shops.map((shop) =>
    headers.map((h) => escapeCsvField(shop[h as keyof ShopData] || "")).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  fs.writeFileSync(filename, csv, "utf-8");
}

async function main(): Promise<void> {
  console.log("Google Maps Bike Shop Scraper");
  console.log("=============================");
  console.log(`Cities: ${CITIES.join(", ")}`);
  console.log(`Search: "${SEARCH_QUERY}"`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    locale: "de-DE",
    geolocation: { latitude: 52.52, longitude: 13.405 }, // Berlin
    permissions: ["geolocation"],
  });

  const page = await context.newPage();
  const allShops: ShopData[] = [];

  try {
    for (const city of CITIES) {
      const shops = await scrapeCity(page, city);
      allShops.push(...shops);
    }

    // Remove duplicates based on name + address
    const uniqueShops = allShops.filter(
      (shop, index, self) =>
        index === self.findIndex((s) => s.name === shop.name && s.address === shop.address)
    );

    // Write to CSV
    const outputPath = path.join(process.cwd(), OUTPUT_FILE);
    writeCsv(uniqueShops, outputPath);

    console.log("\n=============================");
    console.log(`Total shops scraped: ${uniqueShops.length}`);
    console.log(`Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("Scraping failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
