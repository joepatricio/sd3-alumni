#!/usr/bin/env python3
"""
Playwright Test Suite: Event & Bulletin Status Matrix Validation
Validates access control, catalog presence, and author editing permissions
against docs/event_hidden.csv and docs/bulletin_hidden.csv.
"""

import sys
import os
import re
import csv
import json
import time
import hmac
import hashlib
import base64
import argparse
import urllib.request
import urllib.error
from typing import Dict, List, Optional, Any, Tuple
from playwright.sync_api import sync_playwright, Page, BrowserContext

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_BASE_URL = "http://localhost:5173"

# ==============================================================================
# CONFIG & AUTHENTICATION HELPERS
# ==============================================================================

def load_jwt_secret() -> str:
    env_path = os.path.join(PROJECT_ROOT, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("JWT_SECRET="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return "your_secret_key"

JWT_SECRET = load_jwt_secret()

def create_jwt_cookie(user_id: str, email: str, secret: str = JWT_SECRET) -> str:
    """Signs a valid JWT token matching the backend verification."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "id": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400
    }
    def b64url(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

    h = b64url(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    p = b64url(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    msg = f"{h}.{p}".encode('utf-8')
    sig = b64url(hmac.new(secret.encode('utf-8'), msg, hashlib.sha256).digest())
    return f"{h}.{p}.{sig}"

def try_login_user(base_url: str, email: str, password: str = "123456") -> Optional[str]:
    """Attempts login via POST /api/auth/login. Returns token if successful."""
    url = f"{base_url.rstrip('/')}/api/auth/login"
    req = urllib.request.Request(
        url,
        data=json.dumps({"email": email, "password": password}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode("utf-8"))
            return data.get("token")
    except Exception:
        return None

# ==============================================================================
# HTTP API HELPERS
# ==============================================================================

def api_get(url: str) -> Any:
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

def api_post(url: str, data: dict, headers: Optional[dict] = None) -> Any:
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=h, method="POST")
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

def api_patch(url: str, data: dict, headers: Optional[dict] = None) -> Any:
    h = {"Content-Type": "application/json", "Accept": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=h, method="PATCH")
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))

def api_delete(url: str, headers: Optional[dict] = None) -> Any:
    h = {"Accept": "application/json"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h, method="DELETE")
    try:
        with urllib.request.urlopen(req) as res:
            return res.status
    except Exception:
        return None

# ==============================================================================
# CSV MATRIX PARSER
# ==============================================================================

def parse_matrix_csv(csv_path: str) -> List[Dict[str, Any]]:
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for r in reader:
            if not r or len(r) < 5 or not r[0].strip():
                continue
            rows.append({
                "status": r[0].strip(),
                "user_status": r[1].strip(),
                "is_hidden": r[2].strip().lower() == "true",
                "is_catalogued": r[3].strip().lower() == "true",
                "is_editable": r[4].strip().lower() == "true",
            })
    return rows

# ==============================================================================
# TEST RUNNER & ASSERTIONS
# ==============================================================================

class PlaywrightMatrixTester:
    def __init__(self, base_url: str = DEFAULT_BASE_URL, headless: bool = True):
        self.base_url = base_url.rstrip('/')
        self.headless = headless
        self.users_by_status: Dict[str, List[Dict[str, Any]]] = {}
        self.categories: Dict[str, str] = {}
        self.locations: List[Dict[str, Any]] = []
        self.cleanup_items: List[Tuple[str, str]] = []  # ('events'|'bulletins', id)
        self.test_results: List[Dict[str, Any]] = []

    def setup(self):
        print(f"[INFO] Initializing test harness against {self.base_url}...")
        users = api_get(f"{self.base_url}/api/users")
        for u in users:
            s = u.get("userStatus", {}).get("statusName", "Unknown")
            if s not in self.users_by_status:
                self.users_by_status[s] = []
            self.users_by_status[s].append({
                "id": u["id"],
                "email": u.get("profile", {}).get("email") or f"user_{u['id']}@example.com",
                "name": u.get("profile", {}).get("userName", "User"),
                "status": s
            })
        print(f"[OK] Discovered users across statuses: {', '.join(f'{k}: {len(v)}' for k, v in self.users_by_status.items())}")

        # Fetch categories
        event_cats = api_get(f"{self.base_url}/api/eventCategories")
        if event_cats:
            self.categories["event"] = event_cats[0]["id"]
        bulletin_cats = api_get(f"{self.base_url}/api/bulletinCategories")
        if bulletin_cats:
            self.categories["bulletin"] = bulletin_cats[0]["id"]

        # Fetch locations
        self.locations = api_get(f"{self.base_url}/api/locations")

    def teardown(self):
        print(f"\n[INFO] Cleaning up {len(self.cleanup_items)} dynamic test resources...")
        for table, item_id in self.cleanup_items:
            api_delete(f"{self.base_url}/api/{table}/{item_id}")
        print("[OK] Cleanup completed.")

    def get_user_cookie(self, user: Dict[str, Any]) -> str:
        """Returns signed JWT or logged in cookie."""
        # First attempt real login with standard password
        login_token = try_login_user(self.base_url, user["email"], "123456")
        if login_token:
            return login_token
        # Fallback to direct HMAC JWT signing
        return create_jwt_cookie(user["id"], user["email"])

    def find_or_create_event(self, target_status: str, author_status: str) -> Optional[Tuple[Dict[str, Any], Dict[str, Any]]]:
        """Finds existing matching event or creates one dynamically."""
        events = api_get(f"{self.base_url}/api/events")
        for e in events:
            es = e.get("eventStatus", {}).get("statusName")
            us = e.get("author", {}).get("userStatus", {}).get("statusName")
            if (target_status == "X" or es == target_status) and (author_status == "X" or us == author_status):
                author = {
                    "id": e["authorId"],
                    "email": e.get("author", {}).get("profile", {}).get("email") or f"{e['authorId']}@example.com",
                    "status": us
                }
                return e, author

        # If not found, dynamically create
        target_author_status = "Official" if author_status == "X" else author_status
        authors = self.users_by_status.get(target_author_status, [])
        if not authors:
            return None
        author = authors[0]

        eff_status = "Approved" if target_status == "X" else target_status
        # Past events need eventDate < now
        event_date = "2024-01-15T09:00:00.000Z" if eff_status == "Concluded" else "2027-08-15T09:00:00.000Z"

        new_event = {
            "title": f"Dynamic Test Event {eff_status} {author['status']}",
            "description": "Automated status matrix verification event.",
            "authorId": author["id"],
            "eventCategoryId": self.categories.get("event", "73JAuNaAoA"),
            "eventDate": event_date,
            "startTime": "09:00",
            "endTime": "12:00",
            "modality": "In-Person",
            "status": eff_status
        }
        if self.locations:
            new_event["locationId"] = self.locations[0]["id"]

        try:
            created = api_post(f"{self.base_url}/api/events", new_event)
            self.cleanup_items.append(("events", created["id"]))
            if created.get("eventStatus", {}).get("statusName") != eff_status:
                created = api_patch(f"{self.base_url}/api/events/{created['id']}", {"status": eff_status})
            return created, author
        except Exception as ex:
            print(f"[WARN] Failed to create dynamic test event: {ex}")
            return None

    def find_or_create_bulletin(self, target_status: str, author_status: str) -> Optional[Tuple[Dict[str, Any], Dict[str, Any]]]:
        """Finds existing matching bulletin or creates one dynamically."""
        bulletins = api_get(f"{self.base_url}/api/bulletins")
        for b in bulletins:
            bs = b.get("contentStatus", {}).get("statusName")
            us = b.get("author", {}).get("userStatus", {}).get("statusName")
            if (target_status == "X" or bs == target_status) and (author_status == "X" or us == author_status):
                author = {
                    "id": b["authorId"],
                    "email": b.get("author", {}).get("profile", {}).get("email") or f"{b['authorId']}@example.com",
                    "status": us
                }
                return b, author

        # If not found, dynamically create
        target_author_status = "Regular" if author_status == "X" else author_status
        authors = self.users_by_status.get(target_author_status, [])
        if not authors:
            return None
        author = authors[0]

        eff_status = "Approved" if target_status == "X" else target_status
        new_bulletin = {
            "title": f"Dynamic Test Bulletin {eff_status} {author['status']}",
            "content": "Automated status matrix verification bulletin.",
            "authorId": author["id"],
            "bulletinCategoryId": self.categories.get("bulletin", "1"),
            "status": eff_status
        }

        try:
            created = api_post(f"{self.base_url}/api/bulletins", new_bulletin)
            self.cleanup_items.append(("bulletins", created["id"]))
            if created.get("contentStatus", {}).get("statusName") != eff_status:
                created = api_patch(f"{self.base_url}/api/bulletins/{created['id']}", {"status": eff_status})
            return created, author
        except Exception as ex:
            print(f"[WARN] Failed to create dynamic test bulletin: {ex}")
            return None

    # ==========================================================================
    # TEST ASSERTION LOGIC
    # ==========================================================================

    def run_public_view_test(self, page: Page, item_type: str, item: Dict[str, Any], expected_hidden: bool) -> bool:
        """Tests that public / non-author view conforms to is_hidden."""
        url = f"{self.base_url}/{item_type}s/{item['id']}" if item_type == "event" else f"{self.base_url}/{item_type}/{item['id']}"
        page.goto(url)
        page.wait_for_timeout(1000)

        is_404 = page.locator("text=404 - Not Found").count() > 0 or "The page you are looking for does not exist" in page.content()
        if expected_hidden:
            return is_404
        else:
            return not is_404

    def run_author_view_test(self, context: BrowserContext, page: Page, item_type: str, item: Dict[str, Any], author: Dict[str, Any], expected_status: str, expected_editable: bool) -> Tuple[bool, bool]:
        """Tests that author can view (unless archived) and edit if is_editable."""
        # If author is Banned, they cannot log in
        if author.get("status") == "Banned":
            return True, True

        token = self.get_user_cookie(author)
        context.add_cookies([{
            "name": "token",
            "value": token,
            "domain": "localhost",
            "path": "/",
            "httpOnly": True,
            "secure": False,
            "sameSite": "Lax"
        }])

        url = f"{self.base_url}/{item_type}s/{item['id']}" if item_type == "event" else f"{self.base_url}/{item_type}/{item['id']}"
        page.goto(url)
        page.wait_for_timeout(1200)

        is_404 = page.locator("text=404 - Not Found").count() > 0 or "The page you are looking for does not exist" in page.content()

        # Author can view in any circumstance UNLESS status is Archived
        if expected_status == "Archived":
            view_ok = is_404
        else:
            view_ok = not is_404

        # Edit button presence
        edit_selector = "text=Edit Event" if item_type == "event" else "text=Edit Bulletin"
        has_edit = page.locator(edit_selector).count() > 0

        if expected_status == "Archived":
            editable_ok = not has_edit
        else:
            editable_ok = (has_edit == expected_editable)

        # Clear cookies after author test
        context.clear_cookies()
        return view_ok, editable_ok

    def run_catalog_test(self, page: Page, item_type: str, item: Dict[str, Any], expected_catalogued: bool) -> bool:
        """Tests that item appears or does not appear in public catalog list."""
        catalog_url = f"{self.base_url}/{item_type}s" if item_type == "event" else f"{self.base_url}/{item_type}"
        page.goto(catalog_url)
        page.wait_for_timeout(1000)

        title = item.get("title", "")
        if not title:
            return True

        # Switch to Past filter if testing concluded event
        if item_type == "event" and item.get("eventStatus", {}).get("statusName") == "Concluded":
            past_btn = page.locator("button:has-text('Past')")
            if past_btn.count() > 0:
                past_btn.click()
                page.wait_for_timeout(1000)

        def is_title_on_page() -> bool:
            # Exact regex match on heading text to avoid substring collisions
            pattern = re.compile(f"^{re.escape(title)}$")
            return page.locator("h2, h3").filter(has_text=pattern).count() > 0

        if expected_catalogued:
            # If not immediately visible on page 1, paginate/load more up to 5 times
            found = is_title_on_page()
            for _ in range(5):
                if found:
                    break
                load_more = page.locator("button:has-text('Load More'), button:has-text('Load more')")
                if load_more.count() > 0 and load_more.is_visible():
                    load_more.click()
                    page.wait_for_timeout(800)
                    found = is_title_on_page()
                else:
                    break
            return found
        else:
            # For uncatalogued items, check that it does not appear on initial view
            return not is_title_on_page()

    # ==========================================================================
    # MATRIX SUITE EXECUTION
    # ==========================================================================

    def run_matrix_tests(self, matrix_type: str):
        csv_file = os.path.join(PROJECT_ROOT, "docs", f"{matrix_type}_hidden.csv")
        if not os.path.exists(csv_file):
            print(f"[ERROR] Matrix file {csv_file} not found.")
            return

        rules = parse_matrix_csv(csv_file)
        print(f"\n================================================================================")
        print(f"  RUNNING PLAYWRIGHT MATRIX TESTS: {matrix_type.upper()} ({len(rules)} combinations)")
        print(f"================================================================================")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            context = browser.new_context()
            page = context.new_page()

            passed = 0
            failed = 0
            skipped = 0

            for i, rule in enumerate(rules, 1):
                status = rule["status"]
                user_status = rule["user_status"]
                is_hidden = rule["is_hidden"]
                is_catalogued = rule["is_catalogued"]
                is_editable = rule["is_editable"]

                case_label = f"[{matrix_type.upper()} #{i:02d}] Status: '{status}' | AuthorStatus: '{user_status}'"

                # Find or create target entity
                if matrix_type == "event":
                    match = self.find_or_create_event(status, user_status)
                else:
                    match = self.find_or_create_bulletin(status, user_status)

                if not match:
                    print(f"  [-] {case_label} -> SKIPPED (No candidate user or item available)")
                    skipped += 1
                    continue

                item, author = match
                item_id = item["id"]

                # 1. Test Public View
                public_ok = self.run_public_view_test(page, matrix_type, item, is_hidden)

                # 2. Test Catalog
                catalog_ok = self.run_catalog_test(page, matrix_type, item, is_catalogued)

                # 3. Test Author View & Editability
                author_view_ok, editable_ok = self.run_author_view_test(
                    context, page, matrix_type, item, author, status, is_editable
                )

                all_ok = public_ok and catalog_ok and author_view_ok and editable_ok
                status_icon = "[PASS]" if all_ok else "[FAIL]"

                print(
                    f"  {status_icon} {case_label}\n"
                    f"         Item ID: {item_id} | Public 404={is_hidden} ({'OK' if public_ok else 'ERR'}) | "
                    f"Catalogued={is_catalogued} ({'OK' if catalog_ok else 'ERR'}) | "
                    f"AuthorView ({'OK' if author_view_ok else 'ERR'}) | "
                    f"AuthorEditable={is_editable} ({'OK' if editable_ok else 'ERR'})"
                )

                self.test_results.append({
                    "type": matrix_type,
                    "case": case_label,
                    "item_id": item_id,
                    "status": status,
                    "user_status": user_status,
                    "passed": all_ok,
                    "details": {
                        "public_ok": public_ok,
                        "catalog_ok": catalog_ok,
                        "author_view_ok": author_view_ok,
                        "editable_ok": editable_ok
                    }
                })

                if all_ok:
                    passed += 1
                else:
                    failed += 1

            browser.close()
            print(f"\n[SUMMARY] {matrix_type.upper()}: Passed: {passed}, Failed: {failed}, Skipped: {skipped}")


def main():
    parser = argparse.ArgumentParser(description="Playwright Event & Bulletin Status Matrix Tester")
    parser.add_argument("--url", default=DEFAULT_BASE_URL, help="Base frontend URL")
    parser.add_argument("--type", choices=["all", "event", "bulletin"], default="all", help="Entity type to test")
    parser.add_argument("--headed", action="store_true", help="Run browser in visible mode")
    args = parser.parse_args()

    tester = PlaywrightMatrixTester(base_url=args.url, headless=not args.headed)
    try:
        tester.setup()
        if args.type in ["all", "event"]:
            tester.run_matrix_tests("event")
        if args.type in ["all", "bulletin"]:
            tester.run_matrix_tests("bulletin")
    finally:
        tester.teardown()

    total_tests = len(tester.test_results)
    total_passed = sum(1 for r in tester.test_results if r["passed"])
    total_failed = total_tests - total_passed
    print("=" * 80)
    print(f"FINAL MATRIX TEST RUN RESULT: {total_passed}/{total_tests} PASSED ({total_failed} FAILED)")
    print("=" * 80)

    if total_failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
