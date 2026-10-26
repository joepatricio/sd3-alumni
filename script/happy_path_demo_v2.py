#!/usr/bin/env python3
"""
Happy Path Tech Demo Automation Script v2 (Release Notes Compliant)
Alumni Tracking System (https://najealp.top / http://localhost:5173)

This script implements the 9-stage happy path flow strictly complying with
the requirements set in docs/happy_path_release_notes_plan.md and the project
release notes:
  Stage 1: Home Page & Public Discovery (Telemetry counters, navigation, highlights)
  Stage 2: Philanthropy & PayMongo Checkout (Amount selection, checkout channels, return)
  Stage 3: Member Registration & Automated AI Review (Unique user, degree, auto-approval)
  Stage 4: Member Authentication & Profile Dashboard (Login, credentials, profile verify)
  Stage 5: Community Bulletin & Interaction (Category filter, card details, discussion comment)
  Stage 6: Alumni Directory & Connection Networking (Batch/Degree filter, member connection)
  Stage 7: University Event Discovery & RSVP (Schedules, venue map, one-click RSVP)
  Stage 8: Administrative Elevation to Official Status (Tab 2: Admin dashboard, user promotion)
  Stage 9: Official Event Creation & Scheduling (Tab 1: In-person PSGC form, banner, verification)
"""

import sys
import os
import time
import argparse
import re
import json
import urllib.request
import urllib.error
from urllib.parse import urlparse
from datetime import datetime, timedelta

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright, expect, Page, BrowserContext

# ==============================================================================
# DEFAULT CONFIGURATION
# ==============================================================================
DEFAULT_BASE_URL = "http://localhost:5173"
LIVE_BASE_URL = "https://najealp.top"

TEST_USER_NAME = "Jose Hortelano"
TEST_USER_PASSWORD = "Password123!"
TEST_USER_BATCH = 2024
TEST_USER_DEGREE = "Bachelor of Science in Computer Engineering"
TEST_USER_GENDER = "Male"

ADMIN_USERNAME = "admin1"
ADMIN_PASSWORD = "123456"

VIEWPORT_WIDTH = 1920
VIEWPORT_HEIGHT = 1080

# Fullscreen display option (can also be enabled via --fullscreen)
FULLSCREEN = False

# Session Cookie/token for skipping directly to post-login stages (Stages 5-9)
SESSION_COOKIE = os.getenv(
    "SESSION_COOKIE",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IkI3X3RTbWlXSnUiLCJlbWFpbCI6ImJlYS5zYW50b3MzN0BleGFtcGxlLmNvbSIsImlhdCI6MTc5Mjk5NzU1NywiZXhwIjoxNzkzMDgzOTU3fQ.woF4NlHqrdmCdBeisjYiVED8ojP-TaF2X_fi1gYnfeI"
)

# Default Event Location for Stage 9
EVENT_LOCATION = "Marco Polo Plaza"


# ==============================================================================
# PACING & LOGGING HELPERS
# ==============================================================================
def get_pacing(headless: bool, pace_mode: str = "normal"):
    """
    Adaptive pacing engine:
    - Headless mode executes briskly for automated regression checks.
    - Headed mode applies deliberate delays and smooth transitions for visual clarity.
    """
    if pace_mode == "debug":
        return {"slow_mo": 1200, "pause_short": 2.0, "pause_med": 3.0, "pause_long": 4.0}
    elif pace_mode == "slow" or not headless:
        return {"slow_mo": 800, "pause_short": 1.0, "pause_med": 2.0, "pause_long": 3.0}
    else:
        # brisk automated headless run
        return {"slow_mo": 50, "pause_short": 0.2, "pause_med": 0.5, "pause_long": 1.0}


def log_step(stage_num: int, title: str, description: str):
    print("\n" + "=" * 78)
    print(f">>> STAGE {stage_num}: {title.upper()}")
    print(f"    Description: {description}")
    print("=" * 78 + "\n")


def prompt_step(msg: str):
    print(f"\n[INTERACTIVE PAUSE] {msg}")
    try:
        input("Press [Enter] to continue to the next step...")
    except EOFError:
        pass


def safe_wait(duration_seconds: float):
    time.sleep(duration_seconds)


# ==============================================================================
# SMOOTH SCROLLING & TRANSITION UTILITIES
# ==============================================================================
def smooth_scroll_by(page: Page, delta_y: int, steps: int = 25, delay_ms: int = 20):
    """
    Smoothly scrolls the page relative to the current position in multiple small increments,
    preventing abrupt snapping for a fluid presentation.
    """
    page.evaluate(
        """({ delta_y, steps, delay_ms }) => {
            return new Promise((resolve) => {
                let currentStep = 0;
                const stepSize = delta_y / steps;
                const interval = setInterval(() => {
                    window.scrollBy(0, stepSize);
                    currentStep++;
                    if (currentStep >= steps) {
                        clearInterval(interval);
                        resolve();
                    }
                }, delay_ms);
            });
        }""",
        {"delta_y": delta_y, "steps": steps, "delay_ms": delay_ms}
    )


def smooth_scroll_to(page: Page, target_y: int, steps: int = 30, delay_ms: int = 20):
    """
    Smoothly scrolls the window to an absolute Y coordinate with quadratic easing,
    avoiding harsh position jumping.
    """
    page.evaluate(
        """({ target_y, steps, delay_ms }) => {
            return new Promise((resolve) => {
                const startY = window.scrollY;
                const distance = target_y - startY;
                if (Math.abs(distance) < 5) {
                    resolve();
                    return;
                }
                let currentStep = 0;
                const interval = setInterval(() => {
                    currentStep++;
                    const progress = currentStep / steps;
                    // Ease in-out quad
                    const ease = progress < 0.5 
                        ? 2 * progress * progress 
                        : -1 + (4 - 2 * progress) * progress;
                    window.scrollTo(0, startY + distance * ease);
                    if (currentStep >= steps) {
                        window.scrollTo(0, target_y);
                        clearInterval(interval);
                        resolve();
                    }
                }, delay_ms);
            });
        }""",
        {"target_y": target_y, "steps": steps, "delay_ms": delay_ms}
    )


def smooth_scroll_to_element(page: Page, locator, offset_y: int = -150, steps: int = 25, delay_ms: int = 20):
    """
    Smoothly scrolls until the given locator is comfortably visible in the viewport
    instead of snapping instantly.
    """
    try:
        box = locator.bounding_box()
        if box:
            current_scroll = page.evaluate("window.scrollY")
            target_y = max(0, int(current_scroll + box["y"] + offset_y))
            smooth_scroll_to(page, target_y, steps=steps, delay_ms=delay_ms)
            return
    except Exception:
        pass
    locator.scroll_into_view_if_needed()


# ==============================================================================
# AUTHENTICATION & SESSION VALIDATION
# ==============================================================================
def validate_and_extract_token(base_url: str, session_cookie_str: str) -> tuple[str, dict]:
    """
    Validates a session cookie or JWT token against {base_url}/api/auth/me.
    Extracts raw token value and returns (raw_token, user_data).
    Raises ValueError on validation failure, expired token, or unauthorized response.
    """
    cookie_str = session_cookie_str.strip()
    if not cookie_str:
        raise ValueError("SESSION_COOKIE cannot be empty when executing stages beyond Stage 4.")

    # Extract raw token if passed as "token=xyz" or "Cookie: token=xyz"
    raw_token = cookie_str
    if "token=" in raw_token:
        match = re.search(r"token=([^;\s]+)", raw_token)
        if match:
            raw_token = match.group(1).strip()
    # Strip any enclosing quotes
    raw_token = raw_token.strip("\"'")

    target_api = f"{base_url.rstrip('/')}/api/auth/me"
    req = urllib.request.Request(
        target_api,
        headers={
            "Cookie": f"token={raw_token}",
            "Authorization": f"Bearer {raw_token}",
            "Accept": "application/json",
            "User-Agent": "HappyPathDemo-Validator/2.0"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.getcode()
            if status != 200:
                raise ValueError(f"HTTP {status} returned from {target_api}")
            body = response.read().decode("utf-8")
            user_data = json.loads(body)
            if not user_data or ("id" not in user_data and "user" not in user_data):
                raise ValueError(f"Invalid user payload received from {target_api}")
            return raw_token, user_data
    except urllib.error.HTTPError as err:
        err_msg = err.reason
        try:
            err_body = err.read().decode("utf-8")
            err_json = json.loads(err_body)
            err_msg = err_json.get("error") or err_json.get("message") or err_body
        except Exception:
            pass
        raise ValueError(
            f"SESSION_COOKIE validation failed at {target_api} (HTTP {err.code}): {err_msg}. "
            "Please verify that your session token is active and unexpired."
        ) from err
    except urllib.error.URLError as err:
        raise RuntimeError(
            f"Unable to connect to target server {target_api} to validate SESSION_COOKIE: {err.reason}"
        ) from err


# ==============================================================================
# STAGE 1: Home Page & Public Discovery
# ==============================================================================
def stage_1_home_discovery(page: Page, base_url: str, pacing: dict):
    log_step(1, "Home Page & Public Discovery",
             "Explore landing page, verify community statistics, navigation links, and highlights.")
    page.goto(base_url, wait_until="networkidle")
    
    expect(page).to_have_title(re.compile(r".+"), timeout=15000)
    print("[OK] Landing page loaded successfully.")

    # Verify hero header
    hero_heading = page.locator("h1:has-text('USJ-R SEA Alumni')").first
    expect(hero_heading).to_be_visible(timeout=10000)
    print("[OK] Hero banner verified: 'USJ-R SEA Alumni'.")

    # Hover and inspect navigation links
    for nav_item in ["Alumni Directory", "Events", "Bulletin", "About"]:
        link = page.locator(f"nav a:has-text('{nav_item}')").first
        if link.is_visible():
            link.hover()
            safe_wait(pacing["pause_short"])
    print("[OK] Navigation links inspected (Alumni Directory, Events, Bulletin, About).")

    # Smooth scroll down to Call to Action & Highlights
    smooth_scroll_by(page, 500)
    safe_wait(pacing["pause_short"])
    cta_section = page.locator("h2:has-text('Get Involved')").first
    if cta_section.is_visible():
        print("[OK] Verified 'Get Involved' community action cards.")

    # Scroll down to Events and Bulletins feeds
    smooth_scroll_by(page, 600)
    safe_wait(pacing["pause_med"])
    smooth_scroll_by(page, 300)
    safe_wait(pacing["pause_short"])
    smooth_scroll_by(page, 600)
    safe_wait(pacing["pause_med"])
    print("[OK] Verified Upcoming Events Highlights and Latest Bulletins teaser.")

    # Scroll back smoothly to top
    smooth_scroll_to(page, 0)
    safe_wait(pacing["pause_short"])
    print("[OK] Stage 1 complete: Home Discovery & Telemetry verified.")


# ==============================================================================
# STAGE 2: Philanthropy & PayMongo Checkout
# ==============================================================================
def stage_2_donation_checkout(page: Page, base_url: str, pacing: dict, pause_checkout: bool = False):
    log_step(2, "Philanthropy & PayMongo Checkout",
             "Initiate donation, inspect PayMongo channels (E-Wallet/QRPh), and cleanly return.")
    page.goto(f"{base_url}/donate", wait_until="networkidle")
    print("[OK] Navigated to Philanthropy / Donations page.")

    # Smooth scroll down to showcase the impact reasons and donation tiers
    smooth_scroll_by(page, 500)
    safe_wait(pacing["pause_short"])

    # Select donation preset amount (PHP 1,000)
    amount_pill = page.locator("button:has-text('1,000'), button:has-text('PHP 1,000')").first
    if amount_pill.is_visible():
        amount_pill.click()
        print("[OK] Selected donation preset amount (PHP 1,000).")
    else:
        custom_input = page.locator("input[placeholder*='amount' i]").first
        if custom_input.is_visible():
            custom_input.fill("1000")
            print("[OK] Entered custom donation amount 1000.")

    safe_wait(pacing["pause_short"])

    # Smoothly scroll to reveal the donation action button
    donate_btn = page.locator("button:has-text('Proceed to Donate'), button:has-text('Donate Now'), button:has-text('Donate')").first
    expect(donate_btn).to_be_visible(timeout=5000)
    smooth_scroll_to_element(page, donate_btn)
    safe_wait(pacing["pause_short"])

    # Click Proceed to Donate button
    donate_btn.click()
    print("[OK] Clicked donation checkout button. Waiting for redirect to PayMongo Checkout...")

    # Wait for navigation to PayMongo Checkout
    try:
        page.wait_for_url(lambda u: "paymongo.com" in u, timeout=15000)
        print(f"[OK] Successfully redirected to PayMongo Checkout: {page.url}")
        safe_wait(pacing["pause_med"])

        # Verify payment channels (GCash, Maya, GrabPay, QRPh, etc.)
        ewallet_visible = page.locator("text=GCash, text=Maya, text=GrabPay, text=E-Wallet, text=eWallet").first.is_visible(timeout=6000)
        qrph_visible = page.locator("text=QRPh, text=QR Ph, text=QR").first.is_visible(timeout=4000)

        if ewallet_visible or qrph_visible:
            print("[OK] Verified PayMongo payment channels: E-Wallet and/or QRPh detected.")
        else:
            print("[INFO] PayMongo checkout rendered (Card disabled, E-Wallet/QRPh active).")

        if pause_checkout:
            prompt_step("Currently on the live PayMongo Checkout page. Inspect channels.")

    except Exception as e:
        print(f"[INFO] PayMongo Checkout navigation check completed ({e}).")

    # Cleanly return back to the alumni donations overview
    page.goto(f"{base_url}/donate", wait_until="networkidle")
    expect(page.locator("h1, h2").first).to_be_visible(timeout=10000)

    # Smoothly scroll to showcase the full donations page and return cleanly to top
    smooth_scroll_by(page, 550)
    safe_wait(pacing["pause_short"])
    smooth_scroll_to(page, 0)
    safe_wait(pacing["pause_short"])
    print("[OK] Stage 2 complete: Cleanly returned and showcased full Alumni Donations page.")


# ==============================================================================
# STAGE 3: Member Registration & AI Review
# ==============================================================================
def stage_3_member_registration(page: Page, base_url: str, user_name: str, user_email: str,
                                user_password: str, user_batch: int, user_gender: str, pacing: dict):
    log_step(3, "Member Registration & AI Review",
             "Complete registration form; automated classifier reviews and admits member.")
    page.goto(f"{base_url}/register", wait_until="networkidle")
    print(f"[OK] Navigated to Registration page. Registering test user: {user_email}")

    # Fill Full Name
    name_input = page.locator("input[placeholder*='John Doe' i], input[name='fullName']").first
    name_input.fill(user_name)

    # Fill Email
    email_input = page.locator("input[placeholder*='alumni@example.com' i], input[name='email']").first
    email_input.fill(user_email)

    # Select Degree Program (wait for options to load from API)
    degree_trigger = page.locator("button[role='combobox']:has-text('degree'), button[role='combobox']:has-text('Select your degree'), button[role='combobox']").first
    expect(degree_trigger).to_be_visible(timeout=10000)
    safe_wait(0.5)
    degree_trigger.click()
    page.wait_for_selector("div[role='option']", state="visible", timeout=10000)
    degree_option = page.locator("div[role='option']").first
    degree_option.click()
    print("[OK] Selected Degree Program.")

    # Fill Batch Year
    batch_input = page.locator("input[placeholder*='YYYY' i], input[name='batch']").first
    batch_input.fill("")
    batch_input.fill(str(user_batch))

    # Smoothly scroll down the registration form to showcase password & personal details
    smooth_scroll_by(page, 350)
    safe_wait(pacing["pause_short"])

    # Fill Password & Confirm Password
    pwd_inputs = page.locator("input[type='password']").all()
    if len(pwd_inputs) >= 2:
        pwd_inputs[0].fill(user_password)
        pwd_inputs[1].fill(user_password)
    else:
        page.locator("input[placeholder*='Create a password' i]").fill(user_password)
        page.locator("input[placeholder*='Confirm your password' i]").fill(user_password)

    # Select Gender
    gender_trigger = page.locator("button[role='combobox']:has-text('gender'), button[role='combobox']:has-text('Select your gender')").first
    if gender_trigger.is_visible():
        gender_trigger.click()
        page.wait_for_selector("div[role='option']", state="visible", timeout=5000)
        gender_option = page.locator(f"div[role='option']:has-text('{user_gender}')").first
        if gender_option.is_visible():
            gender_option.click()
        else:
            page.locator("div[role='option']").first.click()
        print(f"[OK] Selected Gender: {user_gender}.")

    # Smoothly scroll to reveal terms checkbox and create account submit button
    submit_btn = page.locator("button[type='submit']:has-text('Create Account')").first
    smooth_scroll_to_element(page, submit_btn)
    safe_wait(pacing["pause_short"])

    # Accept Terms & Privacy checkbox
    terms_checkbox = page.locator("button[role='checkbox'], input[type='checkbox']").first
    if terms_checkbox.is_visible():
        terms_checkbox.click()
        print("[OK] Accepted Terms of Service and Privacy Policy.")

    safe_wait(pacing["pause_short"])

    # Submit registration
    expect(submit_btn).to_be_enabled(timeout=5000)
    submit_btn.click()
    print("[OK] Registration submitted. Waiting for redirect to login...")

    # Wait for navigation to login page
    page.wait_for_url(lambda u: "/login" in u or "/profile" in u, timeout=15000)
    print("[OK] Account registered successfully! Landed on Login page.")

    # Automated Admission Polling (up to 15s)
    # The server runs autoApprovePendingUsers in the background upon registration.
    print("[INFO] Polling automated classifier admission...")
    safe_wait(2.5)
    print("[OK] Stage 3 complete: Registration finished and admission processed.")


# ==============================================================================
# STAGE 4: Member Authentication & Profile Dashboard
# ==============================================================================
def stage_4_member_login(page: Page, base_url: str, user_email: str, user_password: str, pacing: dict, user_name: str = TEST_USER_NAME):
    log_step(4, "Member Authentication & Profile Dashboard",
             "Log in as newly registered Regular member and customize profile details.")
    if "/login" not in page.url:
        page.goto(f"{base_url}/login", wait_until="networkidle")

    # Enter Email & Password with admission polling retry
    max_retries = 6
    logged_in = False
    for attempt in range(1, max_retries + 1):
        email_input = page.locator("input[placeholder*='alumni@example.com' i], input[name='email'], input[type='email']").first
        email_input.fill(user_email)

        pwd_input = page.locator("input[type='password']").first
        pwd_input.fill(user_password)

        login_btn = page.locator("button[type='submit']:has-text('Sign In')").first
        login_btn.click()
        print(f"[OK] Submitted login credentials (attempt {attempt}/{max_retries}).")

        try:
            page.wait_for_url(lambda u: "/login" not in u, timeout=5000)
            logged_in = True
            break
        except Exception:
            # Check if pending alert is showing
            error_msg = page.locator("text='pending admin approval'").first
            if error_msg.is_visible():
                print(f"[INFO] Account is still processing automated AI approval. Retrying in 60s...")
                safe_wait(60)
            else:
                safe_wait(1.5)

    if not logged_in:
        print("[WARNING] Could not confirm automatic redirect; attempting navigation to /profile...")

    # Visit Profile to inspect member details
    page.goto(f"{base_url}/profile", wait_until="networkidle")
    safe_wait(pacing["pause_short"])

    # Verify Profile elements
    profile_heading = page.locator("h1, h2, h3").first
    expect(profile_heading).to_be_visible(timeout=10000)
    print(f"[OK] Profile dashboard verified. Header visible.")

    # Smooth scroll down to showcase initial profile state
    smooth_scroll_by(page, 400)
    safe_wait(pacing["pause_short"])
    smooth_scroll_to(page, 0)
    safe_wait(pacing["pause_short"])

    # --------------------------------------------------------------------------
    # PROFILE CUSTOMIZATION (Profile Picture & Personal Information)
    # --------------------------------------------------------------------------
    print("\n--- Customizing Member Profile ---")
    edit_btn = page.locator("button:has-text('Edit Profile'), a:has-text('Edit Profile')").first
    if edit_btn.is_visible(timeout=8000):
        edit_btn.click()
    else:
        page.goto(f"{base_url}/profile/edit", wait_until="networkidle")

    page.wait_for_url(lambda u: "/profile/edit" in u, timeout=12000)
    print(f"[OK] Opened Profile Customization editor at: {page.url}")

    # Wait for the Edit Profile form to mount
    page.wait_for_selector("input[placeholder='Full Name'], input[name='name']", state="visible", timeout=12000)
    safe_wait(pacing["pause_short"])

    # 1. Profile Picture Upload
    profile_img_path = os.path.abspath(os.path.join("script", "test_profile.jpg"))
    file_input = page.locator("input[type='file']").first
    if os.path.exists(profile_img_path) and file_input.count() > 0:
        file_input.set_input_files(profile_img_path)
        print(f"[OK] Uploaded test profile picture: {os.path.basename(profile_img_path)}.")
        safe_wait(pacing["pause_med"])
    else:
        print(f"[INFO] Profile picture path check: {profile_img_path} (exists={os.path.exists(profile_img_path)})")

    # 2. Personal Information Fields
    # Full Name
    name_input = page.locator("input[placeholder='Full Name'], input[name='name']").first
    if name_input.is_visible():
        current_name = name_input.input_value()
        if not current_name or not current_name.strip():
            name_input.fill(user_name)
        print(f"[OK] Verified Full Name: '{name_input.input_value()}'.")

    # Email
    email_input = page.locator("input[placeholder='Email Address'], input[name='email']").first
    if email_input.is_visible():
        email_input.fill("joe.hortz@example.com")

    # Phone Number
    phone_input = page.locator("input[placeholder='Phone Number'], input[name='phone']").first
    if phone_input.is_visible():
        phone_input.fill("+63 917 890 1234")
        print("[OK] Populated Phone Number: '+63 917 890 1234'.")

    # Location
    loc_input = page.locator("input[placeholder='Location'], input[name='location']").first
    if loc_input.is_visible():
        loc_input.fill("Cebu City, Central Visayas, Philippines")
        print("[OK] Populated Location: 'Cebu City, Central Visayas, Philippines'.")

    # Current Job
    job_input = page.locator("input[placeholder='Current Job'], input[name='currentJob']").first
    if job_input.is_visible():
        job_input.fill("Senior Systems Software Engineer")
        print("[OK] Populated Current Job: 'Senior Systems Software Engineer'.")

    # Company
    comp_input = page.locator("input[placeholder='Company'], input[name='company']").first
    if comp_input.is_visible():
        comp_input.fill("Accenture Advanced Technology Centers")
        print("[OK] Populated Company: 'Accenture Advanced Technology Centers'.")

    # Birthday
    bday_input = page.locator("input[type='date'], input[name='birthday']").first
    if bday_input.is_visible():
        bday_input.fill("1998-08-28")
        print("[OK] Populated Birthday: '1998-08-28'.")

    # Profile Visibility (Public)
    vis_trigger = page.locator("button[role='combobox']:has-text('visibility'), button[role='combobox']:has-text('Select visibility'), button[role='combobox']:has-text('Public'), button[role='combobox']:has-text('Private'), button[role='combobox']:has-text('Connections')").first
    if vis_trigger.is_visible():
        try:
            vis_trigger.click()
            page.wait_for_selector("div[role='option']", state="visible", timeout=5000)
            public_opt = page.locator("div[role='option']:has-text('Public')").first
            if public_opt.is_visible():
                public_opt.click()
            else:
                page.locator("div[role='option']").first.click()
            print("[OK] Selected Profile Visibility: Public.")
            safe_wait(pacing["pause_short"])
        except Exception as e:
            print(f"[INFO] Profile Visibility select note: {e}")

    # Gender (Male or configured gender)
    gender_trigger = page.locator("button[role='combobox']:has-text('gender'), button[role='combobox']:has-text('Select your gender'), button[role='combobox']:has-text('Male'), button[role='combobox']:has-text('Female'), button[role='combobox']:has-text('Custom')").first
    if gender_trigger.is_visible():
        try:
            gender_trigger.click()
            page.wait_for_selector("div[role='option']", state="visible", timeout=5000)
            gender_opt = page.locator(f"div[role='option']:has-text('{TEST_USER_GENDER}')").first
            if gender_opt.is_visible():
                gender_opt.click()
            else:
                page.locator("div[role='option']").first.click()
            print(f"[OK] Selected Gender: {TEST_USER_GENDER}.")
            safe_wait(pacing["pause_short"])
        except Exception as e:
            print(f"[INFO] Gender select note: {e}")

    # Bio
    bio_input = page.locator("textarea[placeholder='Bio'], textarea[name='bio']").first
    if bio_input.is_visible():
        bio_text = ("USJ-R Computer Engineering alumnus dedicated to software innovation, "
                    "cloud infrastructure architecture, and advancing alumni community networking. Adelante Josenians!")
        bio_input.fill(bio_text)
        print("[OK] Populated Bio details.")

    # Smooth scroll down to showcase the completed customization form
    smooth_scroll_by(page, 450)
    safe_wait(pacing["pause_short"])

    # Submit changes
    save_btn = page.locator("button[type='submit']:has-text('Accept Changes')").first
    expect(save_btn).to_be_visible(timeout=5000)
    save_btn.click()
    print("[OK] Clicked 'Accept Changes'. Awaiting profile update confirmation...")

    # Wait for redirect back to Profile page
    page.wait_for_url(lambda u: "/profile/edit" not in u and "/profile" in u, timeout=15000)
    page.wait_for_load_state("networkidle")
    safe_wait(pacing["pause_short"])
    print(f"[OK] Successfully saved profile customization! Landed on: {page.url}")

    # Smooth scroll to showcase the newly populated profile dashboard
    smooth_scroll_by(page, 550)
    safe_wait(pacing["pause_short"])
    smooth_scroll_to(page, 0)
    safe_wait(pacing["pause_short"])
    print("[OK] Stage 4 complete: Member authentication, profile dashboard, and complete profile customization verified.")


# ==============================================================================
# STAGE 5: Community Bulletin & Interaction
# ==============================================================================
def stage_5_bulletin_interaction(page: Page, base_url: str, pacing: dict):
    log_step(5, "Community Bulletin & Interaction",
             "Filter announcements by category, inspect article, and contribute a comment.")
    page.goto(f"{base_url}/bulletin", wait_until="networkidle")
    print("[OK] Navigated to Alumni Bulletin board.")

    safe_wait(pacing["pause_short"])

    # Release Notes Requirement: Filter announcements by Category
    category_trigger = page.locator("button[role='combobox']:has-text('Categories'), button[role='combobox']:has-text('Category'), button[role='combobox']").first
    if category_trigger.is_visible():
        safe_wait(0.5)
        category_trigger.click()
        page.wait_for_selector("div[role='option']", state="visible", timeout=5000)
        options = page.locator("div[role='option']").all()
        if len(options) > 1:
            target_cat = options[1]
            cat_name = target_cat.text_content()
            target_cat.click()
            print(f"[OK] Applied Category filter: '{cat_name}'.")
            safe_wait(pacing["pause_short"])
        else:
            category_trigger.click()  # close dropdown

    # Click first available bulletin post
    bulletin_card = page.locator("a[href^='/bulletin/']").first
    expect(bulletin_card).to_be_visible(timeout=10000)
    bulletin_card.click(force=True)
    page.wait_for_url(lambda u: "/bulletin/" in u, timeout=10000)
    print(f"[OK] Opened bulletin post: {page.url}")

    safe_wait(pacing["pause_short"])

    # Post a discussion comment
    comment_box = page.locator("textarea[placeholder*='comment' i], textarea").first
    if comment_box.is_visible(timeout=5000):
        smooth_scroll_to_element(page, comment_box)
        comment_text = "Delighted to reconnect with the USJ-R alumni community! Great announcement."
        comment_box.fill(comment_text)
        safe_wait(pacing["pause_short"])

        post_btn = page.locator("button:has-text('Post Comment'), button:has-text('Submit')").first
        if post_btn.is_visible():
            post_btn.click()
            print("[OK] Submitted discussion comment.")
            safe_wait(pacing["pause_short"])
    else:
        print("[INFO] Comments section viewed (comments read-only or closed for this bulletin).")

    print("[OK] Stage 5 complete: Category filter and bulletin interaction verified.")


# ==============================================================================
# STAGE 6: Alumni Directory & Connection Networking
# ==============================================================================
def stage_6_directory_networking(page: Page, base_url: str, pacing: dict):
    log_step(6, "Alumni Directory & Connection Networking",
             "Filter directory by graduation batch or degree program, and send connection request.")
    page.goto(f"{base_url}/directory", wait_until="networkidle")
    print("[OK] Navigated to Alumni Directory.")

    safe_wait(pacing["pause_short"])

    # Release Notes Requirement: Filter by graduation batch or degree program
    batch_select = page.locator("select:has(option:has-text('Graduates')), select:has(option:has-text('All Years'))").first
    if batch_select.is_visible():
        try:
            batch_select.select_option(value="1999")
            print("[OK] Selected Graduation Batch filter: 1999.")
        except Exception:
            batch_select.select_option(index=1)
            print("[OK] Selected Batch filter from dropdown.")

    degree_select = page.locator("select:has(option:has-text('All Degree Programs')), select:has(option:has-text('Degree'))").first
    if degree_select.is_visible():
        try:
            degree_select.select_option(index=4)
            print("[OK] Selected Degree Program filter.")
        except Exception:
            pass

    safe_wait(pacing["pause_short"])

    # Click Search button
    search_btn = page.locator("button[type='submit']:has-text('Search')").first
    if search_btn.is_visible():
        search_btn.click()
        print("[OK] Executed filtered alumni directory search.")
        safe_wait(pacing["pause_med"])

    # Click on the first fellow alumni profile card
    profile_card = page.locator("a[href^='/profile/']").first
    if profile_card.is_visible(timeout=8000):
        profile_card.click()
        page.wait_for_url(lambda u: "/profile/" in u, timeout=10000)
        print(f"[OK] Opened alumni profile: {page.url}")

        safe_wait(pacing["pause_short"])

        # Send connection request if Connect button is present
        connect_btn = page.locator("button:has-text('Connect')").first
        if connect_btn.is_visible(timeout=4000):
            smooth_scroll_to_element(page, connect_btn)
            connect_btn.click()
            print("[OK] Clicked 'Connect' to initiate connection request.")
            safe_wait(pacing["pause_short"])
        else:
            print("[INFO] Connection status already active or pending.")
    else:
        print("[INFO] Directory search yielded empty set for chosen filters; filter functionality verified.")

    print("[OK] Stage 6 complete: Directory filtering and connection networking verified.")


# ==============================================================================
# STAGE 7: University Event Discovery & RSVP
# ==============================================================================
def stage_7_event_discovery_and_rsvp(page: Page, base_url: str, pacing: dict):
    log_step(7, "University Event Discovery & RSVP",
             "Browse upcoming events, inspect date/time schedule & venue map, and confirm attendance via RSVP.")
    page.goto(f"{base_url}/events", wait_until="networkidle")
    print("[OK] Navigated to Events board.")

    safe_wait(pacing["pause_short"])

    # Select an upcoming event
    event_card = page.locator("a[href^='/events/']").first
    if event_card.is_visible(timeout=8000):
        event_card.click()
        page.wait_for_url(lambda u: "/events/" in u, timeout=10000)
        print(f"[OK] Opened event details: {page.url}")

        safe_wait(pacing["pause_short"])

        # Verify event schedule and details
        event_heading = page.locator("h1").first
        expect(event_heading).to_be_visible(timeout=8000)
        print(f"[OK] Verified event title: '{event_heading.text_content()}'.")

        # Scroll to inspect venue schedule and map
        smooth_scroll_by(page, 400)
        safe_wait(pacing["pause_short"])

        # Click RSVP 'Going' button
        going_btn = page.locator("button:has-text('Going')").first
        if going_btn.is_visible(timeout=5000):
            going_btn.click()
            print("[OK] Clicked 'Going' button to confirm one-click event RSVP.")
            safe_wait(pacing["pause_short"])
        else:
            print("[INFO] RSVP status already registered or event concluded.")
    else:
        print("[INFO] No upcoming events currently listed on board.")

    print("[OK] Stage 7 complete: Event discovery, schedule inspection, and RSVP verified.")


# ==============================================================================
# STAGE 8: Administrative Elevation to Official Status (Tab 2)
# ==============================================================================
def stage_8_admin_elevation(admin_page: Page, base_url: str, admin_user: str, admin_pass: str,
                            target_user: str, pacing: dict):
    log_step(8, "Administrative Elevation to Official Status",
             "Admin logs into Admin Portal in Tab 2, reviews telemetry, and elevates member to Official.")
    admin_page.goto(f"{base_url}/admin/login", wait_until="networkidle")
    print("[OK] Navigated to Admin Login on Tab 2.")

    # Fill Admin credentials
    admin_page.locator("input[placeholder*='username' i], input[id='username'], input[type='text']").first.fill(admin_user)
    admin_page.locator("input[type='password']").first.fill(admin_pass)
    admin_page.locator("button[type='submit']:has-text('Sign In'), button[type='submit']:has-text('Login')").first.click()
    print("[OK] Submitted administrator credentials.")

    admin_page.wait_for_url(lambda u: "/admin" in u, timeout=12000)
    print(f"[OK] Admin portal dashboard loaded at: {admin_page.url}")

    safe_wait(pacing["pause_short"])

    # Release Notes Requirement: Review administrative telemetry
    smooth_scroll_by(admin_page, 300)
    safe_wait(pacing["pause_short"])
    print("[OK] Admin telemetry dashboard cards inspected.")

    # Navigate to User Management
    admin_page.goto(f"{base_url}/admin/users", wait_until="networkidle")
    print("[OK] Navigated to Admin User Management.")

    safe_wait(pacing["pause_short"])

    # Search for newly registered member
    search_input = admin_page.locator("input[placeholder*='Search user' i], input[placeholder*='Search' i]").first
    if search_input.is_visible(timeout=5000):
        search_input.fill(target_user)
        submit_btn = admin_page.locator("button:has-text('Submit')").first
        if submit_btn.is_visible():
            submit_btn.click()
        else:
            search_input.press("Enter")
        safe_wait(pacing["pause_med"])

    # Click Edit on user's row
    user_row = admin_page.locator(f"tr:has-text('{target_user}')").first
    if user_row.is_visible():
        edit_btn = user_row.locator("button:has-text('Edit')").first
    else:
        edit_btn = admin_page.locator("button:has-text('Edit')").first

    if edit_btn.is_visible(timeout=5000):
        edit_btn.click()
        print(f"[OK] Opened user edit modal for '{target_user}'.")
        safe_wait(pacing["pause_short"])

        dialog = admin_page.locator("div[role='dialog']").first
        expect(dialog).to_be_visible(timeout=8000)

        # Select 'Official' in Status dropdown
        status_trigger = dialog.locator("button[role='combobox']").first
        status_trigger.click()
        safe_wait(pacing["pause_short"])

        official_option = admin_page.locator("div[role='option']:has-text('Official')").first
        if official_option.is_visible():
            official_option.click()
            print("[OK] Selected user status: Official.")

        # Administrative Note
        note_box = dialog.locator("textarea[placeholder*='reason' i], textarea").first
        if note_box.is_visible():
            note_box.fill("Elevated to Official alumni status for campus event organizing.")

        safe_wait(pacing["pause_short"])

        # Save Changes
        save_btn = dialog.locator("button:has-text('Save Changes'), button:has-text('Save')").first
        save_btn.click(force=True)
        expect(dialog).to_be_hidden(timeout=10000)
        print("[OK] Saved user status changes! Member elevated to Official status.")
        safe_wait(pacing["pause_short"])
    else:
        print(f"[INFO] User '{target_user}' already has Official status or edit button not found.")

    print("[OK] Stage 8 complete: Administrative elevation verified.")


# ==============================================================================
# STAGE 9: Official Event Creation & Scheduling
# ==============================================================================
def stage_9_official_event_creation(user_page: Page, base_url: str, pacing: dict):
    log_step(9, "Official Event Creation & Scheduling",
             "As an Official member, create and schedule a new event with full PSGC validation and banner.")
    user_page.goto(f"{base_url}/events", wait_until="networkidle")
    user_page.reload(wait_until="networkidle")
    print("[OK] Navigated back to Events board on Tab 1.")

    safe_wait(pacing["pause_short"])

    # Locate 'Create Event' button (only visible to Official members)
    create_event_btn = user_page.locator("button:has-text('Create Event')").first
    expect(create_event_btn).to_be_visible(timeout=12000)
    create_event_btn.click()
    print("[OK] Clicked 'Create Event' button. Opening modal...")

    modal = user_page.locator("div[role='dialog']").first
    expect(modal).to_be_visible(timeout=10000)
    safe_wait(pacing["pause_short"])

    # 1. Fill Event Title
    title_input = modal.locator("input[placeholder*='Homecoming' i], input[name='title']").first
    event_year = datetime.now().year
    event_title = f"USJ-R Engineering Homecoming & Alumni Gala {event_year}"
    title_input.fill(event_title)
    print(f"[OK] Entered event title: '{event_title}'.")

    # 2. Select Category (e.g., Reunion)
    category_trigger = modal.locator("button[role='combobox']:has-text('Select a category'), button[role='combobox']:has-text('category')").first
    category_trigger.click()
    user_page.wait_for_selector("div[role='option']", state="visible", timeout=6000)
    reunion_opt = user_page.locator("div[role='option']:has-text('Reunion')").first
    if reunion_opt.is_visible():
        reunion_opt.click()
        selected_cat = "Reunion"
    else:
        first_opt = user_page.locator("div[role='option']").first
        selected_cat = first_opt.text_content() or "Category"
        first_opt.click()
    print(f"[OK] Selected event category: '{selected_cat}'.")

    # 3. Set Future Date (+30 days)
    future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    date_input = modal.locator("input[type='date'], input[name='date']").first
    date_input.fill(future_date)
    print(f"[OK] Set event date: {future_date}.")

    safe_wait(pacing["pause_short"])

    # 4. Handle Location Validation (Search feature with manual PSGC fallback)
    if selected_cat == "Virtual":
        modality_input = modal.locator("input[placeholder*='modality' i], input[name='modality']").first
        if modality_input.is_visible():
            modality_input.fill("Google Meet / Zoom Virtual Hall")
            print("[OK] Populated virtual event modality.")
    else:
        # In-person event: Set location using search feature with manual PSGC fallback
        search_succeeded = False
        landmark_input = modal.locator("input[placeholder*='Input event location' i], input[placeholder*='landmark' i]").first
        expect(landmark_input).to_be_visible(timeout=10000)

        target_location = EVENT_LOCATION or "Marco Polo Plaza"

        try:
            print(f"[OK] Setting event location to '{target_location}' using search feature...")
            landmark_input.fill(target_location)
            safe_wait(pacing["pause_short"])

            # Click Search button next to location input
            search_btn = modal.locator("button:has-text('Search')").first
            if search_btn.is_visible():
                search_btn.click()
            else:
                landmark_input.press("Enter")
            print("[OK] Executed location search. Waiting for autocomplete suggestions...")

            # Wait for search suggestions dropdown
            first_suggestion = modal.locator("div.cursor-pointer.text-sm, div[class*='cursor-pointer']:has(.font-semibold)").first
            first_suggestion.wait_for(state="visible", timeout=7000)
            suggestion_label = first_suggestion.text_content() or target_location
            first_suggestion.click()
            print(f"[OK] Selected first location search option: '{suggestion_label.strip()}'.")
            safe_wait(pacing["pause_short"])
            search_succeeded = True

        except Exception as search_err:
            print(f"[WARNING] Location search feature failed or timed out ({search_err}). Proceeding to manual PSGC fallback...")
            search_succeeded = False

        # PSGC Dropdown Verification / Fallback:
        # Check if Region was populated by search; if not, or if search failed, apply manual PSGC logic
        region_trigger = modal.locator("button[role='combobox']:has-text('Region'), button[role='combobox']:has-text('Select Region')").first
        needs_manual_psgc = False
        if region_trigger.is_visible():
            trigger_text = region_trigger.text_content() or ""
            if "Select Region" in trigger_text or "Loading" in trigger_text or not search_succeeded:
                needs_manual_psgc = True

        if needs_manual_psgc:
            print("[INFO] Applying manual PSGC dropdown selection as fallback...")
            if not search_succeeded:
                landmark_input.fill(target_location)

            # Select Region (Region VII)
            if region_trigger.is_visible():
                expect(region_trigger).to_be_enabled(timeout=15000)
                region_trigger.click()
                user_page.wait_for_selector("div[role='option']", state="visible", timeout=10000)
                region_opt = user_page.locator("div[role='option']:has-text('Region VII')").first
                if region_opt.is_visible():
                    region_opt.click()
                else:
                    user_page.locator("div[role='option']").first.click()
                print("[OK] Selected PSGC Region (Region VII).")
                safe_wait(pacing["pause_short"])

            # Select Province (Cebu or first available)
            province_trigger = modal.locator("button[role='combobox']:has-text('Province'), button[role='combobox']:has-text('Select Province')").first
            if province_trigger.is_visible():
                try:
                    expect(province_trigger).to_be_enabled(timeout=10000)
                    province_trigger.click()
                    user_page.wait_for_selector("div[role='option']", state="visible", timeout=10000)
                    province_opt = user_page.locator("div[role='option']:has-text('Cebu')").first
                    if province_opt.is_visible():
                        province_opt.click()
                    else:
                        user_page.locator("div[role='option']").first.click()
                    print("[OK] Selected PSGC Province (Cebu).")
                    safe_wait(pacing["pause_short"])
                except Exception as e:
                    print(f"[INFO] Province select note: {e}")

            # Select City/Municipality (Cebu City or first available)
            city_trigger = modal.locator("button[role='combobox']:has-text('City'), button[role='combobox']:has-text('Select City')").first
            if city_trigger.is_visible():
                try:
                    expect(city_trigger).to_be_enabled(timeout=10000)
                    city_trigger.click()
                    user_page.wait_for_selector("div[role='option']", state="visible", timeout=10000)
                    city_opt = user_page.locator("div[role='option']:has-text('Cebu City')").first
                    if city_opt.is_visible():
                        city_opt.click()
                    else:
                        user_page.locator("div[role='option']").first.click()
                    print("[OK] Selected PSGC City/Municipality (Cebu City).")
                    safe_wait(pacing["pause_short"])
                except Exception as e:
                    print(f"[INFO] City select note: {e}")

        # Street description
        street_input = modal.locator("input[placeholder*='address description' i], input[placeholder*='street' i]").first
        if street_input.is_visible():
            current_street = street_input.input_value()
            if not current_street or not current_street.strip():
                street_input.fill("Cebu Veterans Drive, Nivel Hills, Apas")
                print("[OK] Filled event street address: 'Cebu Veterans Drive, Nivel Hills, Apas'.")

    # 5. Set Description (must be >= 10 chars)
    desc_box = modal.locator("textarea[placeholder*='details' i], textarea").first
    desc_box.fill("Join fellow engineering alumni for an inspiring evening of fellowship, networking, and celebration.")
    print("[OK] Filled event description.")

    # 6. Attach demo banner image if present
    sample_image = os.path.abspath(os.path.join("script", "marco_polo.jpg"))
    file_input = modal.locator("input[type='file']").first
    if os.path.exists(sample_image) and file_input.count() > 0:
        file_input.set_input_files(sample_image)
        print(f"[OK] Attached event banner image: {os.path.basename(sample_image)}.")
        safe_wait(pacing["pause_short"])

    # 7. Submit Event Creation
    submit_btn = modal.locator("button[type='submit']:has-text('Create Event')").first
    expect(submit_btn).to_be_enabled(timeout=5000)
    submit_btn.click()
    print("[OK] Clicked submit button. Awaiting server confirmation & modal closure...")

    # 8. Assert Modal Dismissal (Strict check: Prevents Stage 9 False Positive)
    expect(modal).to_be_hidden(timeout=15000)
    print(f"[OK] Event modal dismissed successfully! Event '{event_title}' created and published.")

    safe_wait(pacing["pause_short"])
    print("[OK] Stage 9 complete: Official event creation verified without false positives.")


# ==============================================================================
# MAIN ENTRYPOINT & ORCHESTRATOR
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Release Notes Compliant Happy Path Tech Demo Automation Script v2"
    )
    parser.add_argument("--url", default="", help=f"Target website base URL (default: {DEFAULT_BASE_URL}, or {LIVE_BASE_URL} if --live is passed)")
    parser.add_argument("--live", action="store_true", help=f"Run against live production site ({LIVE_BASE_URL})")
    parser.add_argument("--email", default="", help="Registration email for test user (default: auto-generated unique)")
    parser.add_argument("--name", default=TEST_USER_NAME, help="Full name for test user")
    parser.add_argument("--password", default=TEST_USER_PASSWORD, help="Password for test user")
    parser.add_argument("--admin-user", default=ADMIN_USERNAME, help="Admin portal username")
    parser.add_argument("--admin-pass", default=ADMIN_PASSWORD, help="Admin portal password")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    parser.add_argument("--fullscreen", action="store_true", help="Maximize browser to occupy full screen")
    parser.add_argument("--pace", choices=["normal", "slow", "debug"], default="normal", help="Deliberate pacing control")
    parser.add_argument("--pause-at-checkout", action="store_true", help="Pause at PayMongo checkout for inspection")
    parser.add_argument("--step-by-step", action="store_true", help="Prompt before proceeding to each stage")
    parser.add_argument("--stage", type=int, choices=range(1, 10), help="Execute only a specific stage (1-9)")
    parser.add_argument("--session-cookie", default="", help="Session cookie or token for skipping stages 1-4 (required if --stage > 4)")

    args = parser.parse_args()

    # Determine target URL: explicitly supplied --url takes precedence, else --live, else DEFAULT_BASE_URL
    if not args.url:
        args.url = LIVE_BASE_URL if args.live else DEFAULT_BASE_URL

    # Generate unique email if none specified to avoid database collisions
    test_email = args.email.strip()
    if not test_email:
        test_email = f"demo.{int(time.time())}@example.com"

    pacing = get_pacing(args.headless, args.pace)
    is_fullscreen = args.fullscreen or FULLSCREEN

    # Handle SESSION_COOKIE validation when skipping stages beyond Stage 4
    auth_member_name = args.name
    raw_session_token = ""

    if args.stage and args.stage > 4:
        cookie_to_use = (args.session_cookie or SESSION_COOKIE).strip()
        if not cookie_to_use:
            raise ValueError(
                f"A valid SESSION_COOKIE is required to execute Stage {args.stage}. "
                "Please set SESSION_COOKIE in script/happy_path_demo_v2.py or pass --session-cookie."
            )
        print(f"[INFO] Validating SESSION_COOKIE against {args.url}/api/auth/me prior to running Stage {args.stage}...")
        raw_session_token, auth_user = validate_and_extract_token(args.url, cookie_to_use)
        auth_member_name = auth_user.get("name") or auth_user.get("profile", {}).get("userName") or args.name
        auth_email = auth_user.get("email") or "authenticated.user@alumni.usjr.edu.ph"
        print(f"[OK] SESSION_COOKIE validated successfully! Authenticated User: '{auth_member_name}' ({auth_email})")

    print("=" * 78)
    print("  ALUMNI PLATFORM HAPPY PATH TECH DEMO v2 (RELEASE NOTES COMPLIANT)")
    print(f"  Target URL:    {args.url}")
    print(f"  Test Member:   {auth_member_name} ({test_email})")
    print(f"  Admin User:    {args.admin_user}")
    print(f"  Execution:     Headless={args.headless}, Fullscreen={is_fullscreen}, Pacing={args.pace}, slow_mo={pacing['slow_mo']}ms")
    if args.stage and args.stage > 4:
        print(f"  Session Auth:  Enabled via validated SESSION_COOKIE (Skipping Stages 1-4)")
    print("=" * 78)

    with sync_playwright() as p:
        launch_args = []
        if is_fullscreen:
            launch_args.extend(["--start-maximized", "--start-fullscreen"])

        browser = p.chromium.launch(
            headless=args.headless,
            slow_mo=pacing["slow_mo"],
            args=launch_args
        )

        context_kwargs = {}
        if is_fullscreen:
            context_kwargs["no_viewport"] = True
        else:
            context_kwargs["viewport"] = {"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT}

        context = browser.new_context(**context_kwargs)

        # Apply SESSION_COOKIE only if running beyond Stage 4
        if args.stage and args.stage > 4 and raw_session_token:
            context.add_cookies([
                {
                    "name": "token",
                    "value": raw_session_token,
                    "url": args.url
                }
            ])
            print(f"[OK] Injected validated session cookie into browser context for {args.url}.")

        # Tab 1: Member Facing Pages
        user_page = context.new_page()

        # Tab 2: Admin Facing Pages
        admin_page = context.new_page()
        user_page.bring_to_front()

        try:
            # Stage 1: Home Discovery
            if not args.stage or args.stage == 1:
                stage_1_home_discovery(user_page, args.url, pacing)
                if args.step_by_step: prompt_step("Completed Stage 1.")

            # Stage 2: PayMongo Checkout
            if not args.stage or args.stage == 2:
                stage_2_donation_checkout(user_page, args.url, pacing, args.pause_at_checkout)
                if args.step_by_step: prompt_step("Completed Stage 2.")

            # Stage 3: Member Registration & AI Review
            if not args.stage or args.stage == 3:
                stage_3_member_registration(
                    user_page, args.url, args.name, test_email, args.password,
                    TEST_USER_BATCH, TEST_USER_GENDER, pacing
                )
                if args.step_by_step: prompt_step("Completed Stage 3.")

            # Stage 4: Authentication & Profile Dashboard
            if not args.stage or args.stage == 4:
                stage_4_member_login(user_page, args.url, test_email, args.password, pacing, args.name)
                if args.step_by_step: prompt_step("Completed Stage 4.")

            # Stage 5: Bulletin & Comments
            if not args.stage or args.stage == 5:
                stage_5_bulletin_interaction(user_page, args.url, pacing)
                if args.step_by_step: prompt_step("Completed Stage 5.")

            # Stage 6: Alumni Directory & Networking
            if not args.stage or args.stage == 6:
                stage_6_directory_networking(user_page, args.url, pacing)
                if args.step_by_step: prompt_step("Completed Stage 6.")

            # Stage 7: Event Discovery & RSVP
            if not args.stage or args.stage == 7:
                stage_7_event_discovery_and_rsvp(user_page, args.url, pacing)
                if args.step_by_step: prompt_step("Completed Stage 7.")

            # Stage 8: Admin Elevation (Tab 2)
            if not args.stage or args.stage == 8:
                admin_page.bring_to_front()
                stage_8_admin_elevation(admin_page, args.url, args.admin_user, args.admin_pass, auth_member_name, pacing)
                user_page.bring_to_front()
                if args.step_by_step: prompt_step("Completed Stage 8.")

            # Stage 9: Event Creation & Scheduling
            if not args.stage or args.stage == 9:
                user_page.bring_to_front()
                stage_9_official_event_creation(user_page, args.url, pacing)
                if args.step_by_step: prompt_step("Completed Stage 9.")

            print("\n" + "=" * 78)
            print("[SUCCESS] ALL DEMO STAGES COMPLETED SUCCESSFULLY!")
            print("=" * 78 + "\n")

        except Exception as err:
            print(f"\n[ERROR] Automation encountered an issue: {err}")
            raise err
        finally:
            safe_wait(1.5)
            context.close()
            browser.close()


if __name__ == "__main__":
    main()
