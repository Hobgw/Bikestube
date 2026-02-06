#!/usr/bin/env python3
"""
Lead Scoring & Enrichment Script
Processes scraped shop data to prioritize outreach

Scoring criteria:
- Rating ≥ 4.0: +30 points
- Rating ≥ 3.5: +15 points
- Has website: +25 points
- Has phone: +20 points
- Review count > 50: +20 points
- Review count > 20: +10 points
- E-bike keywords in name/type: +15 points

Total possible: 100 points
A-tier: 70+
B-tier: 50-69
C-tier: <50
"""

import csv
import json
import re
from pathlib import Path
from typing import Dict, List
from datetime import datetime


class LeadScorer:
    """Score and prioritize bike shop leads"""
    
    # Keywords that indicate e-bike capability (higher-value services)
    EBIKE_KEYWORDS = [
        'e-bike', 'ebike', 'e-rad', 'elektro', 'pedelec',
        'electric', 'akkustation', 'bosch'
    ]
    
    # Negative keywords (not ideal partners)
    EXCLUSION_KEYWORDS = [
        'xxl', 'decathlon', 'intersport', 'sportcheck',  # Large chains
        'gebraucht', 'second hand', 'verkauf',  # Focus on sales not repair
    ]
    
    @staticmethod
    def calculate_score(shop: Dict) -> int:
        """Calculate priority score for a shop"""
        score = 0
        
        # Rating score
        rating = shop.get('rating')
        if rating:
            try:
                rating_float = float(rating)
                if rating_float >= 4.0:
                    score += 30
                elif rating_float >= 3.5:
                    score += 15
            except (ValueError, TypeError):
                pass
        
        # Website presence (indicates digital readiness)
        if shop.get('website'):
            score += 25
        
        # Phone number (easier to contact)
        if shop.get('phone'):
            score += 20
        
        # Review count (established business)
        review_count = shop.get('review_count')
        if review_count:
            try:
                count = int(review_count)
                if count > 50:
                    score += 20
                elif count > 20:
                    score += 10
            except (ValueError, TypeError):
                pass
        
        # E-bike capability (higher ticket sizes)
        name_lower = shop.get('name', '').lower()
        type_lower = shop.get('business_type', '').lower()
        combined_text = f"{name_lower} {type_lower}"
        
        if any(keyword in combined_text for keyword in LeadScorer.EBIKE_KEYWORDS):
            score += 15
        
        return score
    
    @staticmethod
    def get_tier(score: int) -> str:
        """Convert score to tier (A/B/C)"""
        if score >= 70:
            return 'A'
        elif score >= 50:
            return 'B'
        else:
            return 'C'
    
    @staticmethod
    def should_exclude(shop: Dict) -> bool:
        """Check if shop should be excluded (chains, non-repair, etc.)"""
        name_lower = shop.get('name', '').lower()
        type_lower = shop.get('business_type', '').lower()
        combined_text = f"{name_lower} {type_lower}"
        
        return any(keyword in combined_text for keyword in LeadScorer.EXCLUSION_KEYWORDS)
    
    @staticmethod
    def extract_email_hints(shop: Dict) -> List[str]:
        """Generate potential email patterns based on website"""
        website = shop.get('website', '')
        if not website:
            return []
        
        # Extract domain
        domain_match = re.search(r'https?://(?:www\.)?([^/]+)', website)
        if not domain_match:
            return []
        
        domain = domain_match.group(1)
        
        # Common email patterns
        return [
            f"info@{domain}",
            f"kontakt@{domain}",
            f"service@{domain}",
            f"werkstatt@{domain}",
        ]


def enrich_and_score_leads(input_file: Path, output_file: Path):
    """Process scraped leads: score, tier, and enrich"""
    print(f"Processing leads from: {input_file}")
    
    shops = []
    
    # Read input CSV
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            shops.append(row)
    
    print(f"Loaded {len(shops)} shops")
    
    # Score and enrich each shop
    enriched_shops = []
    excluded_count = 0
    
    for shop in shops:
        # Check exclusions
        if LeadScorer.should_exclude(shop):
            excluded_count += 1
            continue
        
        # Calculate score
        score = LeadScorer.calculate_score(shop)
        tier = LeadScorer.get_tier(score)
        
        # Add enrichment fields
        shop['score'] = score
        shop['tier'] = tier
        shop['email_hints'] = '|'.join(LeadScorer.extract_email_hints(shop))
        shop['outreach_status'] = 'not_contacted'
        shop['notes'] = ''
        
        enriched_shops.append(shop)
    
    # Sort by score (highest first)
    enriched_shops.sort(key=lambda x: x['score'], reverse=True)
    
    # Write enriched CSV
    if enriched_shops:
        fieldnames = list(enriched_shops[0].keys())
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(enriched_shops)
    
    # Print summary
    print(f"\n{'='*60}")
    print("LEAD SCORING SUMMARY")
    print(f"{'='*60}\n")
    
    print(f"Total shops processed: {len(shops)}")
    print(f"Excluded (chains/non-repair): {excluded_count}")
    print(f"Qualified leads: {len(enriched_shops)}\n")
    
    # Tier breakdown
    tier_counts = {}
    city_counts = {}
    
    for shop in enriched_shops:
        tier = shop['tier']
        city = shop['city']
        
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
        city_counts[city] = city_counts.get(city, 0) + 1
    
    print("By tier:")
    for tier in ['A', 'B', 'C']:
        count = tier_counts.get(tier, 0)
        pct = (count / len(enriched_shops) * 100) if enriched_shops else 0
        print(f"  {tier}-tier: {count} ({pct:.1f}%)")
    
    print("\nBy city:")
    for city, count in sorted(city_counts.items()):
        print(f"  {city.capitalize()}: {count}")
    
    # Top 10 leads
    print(f"\n{'='*60}")
    print("TOP 10 PRIORITY LEADS")
    print(f"{'='*60}\n")
    
    for i, shop in enumerate(enriched_shops[:10], 1):
        print(f"{i}. [{shop['tier']}-{shop['score']}] {shop['name']}")
        print(f"   {shop['address']}")
        print(f"   Rating: {shop.get('rating', 'N/A')} ({shop.get('review_count', 'N/A')} reviews)")
        print(f"   Website: {shop.get('website', 'None')}")
        print()
    
    print(f"✓ Saved enriched leads to: {output_file}\n")


def create_outreach_list(enriched_file: Path, output_file: Path, tier: str = 'A'):
    """Create a focused list for outreach (email sequence ready)"""
    shops = []
    
    with open(enriched_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['tier'] == tier:
                shops.append(row)
    
    # Create simplified outreach CSV
    outreach_fields = [
        'name', 'email_hints', 'phone', 'website', 
        'address', 'city', 'rating', 'score', 'notes'
    ]
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=outreach_fields)
        writer.writeheader()
        
        for shop in shops:
            outreach_row = {k: shop.get(k, '') for k in outreach_fields}
            writer.writerow(outreach_row)
    
    print(f"✓ Created {tier}-tier outreach list: {output_file} ({len(shops)} shops)")


def main():
    """Main execution"""
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║     BIKESTUBE - Lead Scoring & Enrichment                ║")
    print("╚═══════════════════════════════════════════════════════════╝\n")
    
    # Find most recent scraper output
    output_dir = Path('/home/claude/scraper_output')
    csv_files = sorted(output_dir.glob('bike_shops_*.csv'), reverse=True)
    
    if not csv_files:
        print("✗ No scraper output found. Run google_maps_scraper.py first.")
        return
    
    input_file = csv_files[0]
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    enriched_file = output_dir / f'bike_shops_scored_{timestamp}.csv'
    
    # Score and enrich
    enrich_and_score_leads(input_file, enriched_file)
    
    # Create tier-specific outreach lists
    outreach_a = output_dir / f'outreach_a_tier_{timestamp}.csv'
    outreach_b = output_dir / f'outreach_b_tier_{timestamp}.csv'
    
    create_outreach_list(enriched_file, outreach_a, 'A')
    create_outreach_list(enriched_file, outreach_b, 'B')
    
    print(f"\n{'='*60}")
    print("✓ ENRICHMENT COMPLETE")
    print(f"{'='*60}")
    print("\nNext steps:")
    print("1. Review A-tier list and verify email addresses")
    print("2. Import to CRM (Airtable/Google Sheets)")
    print("3. Start email outreach with templates from /10-templates/")
    print("4. Track responses and onboarding status\n")


if __name__ == '__main__':
    main()
