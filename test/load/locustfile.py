#!/usr/bin/env python3
"""
Locust High-Concurrency Persona Simulation Suite
Target: https://najealp.top (configurable via --host)
Models:
  - RegularUser (Weight 55): Browses filtered catalogs, updates /api/profiles/:id,
    manages exclusive VU RSVPs, creates/updates bulletins.
  - OfficialUser (Weight 20): Publishes official bulletins, manages event RSVPs,
    browses relational catalogs.
  - CrazyAdmin (Weight 10): Rapid polling of dashboard stats, donation summaries,
    and bulletin/event status moderation on dedicated disposable items.
  - RegistrationWorstCase (Weight 15): Concurrent registrations (bcrypt + SQLite tx).

Pre-validates all admin, official, and regular credential tokens on test_start
with automatic fallback before spawning traffic so requests do not reject with 401.
"""

from concurrent.futures import ThreadPoolExecutor
import json
import os
import random
import threading
import time
import uuid

from locust import HttpUser, task, between, events
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")

os.makedirs(RESULTS_DIR, exist_ok=True)

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

DEFAULT_PASSWORD = os.environ.get("LOADTEST_DEFAULT_PASSWORD", "123456")

# Shared verified pools populated at test_start
TELEMETRY_LOCK = threading.Lock()
ROUTE_TELEMETRY = {}

VERIFIED_ADMINS = []
VERIFIED_OFFICIALS = []
VERIFIED_REGULARS = []
DISCOVERED_BULLETIN_CATEGORIES = []
DISCOVERED_EVENT_CATEGORIES = []
MODERATION_BULLETIN_IDS = []
MODERATION_EVENT_IDS = []
CONCLUDE_EVENT_IDS = []
CREATED_BULLETIN_IDS = []
CREATED_EVENT_IDS = []
CREATED_LOCK = threading.Lock()
SETUP_ERROR = ""


@events.request.add_listener
def on_request(
    request_type,
    name,
    response_time,
    response_length,
    response=None,
    context=None,
    exception=None,
    **kwargs,
):
    status_code = 0
    if response is not None and getattr(response, "status_code", None) is not None:
        status_code = int(response.status_code)
    elif context and isinstance(context, dict) and "status_code" in context:
        status_code = int(context["status_code"])

    error_msg = str(exception) if exception else ""

    with TELEMETRY_LOCK:
        entry = ROUTE_TELEMETRY.setdefault(
            name,
            {
                "name": name,
                "method": request_type,
                "total_calls": 0,
                "total_time_ms": 0.0,
                "latencies": [],
                "status_counts": {},
                "errors": [],
            },
        )
        entry["total_calls"] += 1
        entry["total_time_ms"] += float(response_time or 0.0)
        entry["latencies"].append(float(response_time or 0.0))
        sc_key = str(status_code)
        entry["status_counts"][sc_key] = entry["status_counts"].get(sc_key, 0) + 1
        if error_msg:
            entry["errors"].append(error_msg[:180])


def _login_and_verify_admin(base_url: str, username: str, password: str):
    sess = requests.Session()
    try:
        r = sess.post(
            f"{base_url}/api/auth/admin/login",
            json={"username": username, "password": password},
            timeout=15,
        )
        if r.status_code != 200 and password != DEFAULT_PASSWORD:
            r = sess.post(
                f"{base_url}/api/auth/admin/login",
                json={"username": username, "password": DEFAULT_PASSWORD},
                timeout=15,
            )
        if r.status_code != 200:
            return None
        tok = r.json().get("token")
        if not tok:
            return None
        hdr = {"Authorization": f"Bearer {tok}"}
        me = sess.get(f"{base_url}/api/auth/admin/me", headers=hdr, timeout=15)
        dash = sess.get(f"{base_url}/api/admin/dashboard-stats", headers=hdr, timeout=15)
        if me.status_code == 200 and dash.status_code == 200:
            admin_id = me.json().get("admin", {}).get("id")
            return {"username": username, "id": admin_id, "token": tok}
    except Exception:
        return None
    finally:
        sess.close()
    return None


def _login_and_verify_user(base_url: str, email: str, password: str):
    sess = requests.Session()
    try:
        r = sess.post(
            f"{base_url}/api/auth/login",
            json={"email": email, "password": password},
            timeout=15,
        )
        if r.status_code != 200 and password != DEFAULT_PASSWORD:
            r = sess.post(
                f"{base_url}/api/auth/login",
                json={"email": email, "password": DEFAULT_PASSWORD},
                timeout=15,
            )
        if r.status_code != 200:
            return None
        tok = r.json().get("token")
        if not tok:
            return None
        me = sess.get(
            f"{base_url}/api/auth/me",
            headers={"Authorization": f"Bearer {tok}"},
            timeout=15,
        )
        if me.status_code == 200 and me.json().get("id"):
            return {"email": email, "id": str(me.json()["id"]), "token": tok}
    except Exception:
        return None
    finally:
        sess.close()
    return None


def _provision_and_verify_user(
    base_url: str,
    admin_token: str,
    email: str,
    full_name: str,
    target_status_name: str,
):
    existing = _login_and_verify_user(base_url, email, DEFAULT_PASSWORD)
    if existing is not None:
        return existing
    if not admin_token:
        return None
    sess = requests.Session()
    try:
        hdr = {"Authorization": f"Bearer {admin_token}"}
        statuses = sess.get(f"{base_url}/api/userStatuses", timeout=15).json()
        degrees = sess.get(f"{base_url}/api/degrees", timeout=15).json()
        st_list = statuses if isinstance(statuses, list) else statuses.get("data", [])
        dg_list = degrees if isinstance(degrees, list) else degrees.get("data", [])
        st_id = next(
            (str(s["id"]) for s in st_list if str(s.get("statusName", "")).lower() == target_status_name.lower()),
            str(st_list[0]["id"]) if st_list else "",
        )
        dg_id = next(
            (str(d["id"]) for d in dg_list if str(d.get("degreeAbbr", "")).lower() == "bscpe"),
            str(dg_list[0]["id"]) if dg_list else "",
        )
        cr = sess.post(
            f"{base_url}/api/admin/users",
            headers=hdr,
            json={
                "fullName": full_name,
                "email": email,
                "password": DEFAULT_PASSWORD,
                "degreeId": dg_id,
                "batch": 2024,
                "gender": "Male",
                "userStatusId": st_id,
                "reason": "Locust persona suite dedicated credential",
            },
            timeout=15,
        )
        if cr.status_code in (200, 201):
            return _login_and_verify_user(base_url, email, DEFAULT_PASSWORD)
        rpr = sess.post(
            f"{base_url}/api/auth/reset-password",
            json={"email": email, "password": DEFAULT_PASSWORD},
            timeout=15,
        )
        if rpr.status_code == 200:
            return _login_and_verify_user(base_url, email, DEFAULT_PASSWORD)
    except Exception:
        return None
    finally:
        sess.close()
    return None


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    global VERIFIED_ADMINS, VERIFIED_OFFICIALS, VERIFIED_REGULARS
    global DISCOVERED_BULLETIN_CATEGORIES, DISCOVERED_EVENT_CATEGORIES
    global MODERATION_BULLETIN_IDS, MODERATION_EVENT_IDS, CONCLUDE_EVENT_IDS
    global SETUP_ERROR

    SETUP_ERROR = ""
    ROUTE_TELEMETRY.clear()
    CREATED_BULLETIN_IDS.clear()
    CREATED_EVENT_IDS.clear()

    base_url = (environment.host or CONFIG.get("baseUrl") or "https://najealp.top").rstrip("/")
    creds = CONFIG.get("credentials", {})

    admin_cands = []
    seen_adm = set()
    for a in creds.get("admins", []):
        u = a.get("username")
        if u and u not in seen_adm:
            seen_adm.add(u)
            admin_cands.append((u, a.get("password") or DEFAULT_PASSWORD))
    for i in range(1, 11):
        u = f"admin{i}"
        if u not in seen_adm:
            seen_adm.add(u)
            admin_cands.append((u, DEFAULT_PASSWORD))

    off_cands = []
    seen_off = set()
    for e in ["loadtest_jmx_official@najealp.top"]:
        seen_off.add(e)
        off_cands.append((e, DEFAULT_PASSWORD))
    for o in creds.get("officials", []):
        e = o.get("email")
        if e and e not in seen_off:
            seen_off.add(e)
            off_cands.append((e, o.get("password") or DEFAULT_PASSWORD))
    for i in range(1, 6):
        e = f"test.official{i}@najealp.top"
        if e not in seen_off:
            seen_off.add(e)
            off_cands.append((e, DEFAULT_PASSWORD))

    reg_cands = []
    seen_reg = set()
    for e in ["loadtest_jmx_primary@najealp.top", "loadtest_jmx_secondary@najealp.top"]:
        seen_reg.add(e)
        reg_cands.append((e, DEFAULT_PASSWORD))
    for r in creds.get("regulars", []):
        e = r.get("email")
        if e and e not in seen_reg:
            seen_reg.add(e)
            reg_cands.append((e, r.get("password") or DEFAULT_PASSWORD))
    for i in range(1, 6):
        e = f"test.regular{i}@najealp.top"
        if e not in seen_reg:
            seen_reg.add(e)
            reg_cands.append((e, DEFAULT_PASSWORD))

    with ThreadPoolExecutor(max_workers=10) as pool:
        VERIFIED_ADMINS = [
            res
            for res in pool.map(lambda c: _login_and_verify_admin(base_url, c[0], c[1]), admin_cands)
            if res is not None
        ]
        VERIFIED_OFFICIALS = [
            res
            for res in pool.map(lambda c: _login_and_verify_user(base_url, c[0], c[1]), off_cands)
            if res is not None
        ]
        VERIFIED_REGULARS = [
            res
            for res in pool.map(lambda c: _login_and_verify_user(base_url, c[0], c[1]), reg_cands)
            if res is not None
        ]

    if VERIFIED_ADMINS and not VERIFIED_OFFICIALS:
        prov_off = _provision_and_verify_user(
            base_url,
            VERIFIED_ADMINS[0]["token"],
            "loadtest_jmx_official@najealp.top",
            "JMX Official Tester",
            "Official",
        )
        if prov_off is not None:
            VERIFIED_OFFICIALS.append(prov_off)

    if VERIFIED_ADMINS and len(VERIFIED_REGULARS) < 2:
        for email, full_name in [
            ("loadtest_jmx_primary@najealp.top", "JMX Primary Tester"),
            ("loadtest_jmx_secondary@najealp.top", "JMX Secondary Tester"),
        ]:
            if all(u["email"] != email for u in VERIFIED_REGULARS):
                prov_reg = _provision_and_verify_user(
                    base_url, VERIFIED_ADMINS[0]["token"], email, full_name, "Regular"
                )
                if prov_reg is not None:
                    VERIFIED_REGULARS.append(prov_reg)

    if not VERIFIED_ADMINS or not VERIFIED_OFFICIALS or not VERIFIED_REGULARS:
        SETUP_ERROR = (
            f"[Locust Setup FAIL] Insufficient verified tokens: "
            f"admins={len(VERIFIED_ADMINS)}, officials={len(VERIFIED_OFFICIALS)}, regulars={len(VERIFIED_REGULARS)}"
        )
        print(f"[!] {SETUP_ERROR}")
        if getattr(environment, "runner", None) is not None:
            environment.runner.quit()
        raise RuntimeError(SETUP_ERROR)

    # Discover category IDs & seed disposable moderation items on the target
    sess = requests.Session()
    try:
        adm_hdr = {"Authorization": f"Bearer {VERIFIED_ADMINS[0]['token']}"}
        b_cats = sess.get(f"{base_url}/api/bulletinCategories", timeout=15).json()
        e_cats = sess.get(f"{base_url}/api/eventCategories", timeout=15).json()
        DISCOVERED_BULLETIN_CATEGORIES = [str(c["id"]) for c in (b_cats if isinstance(b_cats, list) else b_cats.get("data", [])) if "id" in c]
        DISCOVERED_EVENT_CATEGORIES = [str(c["id"]) for c in (e_cats if isinstance(e_cats, list) else e_cats.get("data", [])) if "id" in c]

        b_cat = DISCOVERED_BULLETIN_CATEGORIES[0]
        e_cat = DISCOVERED_EVENT_CATEGORIES[0]

        MODERATION_BULLETIN_IDS = []
        for idx in range(5):
            br = sess.post(
                f"{base_url}/api/admin/bulletins",
                headers=adm_hdr,
                json={
                    "title": f"Locust Moderation Target #{idx} {uuid.uuid4().hex[:6]}",
                    "content": "Disposable bulletin created for Locust moderation load.",
                    "bulletinCategoryId": b_cat,
                    "status": "Pending",
                },
                timeout=15,
            )
            if br.status_code in (200, 201) and br.json().get("id"):
                bid = str(br.json()["id"])
                MODERATION_BULLETIN_IDS.append(bid)
                CREATED_BULLETIN_IDS.append(bid)

        MODERATION_EVENT_IDS = []
        CONCLUDE_EVENT_IDS = []
        for idx in range(4):
            er = sess.post(
                f"{base_url}/api/admin/events",
                headers=adm_hdr,
                json={
                    "title": f"Locust Event Target #{idx} {uuid.uuid4().hex[:6]}",
                    "description": "Disposable event created for Locust moderation/conclude load.",
                    "eventDate": "2026-12-28",
                    "startTime": "09:00",
                    "endTime": "11:00",
                    "modality": "Virtual",
                    "eventCategoryId": e_cat,
                    "status": "Pending",
                },
                timeout=15,
            )
            if er.status_code in (200, 201) and er.json().get("id"):
                eid = str(er.json()["id"])
                if idx < 2:
                    MODERATION_EVENT_IDS.append(eid)
                else:
                    CONCLUDE_EVENT_IDS.append(eid)
                CREATED_EVENT_IDS.append(eid)
    finally:
        sess.close()

    print(
        f"[+] Locust preflight verified -> Admins={len(VERIFIED_ADMINS)}, "
        f"Officials={len(VERIFIED_OFFICIALS)}, Regulars={len(VERIFIED_REGULARS)} | "
        f"Disposable mod bulletins={len(MODERATION_BULLETIN_IDS)}, events={len(MODERATION_EVENT_IDS) + len(CONCLUDE_EVENT_IDS)}"
    )


def _auth_hdr(token: str):
    return {"Authorization": f"Bearer {token}"} if token else {}


def _cleanup_created_entities(base_url: str):
    if not VERIFIED_ADMINS:
        return
    adm_hdr = {"Authorization": f"Bearer {VERIFIED_ADMINS[0]['token']}"}
    sess = requests.Session()
    try:
        with CREATED_LOCK:
            b_ids = list(set(CREATED_BULLETIN_IDS))
            e_ids = list(set(CREATED_EVENT_IDS))
            CREATED_BULLETIN_IDS.clear()
            CREATED_EVENT_IDS.clear()
        for bid in b_ids:
            try:
                sess.delete(f"{base_url}/api/bulletins/{bid}", headers=adm_hdr, timeout=10)
            except Exception:
                pass
        for eid in e_ids:
            try:
                sess.delete(f"{base_url}/api/events/{eid}", headers=adm_hdr, timeout=10)
            except Exception:
                pass
    finally:
        sess.close()


# ==============================================================================
# 1. REGULAR USER PERSONA (Weight: 55)
# ==============================================================================
class RegularUser(HttpUser):
    weight = 55
    wait_time = between(0.5, 2.0)

    def on_start(self):
        cred = random.choice(VERIFIED_REGULARS)
        self.token = cred["token"]
        self.user_id = cred["id"]
        self.own_event_id = None
        self.own_rsvp_id = None

        # Verify session token cleanly via /api/auth/me before starting tasks
        with self.client.get(
            "/api/auth/me",
            headers=_auth_hdr(self.token),
            name="[Auth] Verify Regular Token",
            catch_response=True,
        ) as res:
            if res.status_code != 200:
                res.failure(f"Token check returned {res.status_code}")

    def on_stop(self):
        if self.own_rsvp_id:
            try:
                self.client.delete(
                    f"/api/userRsvps/{self.own_rsvp_id}",
                    headers=_auth_hdr(self.token),
                    name="/api/userRsvps/:id [Cleanup]",
                )
            except Exception:
                pass
        if self.own_event_id:
            try:
                self.client.delete(
                    f"/api/events/{self.own_event_id}",
                    headers=_auth_hdr(self.token),
                    name="/api/events/:id [Cleanup]",
                )
            except Exception:
                pass

    @task(4)
    def browse_bulletins_filtered(self):
        page = random.randint(1, 4)
        sort_field = random.choice(["bulletinDate", "title"])
        order = random.choice(["asc", "desc"])
        self.client.get(
            f"/api/bulletins?_sort={sort_field}&_order={order}&_page={page}&_per_page=10",
            name="/api/bulletins [Filtered Page]",
        )

    @task(3)
    def browse_events_filtered(self):
        page = random.randint(1, 3)
        sort_field = random.choice(["eventDate", "title"])
        order = random.choice(["asc", "desc"])
        self.client.get(
            f"/api/events?_sort={sort_field}&_order={order}&_page={page}&_per_page=10",
            name="/api/events [Filtered Page]",
        )

    @task(3)
    def browse_relational_bulletins(self):
        self.client.get(
            "/api/bulletins?_include=category,author,status&_page=1&_per_page=10",
            name="/api/bulletins [_include=category,author,status]",
        )

    @task(2)
    def browse_users_directory(self):
        self.client.get(
            "/api/users?_include=profile,userStatus,profileStatus&_page=1&_per_page=10",
            name="/api/users [_include=profile,userStatus]",
        )

    @task(2)
    def lookup_statuses(self):
        target = random.choice(
            ["userStatuses", "contentStatuses", "eventStatuses", "degrees", "bulletinCategories"]
        )
        self.client.get(f"/api/{target}", name=f"/api/{target}")

    @task(2)
    def rsvp_to_event(self):
        """Creates an exclusive VU event once, then cycles POST/PATCH RSVPs without collisions."""
        hdrs = _auth_hdr(self.token)
        if not self.own_event_id:
            if not DISCOVERED_EVENT_CATEGORIES:
                return
            e_cat = random.choice(DISCOVERED_EVENT_CATEGORIES)
            er = self.client.post(
                "/api/events",
                json={
                    "title": f"Locust RSVP Event {uuid.uuid4().hex[:8]}",
                    "description": "Disposable event for conflict-free VU RSVP.",
                    "eventDate": "2026-12-30",
                    "startTime": "10:00",
                    "endTime": "12:00",
                    "modality": "Virtual",
                    "eventCategoryId": e_cat,
                    "status": "Approved",
                },
                headers=hdrs,
                name="/api/events [Exclusive RSVP Target]",
            )
            if er.status_code in (200, 201) and er.json().get("id"):
                self.own_event_id = str(er.json()["id"])
                with CREATED_LOCK:
                    CREATED_EVENT_IDS.append(self.own_event_id)
            else:
                return

        if not self.own_rsvp_id:
            rr = self.client.post(
                "/api/userRsvps",
                json={
                    "eventId": self.own_event_id,
                    "userId": self.user_id,
                    "isAttending": True,
                },
                headers=hdrs,
                name="/api/userRsvps [RSVP Post]",
            )
            if rr.status_code in (200, 201) and rr.json().get("id"):
                self.own_rsvp_id = str(rr.json()["id"])
        else:
            self.client.patch(
                f"/api/userRsvps/{self.own_rsvp_id}",
                json={"isAttending": random.choice([True, False])},
                headers=hdrs,
                name="/api/userRsvps/:id [RSVP Toggle]",
            )

    @task(1)
    def update_profile(self):
        """Updates profile bio on /api/profiles/:userId."""
        self.client.patch(
            f"/api/profiles/{self.user_id}",
            json={"bio": f"Locust profile refresh at {int(time.time())}"},
            headers=_auth_hdr(self.token),
            name="/api/profiles/:id [Profile Patch]",
        )

    @task(1)
    def post_community_bulletin(self):
        """Regular users creating occasional bulletins (tracked for cleanup)."""
        if not DISCOVERED_BULLETIN_CATEGORIES:
            return
        cat_id = random.choice(DISCOVERED_BULLETIN_CATEGORIES)
        r = self.client.post(
            "/api/bulletins",
            json={
                "title": f"Community Question #{uuid.uuid4().hex[:6]}",
                "content": "Looking for advice on alumni chapter meetings.",
                "bulletinCategoryId": cat_id,
                "status": "Pending",
            },
            headers=_auth_hdr(self.token),
            name="/api/bulletins [Regular Post]",
        )
        if r.status_code in (200, 201) and r.json().get("id"):
            with CREATED_LOCK:
                CREATED_BULLETIN_IDS.append(str(r.json()["id"]))


# ==============================================================================
# 2. OFFICIAL USER PERSONA (Weight: 20)
# ==============================================================================
class OfficialUser(HttpUser):
    weight = 20
    wait_time = between(0.3, 1.5)

    def on_start(self):
        cred = random.choice(VERIFIED_OFFICIALS)
        self.token = cred["token"]
        self.user_id = cred["id"]
        self.own_event_id = None
        self.own_rsvp_id = None

        with self.client.get(
            "/api/auth/me",
            headers=_auth_hdr(self.token),
            name="[Auth] Verify Official Token",
            catch_response=True,
        ) as res:
            if res.status_code != 200:
                res.failure(f"Official token check returned {res.status_code}")

    def on_stop(self):
        if self.own_rsvp_id:
            try:
                self.client.delete(
                    f"/api/userRsvps/{self.own_rsvp_id}",
                    headers=_auth_hdr(self.token),
                    name="/api/userRsvps/:id [Cleanup]",
                )
            except Exception:
                pass
        if self.own_event_id:
            try:
                self.client.delete(
                    f"/api/events/{self.own_event_id}",
                    headers=_auth_hdr(self.token),
                    name="/api/events/:id [Cleanup]",
                )
            except Exception:
                pass

    @task(4)
    def post_official_bulletin(self):
        if not DISCOVERED_BULLETIN_CATEGORIES:
            return
        cat_id = random.choice(DISCOVERED_BULLETIN_CATEGORIES)
        r = self.client.post(
            "/api/bulletins",
            json={
                "title": f"Official Announcement #{uuid.uuid4().hex[:6]}",
                "content": "Important update regarding regional alumni conference registration.",
                "bulletinCategoryId": cat_id,
                "status": "Approved",
            },
            headers=_auth_hdr(self.token),
            name="/api/bulletins [Official Post]",
        )
        if r.status_code in (200, 201) and r.json().get("id"):
            with CREATED_LOCK:
                CREATED_BULLETIN_IDS.append(str(r.json()["id"]))

    @task(3)
    def rsvp_official_event(self):
        hdrs = _auth_hdr(self.token)
        if not self.own_event_id:
            if not DISCOVERED_EVENT_CATEGORIES:
                return
            e_cat = random.choice(DISCOVERED_EVENT_CATEGORIES)
            er = self.client.post(
                "/api/events",
                json={
                    "title": f"Official RSVP Event {uuid.uuid4().hex[:8]}",
                    "description": "Disposable official event for conflict-free RSVP.",
                    "eventDate": "2026-12-30",
                    "startTime": "14:00",
                    "endTime": "16:00",
                    "modality": "Virtual",
                    "eventCategoryId": e_cat,
                    "status": "Approved",
                },
                headers=hdrs,
                name="/api/events [Official RSVP Target]",
            )
            if er.status_code in (200, 201) and er.json().get("id"):
                self.own_event_id = str(er.json()["id"])
                with CREATED_LOCK:
                    CREATED_EVENT_IDS.append(self.own_event_id)
            else:
                return

        if not self.own_rsvp_id:
            rr = self.client.post(
                "/api/userRsvps",
                json={
                    "eventId": self.own_event_id,
                    "userId": self.user_id,
                    "isAttending": True,
                },
                headers=hdrs,
                name="/api/userRsvps [Official RSVP]",
            )
            if rr.status_code in (200, 201) and rr.json().get("id"):
                self.own_rsvp_id = str(rr.json()["id"])
        else:
            self.client.patch(
                f"/api/userRsvps/{self.own_rsvp_id}",
                json={"isAttending": random.choice([True, False])},
                headers=hdrs,
                name="/api/userRsvps/:id [Official Toggle]",
            )

    @task(2)
    def view_official_catalogs(self):
        self.client.get(
            "/api/bulletins?_include=category,author,status&_page=1&_per_page=15",
            name="/api/bulletins [_include=category,author,status]",
        )


# ==============================================================================
# 3. TEN ADMINS PERSONA (Weight: 10)
# ==============================================================================
class CrazyAdmin(HttpUser):
    weight = 10
    wait_time = between(0.1, 0.5)

    def on_start(self):
        adm = random.choice(VERIFIED_ADMINS)
        self.token = adm["token"]
        self.admin_id = adm["id"]

        with self.client.get(
            "/api/auth/admin/me",
            headers=_auth_hdr(self.token),
            name="[Auth] Verify Admin Token",
            catch_response=True,
        ) as res:
            if res.status_code != 200:
                res.failure(f"Admin token check returned {res.status_code}")

    @task(5)
    def poll_dashboard_stats(self):
        self.client.get(
            "/api/admin/dashboard-stats",
            headers=_auth_hdr(self.token),
            name="/api/admin/dashboard-stats",
        )

    @task(4)
    def poll_donations_dashboard(self):
        hdrs = _auth_hdr(self.token)
        self.client.get("/api/donations/summary", headers=hdrs, name="/api/donations/summary")
        self.client.get(
            "/api/donations?_page=1&_per_page=10&_sort=donationDate&_order=desc",
            headers=hdrs,
            name="/api/donations [Table]",
        )

    @task(3)
    def moderate_pending_bulletins(self):
        if not MODERATION_BULLETIN_IDS:
            return
        bulletin_id = random.choice(MODERATION_BULLETIN_IDS)
        new_status = random.choice(["Approved", "Pending", "Rejected"])
        self.client.patch(
            f"/api/admin/bulletins/{bulletin_id}/status",
            json={"status": new_status, "adminNotes": f"Locust moderated at {int(time.time())}"},
            headers=_auth_hdr(self.token),
            name="/api/admin/bulletins/:id/status [Moderate]",
        )

    @task(2)
    def moderate_pending_events(self):
        if not MODERATION_EVENT_IDS:
            return
        event_id = random.choice(MODERATION_EVENT_IDS)
        new_status = random.choice(["Approved", "Pending", "Rejected"])
        self.client.patch(
            f"/api/admin/events/{event_id}/status",
            json={"status": new_status, "adminNotes": f"Locust moderated at {int(time.time())}"},
            headers=_auth_hdr(self.token),
            name="/api/admin/events/:id/status [Moderate]",
        )

    @task(1)
    def conclude_active_events(self):
        if not CONCLUDE_EVENT_IDS:
            return
        event_id = random.choice(CONCLUDE_EVENT_IDS)
        self.client.patch(
            f"/api/admin/events/{event_id}/status",
            json={
                "status": random.choice(["Approved", "Concluded"]),
                "adminNotes": "Locust conclude/reopen stress test.",
            },
            headers=_auth_hdr(self.token),
            name="/api/admin/events/:id/status [Conclude]",
        )


# ==============================================================================
# 4. WORST-CASE CONCURRENT REGISTRATIONS (Weight: 15)
# ==============================================================================
class RegistrationWorstCase(HttpUser):
    weight = 15
    wait_time = between(0.8, 2.5)

    @task(1)
    def burst_register_member(self):
        rand_id = uuid.uuid4().hex[:8]
        degree = random.choice(["BSCpE", "BSME", "BSCE", "BSEE"])
        gender = random.choice(["Male", "Female"])
        batch = random.randint(2018, 2026)

        self.client.post(
            "/api/auth/register",
            json={
                "fullName": f"LoadTest User {rand_id}",
                "email": f"loadtest_{rand_id}@najealp.top",
                "password": DEFAULT_PASSWORD,
                "degreeProgram": degree,
                "batch": batch,
                "gender": gender,
            },
            name="/api/auth/register [Worst-Case Write]",
        )


# ==============================================================================
# Locust Lifecycle Hook to Cleanup Disposable Items & Export Telemetry
# ==============================================================================
@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    base_url = (environment.host or CONFIG.get("baseUrl") or "https://najealp.top").rstrip("/")
    _cleanup_created_entities(base_url)

    print("\n[*] Locust test completed. Exporting telemetry to locust_metrics.json...")
    output_path = os.path.join(RESULTS_DIR, "locust_metrics.json")

    formatted_telemetry = []
    total_calls = 0
    total_errors = 0
    count_401 = 0
    count_5xx = 0

    with TELEMETRY_LOCK:
        items = list(ROUTE_TELEMETRY.items())

    for route_name, data in items:
        latencies = data["latencies"]
        if not latencies:
            continue
        sorted_l = sorted(latencies)
        n = len(sorted_l)
        p50 = sorted_l[int(n * 0.50)]
        p95 = sorted_l[min(int(n * 0.95), n - 1)]
        p99 = sorted_l[min(int(n * 0.99), n - 1)]

        sc = data["status_counts"]
        total_calls += data["total_calls"]
        count_401 += sc.get("401", 0)
        for k, cnt in sc.items():
            if k.isdigit() and int(k) >= 400:
                total_errors += cnt
            if k.isdigit() and int(k) >= 500:
                count_5xx += cnt
        total_errors += sc.get("0", 0)

        formatted_telemetry.append(
            {
                "route": route_name,
                "method": data["method"],
                "totalCalls": data["total_calls"],
                "totalTimeMs": round(data["total_time_ms"], 2),
                "minLatency": round(sorted_l[0], 2),
                "p50Latency": round(p50, 2),
                "p95Latency": round(p95, 2),
                "p99Latency": round(p99, 2),
                "maxLatency": round(sorted_l[-1], 2),
                "statusCounts": sc,
                "recentErrors": data["errors"][:5],
            }
        )

    runner_excs = []
    if getattr(environment, "runner", None) is not None and hasattr(environment.runner, "exceptions"):
        runner_excs = list(environment.runner.exceptions.values())
    exc_count = sum(int(e.get("count", 1)) for e in runner_excs)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "summary": {
                    "totalCalls": total_calls,
                    "totalErrors": total_errors,
                    "count401": count_401,
                    "count5xx": count_5xx,
                    "setupError": SETUP_ERROR,
                    "exceptionsCount": exc_count,
                    "exceptions": [
                        {"count": int(e.get("count", 1)), "msg": str(e.get("msg", ""))[:200]}
                        for e in runner_excs
                    ],
                    "verifiedPools": {
                        "admins": len(VERIFIED_ADMINS),
                        "officials": len(VERIFIED_OFFICIALS),
                        "regulars": len(VERIFIED_REGULARS),
                    },
                },
                "routes": formatted_telemetry,
            },
            f,
            indent=2,
        )
    print(f"[+] Locust telemetry saved to: {output_path} (calls={total_calls}, errs={total_errors}, exc={exc_count}, 401={count_401})")
