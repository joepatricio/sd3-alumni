import os
import requests
import time
import csv
from playwright.sync_api import sync_playwright
from urllib.parse import urlparse, urljoin

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

def get_image_id(src):
    try:
        path = urlparse(src).path
        return path.split('/')[-1]
    except:
        return src

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

def get_main_image(page):
    page.wait_for_timeout(1000)
    imgs = page.locator('img').all()
    best_img = None
    
    for img in imgs:
        try:
            if img.is_visible():
                src = img.get_attribute("src")
                if src and "scontent" in src:
                    if "/p36x36/" in src or "/p160x160/" in src or "/s160x160/" in src or "/c0.0." in src:
                        continue
                    box = img.bounding_box()
                    if box and box['width'] > 300:
                        return img
        except:
            pass
            
    return best_img

def enter_theater_mode(page):
    links = page.locator('a').all()
    for link in links:
        try:
            if link.is_visible():
                href = link.get_attribute("href")
                if href and ("fbid=" in href or "/photo/" in href or "media/set" in href):
                    imgs_inside = link.locator('img').all()
                    if imgs_inside:
                        for img in imgs_inside:
                            box = img.bounding_box()
                            if box and 100 <= box['width'] <= 350:
                                link.click()
                                page.wait_for_timeout(3000)
                                return True
        except:
            pass
    return False

def run():
    base_dir = os.getcwd()
    gallery_dir = os.path.join(base_dir, "gallery")
    os.makedirs(gallery_dir, exist_ok=True)
    
    tracker_path = os.path.join(base_dir, "album_tracker.csv")
    tracker_exists = os.path.exists(tracker_path)
    
    with open(tracker_path, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not tracker_exists:
            writer.writerow(["Page_Name", "Album_Name", "Album_Dir", "Album_URL"])
    
    with sync_playwright() as p:
        print("Connecting to your existing Chrome browser on port 9222...")
        try:
            browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
        except Exception as e:
            print("\nERROR: Could not connect to Chrome on port 9222.")
            return
            
        context = browser.contexts[0]
        page = context.new_page()
        
        print("Proceeding with scraping using your existing session...")
        
        for page_idx, page_url in enumerate(PAGES):
            print(f"\nProcessing page {page_idx+1}/{len(PAGES)}: {page_url}")
            page_name = f"page_{page_idx+1}"
            try:
                page.goto(page_url, timeout=30000)
                page.wait_for_timeout(3000)
            except Exception as e:
                print(f"Failed to load {page_url}: {e}")
                continue
                
            for _ in range(3):
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(1000)
                
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
            
            albums_to_visit = list(album_hrefs)
            albums_to_visit.append(page_url)  # Root photos page fallback
            
            for album_idx, album_url in enumerate(albums_to_visit):
                album_name = f"album_{album_idx+1}"
                album_dir_relative = f"gallery/{page_name}/{album_name}"
                album_dir_absolute = os.path.join(base_dir, "gallery", page_name, album_name)
                
                os.makedirs(album_dir_absolute, exist_ok=True)
                
                # Log to tracker
                with open(tracker_path, mode='a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow([page_name, album_name, album_dir_relative, album_url])
                
                print(f"  Visiting {album_name}: {album_url}")
                try:
                    page.goto(album_url, timeout=30000)
                    page.wait_for_timeout(3000)
                except:
                    continue
                    
                page.evaluate("window.scrollTo(0, 500)")
                page.wait_for_timeout(1000)

                if not enter_theater_mode(page):
                    print("    Failed to find a valid photo thumbnail to click. Skipping album.")
                    continue
                
                downloaded = 0
                album_seen_src_ids = set()
                consecutive_fails = 0
                last_src_id = None
                
                while downloaded < 15:
                    try:
                        main_img = get_main_image(page)
                        if not main_img:
                            page.wait_for_timeout(2000)
                            main_img = get_main_image(page)
                            
                        if not main_img:
                            consecutive_fails += 1
                            if consecutive_fails > 3:
                                print("    Could not find HD image. Breaking album loop.")
                                break
                            page.keyboard.press("ArrowRight")
                            page.wait_for_timeout(2000)
                            continue
                            
                        consecutive_fails = 0
                        src = main_img.get_attribute("src")
                        src_id = get_image_id(src)
                        
                        if src_id == last_src_id:
                            page.wait_for_timeout(2000)
                            main_img = get_main_image(page)
                            if main_img and get_image_id(main_img.get_attribute("src")) == last_src_id:
                                print("    Image not advancing. End of album.")
                                break
                        
                        last_src_id = src_id
                        
                        if src_id in album_seen_src_ids:
                            print("    Cycled back to beginning of album. Moving to next album.")
                            break
                            
                        album_seen_src_ids.add(src_id)
                        
                        success = download_image(src, album_dir_absolute, f"img_{downloaded+1}")
                        if success:
                            downloaded += 1
                            print(f"    Downloaded HD image {downloaded}/15")
                                
                        page.keyboard.press("ArrowRight")
                        page.wait_for_timeout(1500)
                    except Exception as e:
                        print(f"    Error in theater loop: {e}")
                        break

            print(f"Finished processing {page_name}.")

        print("\nAll pages processed. Closing our tab.")
        try:
            page.close()
        except:
            pass

if __name__ == "__main__":
    run()
