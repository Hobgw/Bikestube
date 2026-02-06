#!/bin/bash
# Setup and run script for Bikestube Google Maps scraper

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     BIKESTUBE - Shop Scraper Setup & Run                 ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python 3 found"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements_scraper.txt

# Install Playwright browsers
echo ""
echo "Installing Playwright Chromium browser..."
playwright install chromium

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Setup Complete! Choose an option:                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "1. Run full scraper (Berlin + Munich)"
echo "2. Score and enrich existing leads"
echo "3. Both (scrape then score)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Starting scraper..."
        python3 google_maps_scraper.py
        ;;
    2)
        echo ""
        echo "Starting lead scorer..."
        python3 lead_scorer.py
        ;;
    3)
        echo ""
        echo "Running full pipeline..."
        python3 google_maps_scraper.py && python3 lead_scorer.py
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✓ Complete! Check /home/claude/scraper_output/ for results."
