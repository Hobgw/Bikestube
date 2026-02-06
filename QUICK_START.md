# Quick Reference Card - Bikestube Scraper

## Installation (One-Time)
```bash
cd bikestube-scraper
pip install -r requirements_scraper.txt
playwright install chromium
```

## Usage

### 1. Run Everything (Recommended)
```bash
./run_scraper.sh
# Choose option 3: "Both (scrape then score)"
```

### 2. Individual Steps
```bash
# Step 1: Scrape Google Maps
python3 google_maps_scraper.py          # 15-20 min

# Step 2: Score and tier leads
python3 lead_scorer.py                  # instant

# Step 3: Find emails (optional)
python3 email_finder.py                 # 30-60 min
```

## Output Files
All saved to: `/home/claude/scraper_output/`

- `bike_shops_TIMESTAMP.csv` - Raw scraped data
- `bike_shops_scored_TIMESTAMP.csv` - Scored leads
- `outreach_a_tier_TIMESTAMP.csv` - **START HERE** ⭐
- `outreach_b_tier_TIMESTAMP.csv` - Follow-up leads

## What's in A-Tier?
- Rating ≥ 3.5 stars
- Has website (digital-ready)
- Established business (reviews)
- E-bike capable (bonus)
- **Score 70+** (top priority)

## Next Steps
1. Open `outreach_a_tier_TIMESTAMP.csv`
2. Import to Airtable or Google Sheets
3. Verify top 10 shops manually
4. Use email templates from `/mnt/project/EMAIL-TEMPLATES.md`
5. Start outreach!

## Troubleshooting
**No results?** → Check internet, try `HEADLESS=False`
**Timeout errors?** → Increase delays in config
**Need help?** → Read `COMPLETE_GUIDE.md`

## Target Metrics
- 200 shops scraped ✓
- 30-40 A-tier leads ✓
- 80-100 B-tier leads ✓
- Email 20 A-tier shops → 5+ responses → 3+ onboard

---
**Version 1.0** | Built for Bikestube MVP
