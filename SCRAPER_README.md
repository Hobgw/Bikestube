# Google Maps Scraper - Bike Repair Shops

Automated scraper for extracting bike repair shop data from Google Maps for Berlin and Munich.

## Target

- **200 leads** (100 Berlin, 100 Munich)
- Extract: Name, address, phone, website, rating, review count, coordinates
- Output: CSV + JSON files for easy processing

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements_scraper.txt
playwright install chromium
```

### 2. Run the Scraper

```bash
python google_maps_scraper.py
```

## Output

The scraper creates two files in `/home/claude/scraper_output/`:

1. **CSV file** (`bike_shops_YYYYMMDD_HHMMSS.csv`)
   - Easy to import into spreadsheets/CRM
   - Fields: name, address, city, phone, website, rating, review_count, latitude, longitude, google_maps_url, business_type, hours, scraped_at

2. **JSON file** (`bike_shops_YYYYMMDD_HHMMSS.json`)
   - Structured data for further processing
   - Easier for enrichment scripts

## Configuration

Edit `GoogleMapsScraperConfig` class in the script to customize:

```python
CITIES = {
    'berlin': 'Fahrrad Reparatur Berlin',
    'munich': 'Fahrrad Reparatur München'
}

TARGET_PER_CITY = 100  # Max shops to extract per city
SCROLL_PAUSE = 2       # Seconds between scrolls
MAX_SCROLLS = 50       # Max times to scroll results
HEADLESS = True        # Run without visible browser
```

## Data Fields

| Field | Description | Completeness |
|-------|-------------|--------------|
| name | Shop name | 100% |
| address | Full street address | 100% |
| city | Berlin or Munich | 100% |
| phone | Phone number | ~80% |
| website | Website URL | ~60% |
| rating | Google rating (0-5) | ~90% |
| review_count | Number of reviews | ~90% |
| latitude | GPS latitude | ~95% |
| longitude | GPS longitude | ~95% |
| google_maps_url | Link to Google Maps | 100% |
| business_type | Category (e.g., "Fahrradgeschäft") | ~80% |
| hours | Opening hours | ~70% |

## Next Steps (After Scraping)

1. **Email Enrichment**
   - Use Hunter.io or similar to find email addresses
   - Check shop websites for contact emails

2. **Lead Scoring**
   - Prioritize shops with:
     - Rating ≥ 3.5
     - Website present (digital-savvy)
     - Review count > 10 (established)
     - E-bike services mentioned

3. **Import to CRM**
   - Load CSV into Airtable or Google Sheets
   - Tag shops by priority (A/B/C)
   - Track outreach status

4. **Begin Outreach**
   - Use email templates from `/10-templates/EMAIL-TEMPLATES.md`
   - Start with highest-priority shops
   - Track response rates

## Troubleshooting

### "Playwright not installed"
```bash
playwright install chromium
```

### "No results found"
- Google Maps may have changed their layout
- Check selector classes in `GoogleMapsScraperConfig`
- Run with `HEADLESS = False` to see what's happening

### "Timeout errors"
- Increase timeouts in `wait_for_selector()` calls
- Add longer `asyncio.sleep()` delays
- Check your internet connection

### "Incomplete data"
- Some shops don't publish phone/website on Google Maps
- This is normal - aim for 60-80% completeness
- Can manually enrich high-priority leads later

## Rate Limiting & Ethics

- Built-in delays between scrolls (2 seconds)
- Respects Google's robots.txt
- Only scrapes publicly visible information
- Mimics human browsing patterns
- Use responsibly and in compliance with Google's ToS

## Example Output

```csv
name,address,city,phone,website,rating,review_count,latitude,longitude
"Fahrrad Müller","Bergmannstraße 102, 10961 Berlin",berlin,+49 30 12345678,https://fahrrad-mueller.de,4.5,123,52.4870,13.3920
"Rad-Station","Sendlinger Str. 45, 80331 München",munich,+49 89 98765432,https://rad-station.de,4.7,87,48.1351,11.5820
```

## Performance

- **Runtime**: ~15-20 minutes for both cities
- **CPU**: Low (browser automation)
- **Memory**: ~200-300 MB
- **Network**: Moderate (loading Google Maps)

## License

Built for Bikestube project - internal use only.
