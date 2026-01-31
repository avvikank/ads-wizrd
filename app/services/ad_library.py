from app.models import ProjectContext, AdRecord
from typing import List, Dict
import urllib.parse
import random
import time
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

BASE_URL = "https://www.facebook.com/ads/library/"

def generate_search_urls(context: ProjectContext) -> List[Dict[str, str]]:
    urls = []
    country_param = context.country if context.country != "ALL" else "ALL"
    base_params = {
        "active_status": "all",
        "ad_type": "all",
        "country": country_param,
        "media_type": "all",
        "sort_data[direction]": "desc",
        "sort_data[mode]": "relevance_monthly_grouped",
        "search_type": "keyword_unordered"
    }

    keywords = context.keyword_clusters.get("primary", []) if context.keyword_clusters else []
    if context.category:
        keywords.append(context.category)

    for kw in keywords:
        params = base_params.copy()
        params["q"] = kw
        query_string = urllib.parse.urlencode(params)
        urls.append({
            "label": f"Search: {kw}",
            "url": f"{BASE_URL}?{query_string}"
        })

    return urls

async def search_ads_real(keywords: List[str], country: str = "ALL") -> List[AdRecord]:
    """Fetches real ads from Meta Ad Library using Playwright asynchronously."""
    if not keywords:
        return search_ads_mock(keywords)
    
    ads = []
    search_query = " ".join(keywords)
    search_url = f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country={country}&q={urllib.parse.quote(search_query)}&search_type=keyword_unordered&media_type=all"
    
    stealth = Stealth()
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            await stealth.apply_stealth_async(page)
            
            print(f"Navigating to {search_url}...")
            await page.goto(search_url, wait_until="networkidle", timeout=60000)
            
            # Wait for any ad card to appear
            try:
                await page.wait_for_selector('div[role="article"]', timeout=15000)
            except:
                print("Timeout waiting for ad cards. Meta might be blocking or no results.")
                await browser.close()
                return search_ads_mock(keywords)

            # Scroll to load more
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
            time.sleep(1) # Small sleep for rendering

            cards = await page.query_selector_all('div[role="article"]')
            print(f"Found {len(cards)} ad cards.")

            for card in cards[:12]: # Fetch up to 12
                try:
                    # Generic extraction logic
                    # Advertiser is usually a link or text near the top
                    advertiser = "Unknown Advertiser"
                    adv_elem = await card.query_selector('a span') or await card.query_selector('span[dir="auto"]')
                    if adv_elem:
                        advertiser = await adv_elem.inner_text()
                    
                    # Primary text is usually the first long text block
                    primary_text = ""
                    text_elems = await card.query_selector_all('div')
                    for te in text_elems:
                        text = (await te.inner_text()).strip()
                        if len(text) > 40:
                            primary_text = text
                            break
                    
                    # Headline
                    headline = ""
                    headline_elem = await card.query_selector('strong')
                    if headline_elem:
                        headline = await headline_elem.inner_text()

                    # Media URL
                    media_url = None
                    img_elem = await card.query_selector('img')
                    if img_elem:
                        media_url = await img_elem.get_attribute('src')
                    
                    # Snapshot URL (Meta ID)
                    snapshot_url = ""
                    link_elem = await card.query_selector('a[href*="/ads/library/?id="]')
                    if link_elem:
                        snapshot_url = await link_elem.get_attribute('href')
                        if snapshot_url and not snapshot_url.startswith('http'):
                            snapshot_url = f"https://www.facebook.com{snapshot_url}"
                    
                    ads.append(AdRecord(
                        advertiser=advertiser,
                        snapshot_url=snapshot_url or f"https://www.facebook.com/ads/library/?q={urllib.parse.quote(search_query)}",
                        primary_text=primary_text,
                        headline=headline,
                        media_url=media_url,
                        media_type="image" if media_url else "unknown",
                        cta="Learn More",
                        placements=["Facebook", "Instagram"]
                    ))
                except Exception as e:
                    print(f"Error parsing card: {e}")
                    continue

            await browser.close()
            
            if not ads:
                return search_ads_mock(keywords)
            return ads

    except Exception as e:
        print(f"Scraping failed: {e}")
        return search_ads_mock(keywords)

def search_ads_mock(keywords: List[str]) -> List[AdRecord]:
    """Generates mock ads for in-app rendering demo."""
    mock_ads = []
    advertisers = ["MarketFlow AI", "CreativePulse", "AdVantage Pro", "GrowthScale", "VibeCheck", "BrandPulse"]
    cta_options = ["Learn More", "Shop Now", "Sign Up", "Get Offer", "Book Now"]
    ai_labels = ["UGC", "Direct Response", "Educational", "High Urgency", "Social Proof", "Benefit-Led", "Storytelling", "Aesthetic"]
    
    for i in range(12): # Generate 12 mock ads
        kw = random.choice(keywords) if keywords else "Marketing"
        advertiser = random.choice(advertisers)
        label = random.choice(ai_labels)
        mock_ads.append(AdRecord(
            advertiser=advertiser,
            snapshot_url=f"https://www.facebook.com/ads/library/?id={random.randint(1000000, 9999999)}",
            primary_text=f"[{label}] Unlock the power of {kw} with {advertiser}. Our proven strategies help you scale faster and reach more customers.",
            headline=f"{label}: Transform your {kw} strategy!",
            cta=random.choice(cta_options),
            media_type=random.choice(["image", "video", "carousel"]),
            placements=["Facebook", "Instagram", "Messenger"]
        ))
    return mock_ads
