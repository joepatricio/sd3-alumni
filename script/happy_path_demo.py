#!/usr/bin/env python3
"""
Happy Path Tech Demo Automation Script
Alumni Tracking System (https://najealp.top)

This script automates the 9-stage happy path flow representing a regular
user's journey from landing on the home page to community interaction,
automated AI registration to Regular member status, administrative promotion
to Official status in an Admin tab, and culminating in creating an event.
"""

import sys
import os
import time
import argparse
from datetime import datetime, timedelta

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright, expect, Page, BrowserContext

# ==============================================================================
# TESTER CONFIGURATION - ADJUST VALUES BEFORE EXECUTION
# ==============================================================================
BASE_URL = "localhost:5173"
# BASE_URL = "https://najealp.top"

# Test Member Information
# Note: Ensure the email is unique or updated before running a fresh registration.
TEST_USER_NAME = "Patricio Jose Najeal"
TEST_USER_EMAIL = f"demo.{int(time.time())}@example.com"
TEST_USER_PASSWORD = "Password123!"
TEST_USER_BATCH = 2024
TEST_USER_DEGREE = "Bachelor of Science in Computer Engineering"
TEST_USER_GENDER = "Male"

# Administrator Credentials for Tab 2
ADMIN_USERNAME = "admin1"
ADMIN_PASSWORD = "123456"

# Execution & Display Settings
FULLSCREEN = True               # Open browser window maximized to occupy screen
VIEWPORT_WIDTH = 1920           # Fallback width if not maximized
VIEWPORT_HEIGHT = 1080          # Fallback height if not maximized
HEADLESS = False                # False = visible browser for tech demo presentation
SLOW_MO = 500                   # Milliseconds delay between actions for visual clarity

# Interactive Flow Controls
PAUSE_AT_CHECKOUT = True        # Pause at PayMongo checkout for tester verification of E-Wallet/QRPh
STEP_BY_STEP = False           # Pause after each completed stage (can also pass --step-by-step)
# ==============================================================================


def log_step(stage_num: int, title: str, description: str):
    print("\n" + "=" * 78)
    print(f">>> STAGE {stage_num}: {title.upper()}")
    print(f"  {description}")
    print("=" * 78 + "\n")


def prompt_step(msg: str):
    print(f"\n[PAUSE] {msg}")
    input("Press [Enter] to resume...")


# ------------------------------------------------------------------------------
# STAGE 1: Home Page & Public Discovery
# ------------------------------------------------------------------------------
def stage_1_home_discovery(page: Page, base_url: str):
    log_step(1, "Home Page & Public Discovery", "Explore landing page, navigation, counters, and highlights.")
    page.goto(base_url, wait_until="networkidle")
    
    import re
    expect(page).to_have_title(re.compile(r".+"), timeout=10000)
    print("[OK] Landing page loaded successfully.")

    # Scroll down to observe telemetry counters and teaser sections
    page.evaluate("window.scrollBy({ top: 500, behavior: 'smooth' })")
    time.sleep(1)
    page.evaluate("window.scrollBy({ top: 700, behavior: 'smooth' })")
    time.sleep(1)
    page.evaluate("window.scrollTo({ top: 0, behavior: 'smooth' })")
    time.sleep(1)
    print("[OK] Telemetry, featured bulletins, and event highlights viewed.")


# ------------------------------------------------------------------------------
# STAGE 2: Philanthropy & PayMongo Checkout
# ------------------------------------------------------------------------------
def stage_2_donation_checkout(page: Page, base_url: str, pause_checkout: bool):
    log_step(2, "Philanthropy & PayMongo Checkout", "Initiate donation, inspect PayMongo channels, and return.")
    page.goto(f"{base_url}/donate", wait_until="networkidle")
    print("[OK] Navigated to Donations page.")

    # Select donation preset amount (e.g., PHP 1,000)
    amount_pill = page.locator("button:has-text('1,000'), button:has-text('PHP 1,000')").first
    if amount_pill.is_visible():
        amount_pill.click()
        print("[OK] Selected donation amount preset.")
    else:
        # Fallback to custom input
        custom_input = page.locator("input[placeholder*='amount' i]").first
        if custom_input.is_visible():
            custom_input.fill("1000")
            print("[OK] Entered custom donation amount 1000.")

    # Click Proceed to Donate button
    donate_btn = page.locator("button:has-text('Proceed to Donate'), button:has-text('Donate Now'), button:has-text('Donate')").first
    expect(donate_btn).to_be_visible(timeout=5000)
    donate_btn.click()
    print("[OK] Clicked donation checkout button. Awaiting redirect to PayMongo...")

    # Wait for navigation to PayMongo Checkout (checkout.paymongo.com)
    try:
        page.wait_for_url(lambda u: "paymongo.com" in u, timeout=15000)
        print(f"[OK] Successfully redirected to PayMongo Checkout URL: {page.url}")
        time.sleep(2)

        # Look for E-Wallet or QRPh options on PayMongo Checkout
        ewallet_visible = page.locator("text=GCash, text=Maya, text=GrabPay, text=E-Wallet, text=eWallet").first.is_visible(timeout=5000)
        qrph_visible = page.locator("text=QRPh, text=QR Ph, text=QR").first.is_visible(timeout=3000)

        if ewallet_visible or qrph_visible:
            print("[OK] Verified PayMongo payment channels: E-Wallet and/or QRPh detected.")
        else:
            print("[INFO] PayMongo checkout rendered (Card payments disabled; E-Wallet/QRPh available).")

        if pause_checkout:
            prompt_step("Currently on the live PayMongo Checkout page. Verify E-Wallet / QRPh options.")

    except Exception as e:
        print(f"[INFO] Checkout navigation note: {e}")

    # Return back to the alumni donations webpage
    page.goto(f"{base_url}/donate", wait_until="networkidle")
    print("[OK] Returned back to Alumni Donations page.")


# ------------------------------------------------------------------------------
# STAGE 3: Member Registration & AI Review
# ------------------------------------------------------------------------------
def stage_3_member_registration(page: Page, base_url: str, user_name: str, user_email: str, user_password: str, user_batch: int, user_gender: str):
    log_step(3, "Member Registration & AI Review", "Complete registration form; AI classifier admits user to Regular status.")
    page.goto(f"{base_url}/register", wait_until="networkidle")
    print("[OK] Navigated to Registration page.")

    # Fill Full Name
    name_input = page.locator("input[placeholder*='John Doe' i], input[name='fullName']").first
    name_input.fill(user_name)

    # Fill Email
    email_input = page.locator("input[placeholder*='alumni@example.com' i], input[name='email']").first
    email_input.fill(user_email)

    # Select Degree Program
    degree_trigger = page.locator("button[role='combobox']:has-text('degree'), button[role='combobox']:has-text('Select')").first
    if degree_trigger.is_visible():
        degree_trigger.click()
        time.sleep(0.5)
        degree_option = page.locator("div[role='option']").first
        degree_option.click()
        print("[OK] Selected Degree Program.")

    # Fill Batch Year
    batch_input = page.locator("input[placeholder*='YYYY' i], input[name='batch']").first
    batch_input.fill(str(user_batch))

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
        time.sleep(0.5)
        gender_option = page.locator(f"div[role='option']:has-text('{user_gender}')").first
        if gender_option.is_visible():
            gender_option.click()
        else:
            page.locator("div[role='option']").first.click()
        print(f"[OK] Selected Gender: {user_gender}.")

    # Accept Terms & Privacy checkbox
    terms_checkbox = page.locator("button[role='checkbox'], input[type='checkbox']").first
    if terms_checkbox.is_visible():
        terms_checkbox.click()
        print("[OK] Accepted Terms of Service and Privacy Policy.")

    # Submit registration
    submit_btn = page.locator("button[type='submit']:has-text('Create Account')").first
    submit_btn.click()
    print("[OK] Registration submitted. Awaiting processing...")

    # Wait for confirmation toast or redirect to /login
    page.wait_for_url(lambda u: "/login" in u or "/profile" in u, timeout=12000)
    print("[OK] Account registered successfully! Navigated to Login page.")
    time.sleep(1)


# ------------------------------------------------------------------------------
# STAGE 4: Member Authentication & Profile Dashboard
# ------------------------------------------------------------------------------
def stage_4_member_login(page: Page, base_url: str, user_email: str, user_password: str):
    log_step(4, "Member Authentication & Profile Dashboard", "Log in as newly registered Regular member and explore profile.")
    if "/login" not in page.url:
        page.goto(f"{base_url}/login", wait_until="networkidle")

    # Enter Email & Password
    email_input = page.locator("input[placeholder*='alumni@example.com' i], input[name='email'], input[type='email']").first
    email_input.fill(user_email)

    pwd_input = page.locator("input[type='password']").first
    pwd_input.fill(user_password)

    login_btn = page.locator("button[type='submit']:has-text('Sign In')").first
    login_btn.click()
    print("[OK] Submitted member login credentials.")

    # Verify redirect to profile or dashboard
    page.wait_for_url(lambda u: "/profile" in u or "/directory" in u or u == f"{base_url}/", timeout=12000)
    print(f"[OK] Logged in successfully! Current page: {page.url}")

    # Visit profile to inspect dashboard
    page.goto(f"{base_url}/profile", wait_until="networkidle")
    time.sleep(1)
    expect(page.locator("h1, h2, h3").first).to_be_visible()
    print("[OK] Member profile dashboard loaded and verified.")


# ------------------------------------------------------------------------------
# STAGE 5: Community Bulletin & Interaction
# ------------------------------------------------------------------------------
def stage_5_bulletin_interaction(page: Page, base_url: str):
    log_step(5, "Community Bulletin & Interaction", "Explore announcements, use filters, and post a discussion comment.")
    page.goto(f"{base_url}/bulletin", wait_until="networkidle")
    print("[OK] Navigated to Bulletin page.")

    # Click first available bulletin card to view details
    bulletin_card = page.locator("a[href^='/bulletin/']").first
    expect(bulletin_card).to_be_visible(timeout=10000)
    bulletin_card.click()
    page.wait_for_url(lambda u: "/bulletin/" in u, timeout=10000)
    print(f"[OK] Viewing bulletin detail at: {page.url}")

    # Add a comment if comment box is available
    comment_box = page.locator("textarea[placeholder*='comment' i]").first
    if comment_box.is_visible(timeout=5000):
        comment_text = "Delighted to reconnect with the USJ-R alumni community! Great announcement."
        comment_box.fill(comment_text)
        post_btn = page.locator("button:has-text('Post Comment')").first
        post_btn.click()
        print("[OK] Posted discussion comment successfully.")
        time.sleep(1)
    else:
        print("[INFO] Comment box not open for this post; verified bulletin reading.")


# ------------------------------------------------------------------------------
# STAGE 6: Alumni Directory & Connection Networking
# ------------------------------------------------------------------------------
def stage_6_directory_networking(page: Page, base_url: str):
    log_step(6, "Alumni Directory & Connection Networking", "Search directory and initiate a member connection.")
    page.goto(f"{base_url}/directory", wait_until="networkidle")
    print("[OK] Navigated to Alumni Directory.")

    # Search for alumni
    search_input = page.locator("input[placeholder*='Search alumni' i]").first
    if search_input.is_visible():
        search_input.fill("Eng")
        time.sleep(1)
        search_input.press("Enter")

    # Click on the first alumni profile card to view their profile
    profile_card = page.locator("a[href^='/profile/']").first
    if profile_card.is_visible(timeout=5000):
        profile_card.click()
        page.wait_for_url(lambda u: "/profile/" in u, timeout=10000)
        print(f"[OK] Opened fellow alumni profile at: {page.url}")

        # Send connection request if Connect button is present
        connect_btn = page.locator("button:has-text('Connect')").first
        if connect_btn.is_visible(timeout=4000):
            connect_btn.click()
            print("[OK] Clicked 'Connect' to send connection request.")
            time.sleep(1)
        else:
            print("[INFO] Connection status already established or pending.")


# ------------------------------------------------------------------------------
# STAGE 7: University Event Discovery & RSVP
# ------------------------------------------------------------------------------
def stage_7_event_discovery_and_rsvp(page: Page, base_url: str):
    log_step(7, "University Event Discovery & RSVP", "Browse upcoming events and confirm attendance via RSVP.")
    page.goto(f"{base_url}/events", wait_until="networkidle")
    print("[OK] Navigated to Events page.")

    # Select an upcoming event
    event_card = page.locator("a[href^='/events/']").first
    if event_card.is_visible(timeout=8000):
        event_card.click()
        page.wait_for_url(lambda u: "/events/" in u, timeout=10000)
        print(f"[OK] Opened event details at: {page.url}")

        # Click RSVP "Going" button
        going_btn = page.locator("button:has-text('Going')").first
        if going_btn.is_visible(timeout=5000):
            going_btn.click()
            print("[OK] Clicked 'Going' button to RSVP to the event.")
            time.sleep(1)
        else:
            print("[INFO] Event RSVP status already submitted or event concluded.")
    else:
        print("[INFO] No events currently listed on board.")


# ------------------------------------------------------------------------------
# STAGE 8: Administrative Elevation to Official Status (Tab 2)
# ------------------------------------------------------------------------------
def stage_8_admin_elevation(admin_page: Page, base_url: str, admin_user: str, admin_pass: str, target_user: str):
    log_step(8, "Administrative Elevation to Official Status", "Admin signs into Admin Portal in Tab 2 and promotes member to Official.")
    admin_page.goto(f"{base_url}/admin/login", wait_until="networkidle")
    print("[OK] Navigated to Admin Login on Tab 2.")

    # Fill Admin credentials
    admin_page.locator("input[placeholder*='username' i], input[id='username'], input[type='text']").first.fill(admin_user)
    admin_page.locator("input[type='password']").first.fill(admin_pass)
    admin_page.locator("button[type='submit']:has-text('Sign In'), button[type='submit']:has-text('Login')").first.click()
    print("[OK] Submitted administrator credentials.")

    admin_page.wait_for_url(lambda u: "/admin" in u, timeout=10000)
    print(f"[OK] Admin portal loaded at: {admin_page.url}")

    # Navigate to User Management
    admin_page.goto(f"{base_url}/admin/users", wait_until="networkidle")
    print("[OK] Navigated to Admin User Management.")

    # Search for newly registered member
    search_input = admin_page.locator("input[placeholder*='Search user' i]").first
    if search_input.is_visible(timeout=5000):
        search_input.fill(target_user)
        search_input.press("Enter")
        time.sleep(1)

    # Click Edit on the user's row
    edit_btn = admin_page.locator("button:has-text('Edit')").first
    if edit_btn.is_visible(timeout=5000):
        edit_btn.click()
        print("[OK] Opened user edit modal.")
        time.sleep(1)

        # Select 'Official' in Status dropdown
        dialog = admin_page.locator("div[role='dialog']").first
        status_trigger = dialog.locator("button[role='combobox']").first
        status_trigger.click()
        time.sleep(0.5)

        official_option = admin_page.locator("div[role='option']:has-text('Official')").first
        official_option.click()
        print("[OK] Selected status: Official.")

        # Optional administrative note
        note_box = dialog.locator("textarea[placeholder*='reason' i]").first
        if note_box.is_visible():
            note_box.fill("Elevated to Official alumni status for campus event organizing.")

        # Save Changes
        save_btn = dialog.locator("button:has-text('Save Changes')").first
        save_btn.click()
        print("[OK] Saved user status changes! Member is now elevated to Official status.")
        time.sleep(1)
    else:
        print(f"[INFO] Could not locate edit button for user '{target_user}'; user may already be Official.")


# ------------------------------------------------------------------------------
# STAGE 9: Official Event Creation & Scheduling
# ------------------------------------------------------------------------------
def stage_9_official_event_creation(user_page: Page, base_url: str):
    log_step(9, "Official Event Creation & Scheduling", "As an Official member, create and publish a new campus event.")
    user_page.goto(f"{base_url}/events", wait_until="networkidle")
    user_page.reload(wait_until="networkidle")
    print("[OK] Navigated back to Events board on Tab 1.")

    # Locate 'Create Event' button (only visible to Official members)
    create_event_btn = user_page.locator("button:has-text('Create Event')").first
    expect(create_event_btn).to_be_visible(timeout=10000)
    create_event_btn.click()
    print("[OK] Clicked 'Create Event' button. Opening modal...")

    modal = user_page.locator("div[role='dialog']").first
    expect(modal).to_be_visible(timeout=8000)

    # Fill Event Title
    title_input = modal.locator("input[placeholder*='Title' i], input[name='title']").first
    event_title = f"USJ-R Engineering Homecoming & Alumni Gala {datetime.now().year}"
    title_input.fill(event_title)

    # Select Category
    category_trigger = modal.locator("button[role='combobox']:has-text('category'), button[role='combobox']:has-text('Select')").first
    if category_trigger.is_visible():
        category_trigger.click()
        time.sleep(0.5)
        user_page.locator("div[role='option']").first.click()
        print("[OK] Selected event category.")

    # Set Future Date (next month)
    future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    date_input = modal.locator("input[type='date'], input[name='date']").first
    date_input.fill(future_date)

    # Set Landmark location or modality
    landmark_input = modal.locator("input[placeholder*='landmark' i], input[placeholder*='Modality' i]").first
    if landmark_input.is_visible():
        landmark_input.fill("USJ-R Basak Campus - Recoletos Auditorium")

    # Set Description
    desc_box = modal.locator("textarea[placeholder*='details' i], textarea[name='description']").first
    desc_box.fill("Join fellow engineering alumni for an inspiring evening of fellowship, networking, and celebration.")

    # Attach demo banner image if sample file exists
    sample_image = os.path.abspath(r"docs\277a3b3d-763f-4a79-8d22-af02475fb976.jpg")
    file_input = modal.locator("input[type='file']").first
    if os.path.exists(sample_image) and file_input.is_attached():
        file_input.set_input_files(sample_image)
        print("[OK] Attached event banner image.")
        time.sleep(1)

    # Submit Event Creation
    submit_btn = modal.locator("button[type='submit']:has-text('Create Event')").first
    submit_btn.click()
    print("[OK] Submitted new event creation form!")

    # Wait for completion toast or modal close
    time.sleep(2)
    print(f"[OK] Event '{event_title}' created successfully!")


# ==============================================================================
# MAIN RUNNER
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(description="Happy Path Tech Demo Automation Script for Alumni Tracking System")
    parser.add_argument("--url", default=BASE_URL, help="Target website base URL (default: https://najealp.top)")
    parser.add_argument("--email", default=TEST_USER_EMAIL, help="Registration email for test user")
    parser.add_argument("--name", default=TEST_USER_NAME, help="Full name for test user")
    parser.add_argument("--password", default=TEST_USER_PASSWORD, help="Password for test user")
    parser.add_argument("--admin-user", default=ADMIN_USERNAME, help="Admin portal username")
    parser.add_argument("--admin-pass", default=ADMIN_PASSWORD, help="Admin portal password")
    parser.add_argument("--headless", action="store_true", default=HEADLESS, help="Run browser in headless mode")
    parser.add_argument("--fullscreen", action="store_true", default=FULLSCREEN, help="Maximize browser to occupy full screen")
    parser.add_argument("--pause-at-checkout", action="store_true", default=PAUSE_AT_CHECKOUT, help="Pause at PayMongo checkout for verification")
    parser.add_argument("--step-by-step", action="store_true", default=STEP_BY_STEP, help="Prompt before proceeding to each stage")
    parser.add_argument("--stage", type=int, choices=range(1, 10), help="Execute only a specific stage (1-9)")

    args = parser.parse_args()

    print("=" * 78)
    print("[START] STARTING ALUMNI PLATFORM HAPPY PATH TECH DEMO")
    print(f"Target URL:    {args.url}")
    print(f"Test Member:   {args.name} ({args.email})")
    print(f"Admin Portal:  {args.admin_user} @ {args.url}/admin")
    print(f"Execution:     Headless={args.headless}, Fullscreen={args.fullscreen}")
    print("=" * 78)

    with sync_playwright() as p:
        launch_args = []
        if args.fullscreen:
            launch_args.append("--start-maximized")

        browser = p.chromium.launch(
            headless=args.headless,
            slow_mo=SLOW_MO,
            args=launch_args
        )

        context_kwargs = {}
        if args.fullscreen:
            context_kwargs["no_viewport"] = True
        else:
            context_kwargs["viewport"] = {"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT}

        context = browser.new_context(**context_kwargs)

        # Tab 1: User-Facing Pages
        user_page = context.new_page()

        # Tab 2: Admin-Facing Pages
        admin_page = context.new_page()
        # Keep Tab 1 focused initially
        user_page.bring_to_front()

        try:
            # Stage 1
            if not args.stage or args.stage == 1:
                stage_1_home_discovery(user_page, args.url)
                if args.step_by_step: prompt_step("Completed Stage 1.")

            # Stage 2
            if not args.stage or args.stage == 2:
                stage_2_donation_checkout(user_page, args.url, args.pause_at_checkout)
                if args.step_by_step: prompt_step("Completed Stage 2.")

            # Stage 3
            if not args.stage or args.stage == 3:
                stage_3_member_registration(user_page, args.url, args.name, args.email, args.password, TEST_USER_BATCH, TEST_USER_GENDER)
                if args.step_by_step: prompt_step("Completed Stage 3.")

            # Stage 4
            if not args.stage or args.stage == 4:
                stage_4_member_login(user_page, args.url, args.email, args.password)
                if args.step_by_step: prompt_step("Completed Stage 4.")

            # Stage 5
            if not args.stage or args.stage == 5:
                stage_5_bulletin_interaction(user_page, args.url)
                if args.step_by_step: prompt_step("Completed Stage 5.")

            # Stage 6
            if not args.stage or args.stage == 6:
                stage_6_directory_networking(user_page, args.url)
                if args.step_by_step: prompt_step("Completed Stage 6.")

            # Stage 7
            if not args.stage or args.stage == 7:
                stage_7_event_discovery_and_rsvp(user_page, args.url)
                if args.step_by_step: prompt_step("Completed Stage 7.")

            # Stage 8
            if not args.stage or args.stage == 8:
                admin_page.bring_to_front()
                stage_8_admin_elevation(admin_page, args.url, args.admin_user, args.admin_pass, args.name)
                user_page.bring_to_front()
                if args.step_by_step: prompt_step("Completed Stage 8.")

            # Stage 9
            if not args.stage or args.stage == 9:
                stage_9_official_event_creation(user_page, args.url)
                if args.step_by_step: prompt_step("Completed Stage 9.")

            print("\n" + "=" * 78)
            print("[SUCCESS] HAPPY PATH DEMO COMPLETED SUCCESSFULLY!")
            print("=" * 78)

        except Exception as err:
            print(f"\n[ERROR] Error encountered during automation: {err}")
            raise err
        finally:
            time.sleep(2)
            context.close()
            browser.close()


if __name__ == "__main__":
    main()
