# Bikestube Google Maps Scraper - Complete Package

## Overview

Complete scraping pipeline for extracting and enriching bike repair shop leads from Google Maps in Berlin and Munich.

## Package Contents

```
bikestube-scraper/
├── google_maps_scraper.py    # Main scraper (extracts from Google Maps)
├── lead_scorer.py             # Scores and tiers leads by priority
├── email_finder.py            # Finds email addresses from websites
├── run_scraper.sh             # Quick setup and run script
├── requirements_scraper.txt   # Python dependencies
├── SCRAPER_README.md          # Detailed scraper documentation
└── COMPLETE_GUIDE.md          # This file
```

## Quick Start (3 Steps)

### 1. Setup
```bash
chmod +x run_scraper.sh
./run_scraper.sh
# Choose option 1 for first-time setup
```

### 2. Run Pipeline
The scraper will automatically:
- Extract ~100 shops from Berlin
- Extract ~100 shops from Munich
- Score and tier all leads (A/B/C)
- Generate outreach-ready CSV files

### 3. Review Output
Check `/home/claude/scraper_output/` for:
- `bike_shops_TIMESTAMP.csv` - Raw scraped data
- `bike_shops_scored_TIMESTAMP.csv` - Scored and tiered leads
- `outreach_a_tier_TIMESTAMP.csv` - A-tier leads ready for outreach
- `outreach_b_tier_TIMESTAMP.csv` - B-tier leads

## Detailed Workflow

### Phase 1: Scraping (15-20 minutes)

```bash
python3 google_maps_scraper.py
```

**What it does:**
- Searches "Fahrrad Reparatur Berlin" and "Fahrrad Reparatur München"
- Scrolls through results to load all shops
- Extracts for each shop:
  - Name, address, phone, website
  - Google rating, review count
  - GPS coordinates
  - Business hours, category
  - Google Maps URL

**Output:** `bike_shops_YYYYMMDD_HHMMSS.csv`

### Phase 2: Scoring (instant)

```bash
python3 lead_scorer.py
```

**Scoring Algorithm:**
- Rating ≥ 4.0: +30 points
- Rating ≥ 3.5: +15 points
- Has website: +25 points (digital-ready)
- Has phone: +20 points (easy contact)
- Review count > 50: +20 points (established)
- Review count > 20: +10 points
- E-bike keywords: +15 points (higher value)

**Exclusions:**
- Large chains (XXL, Decathlon, etc.)
- Sales-focused (not repair)

**Tiers:**
- A-tier: 70+ points (highest priority)
- B-tier: 50-69 points (medium priority)
- C-tier: <50 points (low priority or backup)

**Output:** 
- `bike_shops_scored_TIMESTAMP.csv` - All leads with scores
- `outreach_a_tier_TIMESTAMP.csv` - A-tier only
- `outreach_b_tier_TIMESTAMP.csv` - B-tier only

### Phase 3: Email Finding (optional, 30-60 minutes)

```bash
python3 email_finder.py
```

**What it does:**
- Visits each shop's website
- Checks homepage, contact, impressum pages
- Extracts email addresses
- Filters out generic/spam emails

**Recommended:** Run on A-tier shops first (20-40 shops)

**Output:** `bike_shops_with_emails_TIMESTAMP.csv`

## Expected Results

Based on 200 shops target:

### Data Completeness
| Field | Expected % |
|-------|-----------|
| Name | 100% |
| Address | 100% |
| Phone | 75-85% |
| Website | 55-65% |
| Rating | 85-95% |
| Coordinates | 90-98% |

### Lead Distribution
- A-tier: ~30-40 shops (15-20%)
- B-tier: ~80-100 shops (40-50%)
- C-tier: ~60-80 shops (30-40%)
- Excluded: ~10-20 shops (chains, etc.)

## Integration with Outreach

### Importing to Airtable

1. Create base with these fields:
   - Name (text)
   - Address (text)
   - City (single select: Berlin, Munich)
   - Phone (phone number)
   - Website (URL)
   - Email (email)
   - Rating (number)
   - Score (number)
   - Tier (single select: A, B, C)
   - Status (single select: Not Contacted, Contacted, Replied, Onboarded, Declined)
   - Notes (long text)

2. Import CSV: `outreach_a_tier_TIMESTAMP.csv`

3. Add fields for tracking:
   - Email 1 Sent (date)
   - Email 2 Sent (date)
   - Email 3 Sent (date)
   - Called (checkbox)
   - Next Action (text)

### Email Sequence Setup

Use templates from `/mnt/project/EMAIL-TEMPLATES.md`:

**Week 1:**
- Day 1: Import A-tier to CRM
- Day 1-2: Personalize Email 1 (30-40 shops)
- Day 2: Send Email 1 batch

**Week 2:**
- Day 4: Send Email 2 (follow-up) to non-responders
- Day 5-7: Call high-priority leads who haven't replied

**Week 3:**
- Day 8: Send Email 3 (final) to non-responders
- Day 8-10: Move to B-tier leads
- Track: Move responders to "Replied" status

## Troubleshooting

### Google Maps changed layout
**Symptoms:** No results found, timeout errors
**Fix:** Update CSS selectors in `GoogleMapsScraperConfig`:
```python
SEARCH_BOX = 'input#searchboxinput'  # May change
RESULTS_PANEL = 'div[role="feed"]'   # May change
```

Run with `HEADLESS = False` to inspect actual page structure.

### Playwright errors
```bash
# Reinstall playwright
pip uninstall playwright
pip install playwright==1.40.0
playwright install chromium
```

### Low data completeness
**Phone/website missing:** Normal - many shops don't publish these on Google Maps.
**Solution:** Use email_finder.py for websites, manually call for phone verification.

### IP blocking / rate limiting
**Symptoms:** Lots of timeout errors, captchas
**Solutions:**
- Add longer delays: increase `SCROLL_PAUSE` to 3-5 seconds
- Run in smaller batches: reduce `TARGET_PER_CITY` to 50
- Use residential proxy (advanced)

## Performance Optimization

### Speed up scraping
```python
# In GoogleMapsScraperConfig
SCROLL_PAUSE = 1  # Default: 2 (faster but riskier)
MAX_SCROLLS = 30  # Default: 50 (fewer scrolls)
```

### Parallel scraping (advanced)
```bash
# Run cities in parallel (separate terminals)
python3 google_maps_scraper.py --city berlin &
python3 google_maps_scraper.py --city munich &
```

## Data Quality Validation

### Post-scrape checks:

1. **Duplicates:** Check for duplicate names/addresses
   ```bash
   sort bike_shops_*.csv | uniq -d
   ```

2. **Coordinate validation:** Verify lat/lng in expected range
   - Berlin: ~52.5°N, 13.4°E
   - Munich: ~48.1°N, 11.6°E

3. **Rating distribution:** Should be bell curve around 3.5-4.5

4. **Manual spot-check:** Verify 5-10 shops on Google Maps

## Next Steps After Scraping

1. ✅ **Review A-tier list** (top 30-40 shops)
   - Verify websites work
   - Check if emails found
   - Note any standout features

2. ✅ **Import to CRM**
   - Airtable or Google Sheets
   - Set up status tracking
   - Create email sequence automation

3. ✅ **Personalize outreach**
   - Use templates from `/mnt/project/EMAIL-TEMPLATES.md`
   - Add personal touches (mention reviews, location, etc.)

4. ✅ **Track metrics**
   - Email open rate (target: >40%)
   - Reply rate (target: >10%)
   - Positive response rate (target: >5%)
   - Onboarding rate (target: >50% of positive responses)

5. ✅ **Iterate**
   - A/B test subject lines
   - Refine value proposition based on feedback
   - Adjust scoring criteria based on actual conversions

## Success Criteria

### Week 1-2 Goals:
- [ ] 200 shops scraped
- [ ] 30-40 A-tier leads identified
- [ ] 20+ emails sent
- [ ] 5+ positive responses

### Month 1 Goals:
- [ ] 20 shops onboarded
- [ ] Profiles complete and live
- [ ] First booking through platform

## Maintenance

### Monthly scraping
```bash
# Re-scrape to catch new shops
python3 google_maps_scraper.py
python3 lead_scorer.py
# Merge with existing CRM, mark new shops
```

### Expanding to new cities
```python
# In google_maps_scraper.py, add to CITIES dict:
CITIES = {
    'berlin': 'Fahrrad Reparatur Berlin',
    'munich': 'Fahrrad Reparatur München',
    'hamburg': 'Fahrrad Reparatur Hamburg',  # New
    'cologne': 'Fahrrad Reparatur Köln',     # New
}
```

## Cost Analysis

### Infrastructure:
- Playwright: Free (open source)
- Python: Free
- Compute: Negligible (runs on laptop)
- Storage: <10 MB for all data

### Optional paid tools:
- Hunter.io (email finding): $49/month for 1,000 searches
- Clay (data enrichment): $149/month
- Not needed for MVP - use email_finder.py instead

## Legal & Ethics

✅ **Allowed:**
- Scraping publicly visible Google Maps data
- Using data for business outreach
- Storing contact information (GDPR-compliant with legitimate interest)

⚠️ **Best practices:**
- Respect robots.txt
- Add delays between requests
- Don't overwhelm shop websites
- Honor opt-out requests
- Follow GDPR for data storage

## Support & Debugging

### Enable verbose logging:
```python
# In google_maps_scraper.py, add at top:
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Save screenshots for debugging:
```python
# In extract_shop_data(), add:
await self.page.screenshot(path=f'debug_{shop.name}.png')
```

### Check scraper_output/ for:
- Error logs
- Incomplete shop records
- Timestamp of last successful run

## Version History

- **v1.0** (Current)
  - Initial release
  - Berlin + Munich support
  - Auto-scoring and tiering
  - Email finder utility
  - 200 shop target

- **Future:**
  - API integration for continuous scraping
  - Automatic email sending
  - CRM auto-sync
  - Multi-city expansion

---

**Built for Bikestube** | Questions? Update this doc with findings.
