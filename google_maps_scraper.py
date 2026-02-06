#!/usr/bin/env python3
"""
Google Maps Scraper for Bike Repair Shops
Extracts shop data from Berlin and Munich for Bikestube lead generation

Target: 200 leads (100 Berlin, 100 Munich)
Output: CSV with name, address, phone, website, rating, review_count, coordinates
"""

import asyncio
import csv
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PlaywrightTimeout


class GoogleMapsScraperConfig:
    """Configuration for the scraper"""
    
    CITIES = {
        'berlin': 'Fahrrad Reparatur Berlin',
        'munich': 'Fahrrad Reparatur München'
    }
    
    TARGET_PER_CITY = 100
    SCROLL_PAUSE = 2  # seconds between scrolls
    MAX_SCROLLS = 50  # max times to scroll results
    OUTPUT_DIR = Path('/home/claude/scraper_output')
    HEADLESS = True
    
    # Selectors (may need updates if Google changes their layout)
    SEARCH_BOX = 'input#searchboxinput'
    SEARCH_BUTTON = 'button#searchbox-searchbutton'
    RESULTS_PANEL = 'div[role="feed"]'
    RESULT_ITEM = 'div[role="article"]'
    

class ShopData:
    """Data structure for a bike repair shop"""
    
    def __init__(self):
        self.name: str = ''
        self.address: str = ''
        self.phone: str = ''
        self.website: str = ''
        self.rating: Optional[float] = None
        self.review_count: Optional[int] = None
        self.latitude: Optional[float] = None
        self.longitude: Optional[float] = None
        self.google_maps_url: str = ''
        self.city: str = ''
        self.business_type: str = ''
        self.hours: str = ''
        
    def to_dict(self) -> Dict:
        """Convert to dictionary for CSV export"""
        return {
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'phone': self.phone,
            'website': self.website,
            'rating': self.rating or '',
            'review_count': self.review_count or '',
            'latitude': self.latitude or '',
            'longitude': self.longitude or '',
            'google_maps_url': self.google_maps_url,
            'business_type': self.business_type,
            'hours': self.hours,
            'scraped_at': datetime.now().isoformat()
        }
    
    def is_valid(self) -> bool:
        """Check if shop has minimum required data"""
        return bool(self.name and self.address)


class GoogleMapsScraper:
    """Scraper for bike repair shops on Google Maps"""
    
    def __init__(self, config: GoogleMapsScraperConfig):
        self.config = config
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        
    async def initialize(self):
        """Initialize browser and page"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=self.config.HEADLESS,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        # Create context with realistic settings
        context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        
        self.page = await context.new_page()
        
        # Navigate to Google Maps
        await self.page.goto('https://www.google.com/maps', wait_until='networkidle')
        await asyncio.sleep(2)
        
    async def search_location(self, query: str) -> bool:
        """Search for shops in a location"""
        try:
            # Find and fill search box
            search_box = await self.page.wait_for_selector(
                self.config.SEARCH_BOX, 
                timeout=10000
            )
            await search_box.fill(query)
            await asyncio.sleep(1)
            
            # Click search button
            search_button = await self.page.wait_for_selector(
                self.config.SEARCH_BUTTON,
                timeout=5000
            )
            await search_button.click()
            
            # Wait for results to load
            await self.page.wait_for_selector(
                self.config.RESULTS_PANEL,
                timeout=15000
            )
            await asyncio.sleep(3)
            
            return True
            
        except Exception as e:
            print(f"Error searching for '{query}': {e}")
            return False
    
    async def scroll_results(self) -> int:
        """Scroll the results panel to load more shops"""
        results_panel = await self.page.wait_for_selector(self.config.RESULTS_PANEL)
        
        previous_count = 0
        scroll_count = 0
        no_new_results_count = 0
        
        while scroll_count < self.config.MAX_SCROLLS:
            # Get current count of results
            items = await self.page.query_selector_all(self.config.RESULT_ITEM)
            current_count = len(items)
            
            print(f"  Scroll {scroll_count + 1}: Found {current_count} results")
            
            # Check if we got new results
            if current_count == previous_count:
                no_new_results_count += 1
                if no_new_results_count >= 3:
                    print("  No new results after 3 scrolls, stopping")
                    break
            else:
                no_new_results_count = 0
            
            # Scroll to bottom of results panel
            await results_panel.evaluate('element => element.scrollTop = element.scrollHeight')
            await asyncio.sleep(self.config.SCROLL_PAUSE)
            
            previous_count = current_count
            scroll_count += 1
            
        return current_count
    
    async def extract_shop_data(self, element) -> Optional[ShopData]:
        """Extract data from a single shop result element"""
        shop = ShopData()
        
        try:
            # Extract name
            name_elem = await element.query_selector('div.fontHeadlineSmall')
            if name_elem:
                shop.name = (await name_elem.inner_text()).strip()
            
            # Extract rating and review count
            rating_elem = await element.query_selector('span[role="img"]')
            if rating_elem:
                aria_label = await rating_elem.get_attribute('aria-label')
                if aria_label:
                    # Parse "4.5 stars 123 reviews" format
                    rating_match = re.search(r'([\d,\.]+)', aria_label)
                    if rating_match:
                        shop.rating = float(rating_match.group(1).replace(',', '.'))
                    
                    review_match = re.search(r'([\d,]+)\s*(?:reviews|Rezensionen|Bewertungen)', aria_label, re.IGNORECASE)
                    if review_match:
                        shop.review_count = int(review_match.group(1).replace(',', '').replace('.', ''))
            
            # Extract business type
            type_elem = await element.query_selector('div.fontBodyMedium > span:last-child')
            if type_elem:
                shop.business_type = (await type_elem.inner_text()).strip()
            
            # Click to open details panel
            await element.click()
            await asyncio.sleep(2)
            
            # Extract address
            address_elem = await self.page.query_selector('button[data-item-id="address"]')
            if address_elem:
                shop.address = (await address_elem.inner_text()).strip()
            
            # Extract phone
            phone_elem = await self.page.query_selector('button[data-item-id*="phone"]')
            if phone_elem:
                shop.phone = (await phone_elem.inner_text()).strip()
            
            # Extract website
            website_elem = await self.page.query_selector('a[data-item-id="authority"]')
            if website_elem:
                shop.website = await website_elem.get_attribute('href') or ''
            
            # Extract hours
            hours_elem = await self.page.query_selector('button[data-item-id*="oh"]')
            if hours_elem:
                shop.hours = (await hours_elem.inner_text()).strip()
            
            # Extract coordinates from URL
            url = self.page.url
            shop.google_maps_url = url
            
            # Parse coordinates from URL (format: @lat,lng,zoom)
            coord_match = re.search(r'@(-?\d+\.\d+),(-?\d+\.\d+),', url)
            if coord_match:
                shop.latitude = float(coord_match.group(1))
                shop.longitude = float(coord_match.group(2))
            
            # Alternative: parse from place data
            if not shop.latitude or not shop.longitude:
                place_match = re.search(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)', url)
                if place_match:
                    shop.latitude = float(place_match.group(1))
                    shop.longitude = float(place_match.group(2))
            
            return shop if shop.is_valid() else None
            
        except Exception as e:
            print(f"  Error extracting shop data: {e}")
            return None
    
    async def scrape_city(self, city_name: str, query: str) -> List[ShopData]:
        """Scrape all shops for a given city"""
        print(f"\n{'='*60}")
        print(f"Scraping: {city_name.upper()}")
        print(f"Query: {query}")
        print(f"{'='*60}\n")
        
        shops = []
        
        # Search for the location
        success = await self.search_location(query)
        if not success:
            print(f"Failed to search for {city_name}")
            return shops
        
        # Scroll to load more results
        total_results = await self.scroll_results()
        print(f"\nTotal results found: {total_results}")
        
        # Get all result elements
        elements = await self.page.query_selector_all(self.config.RESULT_ITEM)
        print(f"Extracting data from {len(elements)} shops...\n")
        
        # Extract data from each shop
        for i, element in enumerate(elements[:self.config.TARGET_PER_CITY], 1):
            print(f"Processing shop {i}/{min(len(elements), self.config.TARGET_PER_CITY)}...", end=' ')
            
            shop = await self.extract_shop_data(element)
            if shop:
                shop.city = city_name
                shops.append(shop)
                print(f"✓ {shop.name}")
            else:
                print("✗ Skipped (insufficient data)")
            
            # Go back to results list
            back_button = await self.page.query_selector('button[aria-label*="Back"]')
            if back_button:
                await back_button.click()
                await asyncio.sleep(1)
        
        print(f"\n✓ Extracted {len(shops)} valid shops from {city_name}")
        return shops
    
    async def close(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
    
    async def scrape_all_cities(self) -> List[ShopData]:
        """Scrape all configured cities"""
        all_shops = []
        
        await self.initialize()
        
        for city_key, query in self.config.CITIES.items():
            shops = await self.scrape_city(city_key, query)
            all_shops.extend(shops)
            
            # Small delay between cities
            if city_key != list(self.config.CITIES.keys())[-1]:
                print("\nWaiting before next city...")
                await asyncio.sleep(5)
        
        await self.close()
        
        return all_shops


def save_to_csv(shops: List[ShopData], output_path: Path):
    """Save shops to CSV file"""
    if not shops:
        print("No shops to save")
        return
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'name', 'address', 'city', 'phone', 'website',
            'rating', 'review_count', 'latitude', 'longitude',
            'google_maps_url', 'business_type', 'hours', 'scraped_at'
        ]
        
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for shop in shops:
            writer.writerow(shop.to_dict())
    
    print(f"\n✓ Saved {len(shops)} shops to: {output_path}")


def save_to_json(shops: List[ShopData], output_path: Path):
    """Save shops to JSON file (for easier enrichment later)"""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    data = {
        'scraped_at': datetime.now().isoformat(),
        'total_shops': len(shops),
        'shops': [shop.to_dict() for shop in shops]
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Saved JSON to: {output_path}")


def print_summary(shops: List[ShopData]):
    """Print summary statistics"""
    print(f"\n{'='*60}")
    print("SCRAPING SUMMARY")
    print(f"{'='*60}")
    
    print(f"\nTotal shops scraped: {len(shops)}")
    
    # By city
    by_city = {}
    for shop in shops:
        by_city[shop.city] = by_city.get(shop.city, 0) + 1
    
    print("\nBy city:")
    for city, count in by_city.items():
        print(f"  {city.capitalize()}: {count}")
    
    # With contact info
    with_phone = sum(1 for s in shops if s.phone)
    with_website = sum(1 for s in shops if s.website)
    with_rating = sum(1 for s in shops if s.rating)
    with_coords = sum(1 for s in shops if s.latitude and s.longitude)
    
    print(f"\nData completeness:")
    print(f"  With phone: {with_phone} ({with_phone/len(shops)*100:.1f}%)")
    print(f"  With website: {with_website} ({with_website/len(shops)*100:.1f}%)")
    print(f"  With rating: {with_rating} ({with_rating/len(shops)*100:.1f}%)")
    print(f"  With coordinates: {with_coords} ({with_coords/len(shops)*100:.1f}%)")
    
    # Rating statistics
    ratings = [s.rating for s in shops if s.rating]
    if ratings:
        avg_rating = sum(ratings) / len(ratings)
        print(f"\nAverage rating: {avg_rating:.2f}")
        print(f"  4.0+: {sum(1 for r in ratings if r >= 4.0)} shops")
        print(f"  3.5+: {sum(1 for r in ratings if r >= 3.5)} shops")


async def main():
    """Main execution function"""
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║     BIKESTUBE - Google Maps Shop Scraper                 ║")
    print("║     Target: Bike Repair Shops (Berlin + Munich)          ║")
    print("╚═══════════════════════════════════════════════════════════╝\n")
    
    config = GoogleMapsScraperConfig()
    scraper = GoogleMapsScraper(config)
    
    try:
        # Run the scraper
        shops = await scraper.scrape_all_cities()
        
        # Save results
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        csv_path = config.OUTPUT_DIR / f'bike_shops_{timestamp}.csv'
        json_path = config.OUTPUT_DIR / f'bike_shops_{timestamp}.json'
        
        save_to_csv(shops, csv_path)
        save_to_json(shops, json_path)
        
        # Print summary
        print_summary(shops)
        
        print(f"\n{'='*60}")
        print("✓ SCRAPING COMPLETE")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n✗ Error during scraping: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await scraper.close()


if __name__ == '__main__':
    asyncio.run(main())
