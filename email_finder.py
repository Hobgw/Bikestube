#!/usr/bin/env python3
"""
Email Finder - Extract emails from shop websites
Crawls shop websites to find contact email addresses

Usage: python email_finder.py <scored_leads.csv>
"""

import asyncio
import csv
import re
from pathlib import Path
from typing import List, Optional, Set
from playwright.async_api import async_playwright


class EmailFinder:
    """Find email addresses from shop websites"""
    
    EMAIL_PATTERN = re.compile(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    )
    
    # Common contact page paths
    CONTACT_PATHS = [
        '/kontakt',
        '/contact',
        '/impressum',
        '/about',
        '/ueber-uns',
    ]
    
    # Emails to ignore (generic/spam)
    IGNORE_EMAILS = {
        'info@example.com',
        'contact@example.com',
        'noreply@',
        'support@google.com',
        'support@facebook.com',
    }
    
    def __init__(self, timeout: int = 10000):
        self.timeout = timeout
        self.browser = None
        self.context = None
    
    async def initialize(self):
        """Initialize browser"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
    
    async def close(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
    
    def extract_emails(self, text: str) -> Set[str]:
        """Extract email addresses from text"""
        emails = set(self.EMAIL_PATTERN.findall(text))
        
        # Filter out ignored emails
        filtered = set()
        for email in emails:
            email_lower = email.lower()
            if not any(ignore in email_lower for ignore in self.IGNORE_EMAILS):
                filtered.add(email_lower)
        
        return filtered
    
    async def find_emails_on_page(self, url: str) -> Set[str]:
        """Find emails on a specific page"""
        try:
            page = await self.context.new_page()
            await page.goto(url, timeout=self.timeout, wait_until='domcontentloaded')
            
            # Get page content
            content = await page.content()
            
            # Extract emails
            emails = self.extract_emails(content)
            
            await page.close()
            return emails
            
        except Exception as e:
            print(f"    Error loading {url}: {e}")
            return set()
    
    async def find_shop_emails(self, website: str, shop_name: str) -> List[str]:
        """Find emails for a shop by checking homepage and contact pages"""
        if not website:
            return []
        
        print(f"  Checking: {shop_name}")
        all_emails = set()
        
        # Clean up website URL
        if not website.startswith('http'):
            website = f'https://{website}'
        
        # Check homepage
        homepage_emails = await self.find_emails_on_page(website)
        all_emails.update(homepage_emails)
        
        # Check common contact pages
        for path in self.CONTACT_PATHS:
            contact_url = website.rstrip('/') + path
            contact_emails = await self.find_emails_on_page(contact_url)
            all_emails.update(contact_emails)
            
            # If we found emails, no need to check more pages
            if all_emails:
                break
        
        if all_emails:
            print(f"    ✓ Found: {', '.join(all_emails)}")
        else:
            print(f"    ✗ No emails found")
        
        return sorted(list(all_emails))


async def enrich_with_emails(input_file: Path, output_file: Path, limit: int = None):
    """Enrich leads CSV with found email addresses"""
    print(f"Loading leads from: {input_file}")
    
    shops = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            shops.append(row)
    
    print(f"Loaded {len(shops)} shops")
    
    # Filter shops with websites
    shops_with_websites = [s for s in shops if s.get('website')]
    print(f"Shops with websites: {len(shops_with_websites)}")
    
    if limit:
        shops_with_websites = shops_with_websites[:limit]
        print(f"Limited to first {limit} shops")
    
    # Initialize email finder
    finder = EmailFinder()
    await finder.initialize()
    
    print(f"\nFinding emails...\n")
    
    # Process each shop
    found_count = 0
    for i, shop in enumerate(shops_with_websites, 1):
        print(f"[{i}/{len(shops_with_websites)}]")
        
        emails = await finder.find_shop_emails(
            shop.get('website', ''),
            shop.get('name', 'Unknown')
        )
        
        if emails:
            shop['found_emails'] = '|'.join(emails)
            found_count += 1
        else:
            shop['found_emails'] = ''
        
        # Small delay to be respectful
        await asyncio.sleep(1)
    
    await finder.close()
    
    # Update all shops (including those without websites)
    for shop in shops:
        if 'found_emails' not in shop:
            shop['found_emails'] = ''
    
    # Save enriched data
    if shops:
        fieldnames = list(shops[0].keys())
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(shops)
    
    # Summary
    print(f"\n{'='*60}")
    print("EMAIL FINDER SUMMARY")
    print(f"{'='*60}\n")
    print(f"Shops checked: {len(shops_with_websites)}")
    print(f"Emails found: {found_count} ({found_count/len(shops_with_websites)*100:.1f}%)")
    print(f"\n✓ Saved to: {output_file}\n")


async def main():
    """Main execution"""
    import sys
    
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║     BIKESTUBE - Email Finder                             ║")
    print("╚═══════════════════════════════════════════════════════════╝\n")
    
    # Find most recent scored leads
    output_dir = Path('/home/claude/scraper_output')
    scored_files = sorted(output_dir.glob('bike_shops_scored_*.csv'), reverse=True)
    
    if not scored_files:
        print("✗ No scored leads found. Run lead_scorer.py first.")
        return
    
    input_file = scored_files[0]
    output_file = output_dir / input_file.name.replace('scored', 'with_emails')
    
    # Ask for limit
    print(f"Found: {input_file.name}")
    print("\nThis will check shop websites for email addresses.")
    print("Checking all shops can take 30-60 minutes.\n")
    
    limit_input = input("How many shops to check? (Enter number or 'all'): ").strip()
    
    limit = None
    if limit_input.lower() != 'all':
        try:
            limit = int(limit_input)
        except ValueError:
            print("Invalid input, checking first 20 shops")
            limit = 20
    
    await enrich_with_emails(input_file, output_file, limit)
    
    print("✓ Complete!")
    print("\nNext: Import to CRM and start outreach")


if __name__ == '__main__':
    asyncio.run(main())
