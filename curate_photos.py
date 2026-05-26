import os
import requests
import time
from playwright.sync_api import sync_playwright
import re
from urllib.parse import urljoin

PAGES = [
    "https://www.facebook.com/usjr.ec/photos_albums",
    "https://www.facebook.com/USJREMS/photos_albums",
    "https://www.facebook.com/psimusjr/photos_albums",
    "https://www.facebook.com/piceusjrchptr/photos_albums",
    "https://www.facebook.com/iiee.org/photos_albums",
    "https://www.facebook.com/usjr.iecep/photos_albums",
    "https://www.facebook.com/usjrcomes/photos_albums",
    "https://www.facebook.com/usjrIEJOINTS/photos_albums",
    "https://www.facebook.com/profile.php?id=61579301007838&sk=photos_albums"
]

KEYWORDS = [
    "graduation", "grad", "alumni", "group", "candid", "classroom", 
    "student", "students", "laugh", "smile", "smiling", "event", 
    "organization", "org", "uniform", "friends", "friendship", "legacy", "people", "standing", "text"
]

def download_image(url, folder, prefix):
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            filename = f"{prefix}_{int(time.time()*1000)}.jpg"
            filepath = os.path.join(folder, filename)
            with open(filepath, 'wb') as f:
                f.write(r.content)
            return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return False

def run():
    gallery_dir = os.path.join(os.getcwd(), "gallery")
    os.makedirs(gallery_dir, exist_ok=True)
    
    with sync_playwright() as p:
        print("Connecting to your existing Chrome browser...")
        try:
            # Connect to existing Chrome over debugging port
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception as e:
            print("\nERROR: Could not connect to Chrome on port 9222.")
            print("Did you start Chrome with the '--remote-debugging-port=9222' flag?")
            print(f"Details: {e}")
            return
            
        # Get the first context
        context = browser.contexts[0]
        page = context.new_page()
        
        print("Proceeding with scraping using your existing session...")
        
        for idx, page_url in enumerate(PAGES):
            print(f"\nProcessing page {idx+1}/{len(PAGES)}: {page_url}")
            page_name = "page_" + str(idx+1)
            try:
                page.goto(page_url, timeout=30000)
                page.wait_for_timeout(3000) # wait for elements to load
            except Exception as e:
                print(f"Failed to load {page_url}: {e}")
                continue
                
            # Try to scroll a bit to load albums
            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1000)
                
            # Find album links
            album_hrefs = set()
            links = page.locator("a").all()
            for link in links:
                try:
                    href = link.get_attribute("href")
                    if href:
                        if "/media/set" in href or "/photos/a." in href or "/photos/p." in href or "set=a." in href:
                            album_hrefs.add(urljoin(page_url, href))
                except:
                    pass
            
            print(f"Found {len(album_hrefs)} potential albums/photos links.")
            
            downloaded = 0
            albums_to_visit = list(album_hrefs)[:8] # Visit up to 8 albums per page
            albums_to_visit.append(page_url) # And also scrape the albums root page
            
            seen_srcs = set()
            
            for album_url in albums_to_visit:
                if downloaded >= 100:
                    break
                print(f"  Visiting album: {album_url}")
                try:
                    page.goto(album_url, timeout=30000)
                    page.wait_for_timeout(3000)
                except:
                    continue
                    
                # Scroll to load images
                for _ in range(5):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(1500)
                    
                images = page.locator("img").all()
                for img in images:
                    if downloaded >= 100:
                        break
                    try:
                        src = img.get_attribute("src")
                        alt = img.get_attribute("alt") or ""
                        
                        if not src or "scontent" not in src or src in seen_srcs:
                            continue
                            
                        alt_lower = alt.lower()
                        match = False
                        
                        if not alt:
                            match = True 
                        else:
                            for kw in KEYWORDS:
                                if kw in alt_lower:
                                    match = True
                                    break
                                    
                        if match:
                            success = download_image(src, gallery_dir, f"{page_name}_{downloaded+1}")
                            if success:
                                downloaded += 1
                                seen_srcs.add(src)
                                print(f"    Downloaded image {downloaded}/100")
                    except:
                        pass

            print(f"Finished processing {page_name}. Downloaded {downloaded} images.")

        print("\nAll pages processed. Closing our tab.")
        page.close()
        # Note: we don't close `browser` because it's the user's actual Chrome!

if __name__ == "__main__":
    run()
