# Bikestube Scripts

## Google Maps Shop Scraper

Extracts bike repair shops from Google Maps for specified cities.

### Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

### Usage

Run the scraper:
```bash
npm run scrape
```

### Output

Creates `bike-shops.csv` with columns:
- `name` - Shop name
- `address` - Full address
- `phone` - Phone number
- `website` - Website URL
- `rating` - Google rating (1-5)
- `review_count` - Number of reviews
- `city` - City (Berlin/Munich)

### Configuration

Edit `scripts/scrape-shops.ts` to modify:
- `CITIES` - Array of cities to scrape
- `SEARCH_QUERY` - Search term (default: "Fahrrad Reparatur")
- `MAX_SCROLLS` - How many times to scroll for more results
- `OUTPUT_FILE` - Output filename

### Notes

- Runs in headless mode by default
- Respects Google Maps rate limits with built-in delays
- Deduplicates results based on name + address
