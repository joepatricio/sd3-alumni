#!/usr/bin/env python3
"""
Locust High-Concurrency Persona Simulation Suite
Target: https://najealp.top
Models: Regular Users (filters, RSVPs, profile, bulletins), Official Users (heavy posting),
        10 Crazy Admins (dashboard, donations, moderation, event concluding),
        and Worst-Case Concurrent Registrations (bcrypt + transactions).
"""

import json
import os
import random
import time
import uuid
from locust import HttpUser, TaskSet, task, between, events
from locust.runners import MasterRunner, LocalRunner

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")

if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR, exist_ok=True)

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    CONFIG = json.load(f)

# Global Telemetry Collector for Report Generation
ROUTE_TELEMETRY = {}

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, context, **kwargs):
    status_code = 0
    error_msg = ""
    if exception:
        error_msg = str(exception)
    elif hasattr(context, "status_code"):
        status_code = context.status_code
    
    if name not in ROUTE_TELEMETRY:
        ROUTE_TELEMETRY[name] = {
            "name": name,
            "method": request_type,
            "total_calls": 0,
            "total_time_ms": 0,
            "latencies": [],
            "status_counts": {},
            "errors": []
        }
    
    entry = ROUTE_TELEMETRY[name]
    entry["total_calls"] += 1
    entry["total_time_ms"] += response_time
    entry["latencies"].append(response_time)
    entry["status_counts"][status_code] = entry["status_counts"].get(status_code, 0) + 1
    if error_msg:
        entry["errors"].append(error_msg[:150])


# ==============================================================================
# 1. REGULAR USER PERSONA (Weight: 55)
# Browses with dynamic filters, RSVPs to events, customizes profile, posts occasionally
# ==============================================================================
class RegularUser(HttpUser):
    weight = 55
    wait_time = between(0.5, 2.0)

    def on_start(self):
        self.user_data = random.choice(CONFIG["credentials"]["regulars"])
        self.token = None
        self.user_id = None
        # Attempt login
        try:
            res = self.client.post("/api/auth/login", json={
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }, name="[Auth] Regular User Login")
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("token")
                self.user_id = data.get("user", {}).get("id")
        except Exception:
            pass

    @task(4)
    def browse_bulletins_filtered(self):
        page = random.randint(1, 4)
        sort_field = random.choice(["bulletinDate", "title"])
        order = random.choice(["asc", "desc"])
        self.client.get(
            f"/api/bulletins?_sort={sort_field}&_order={order}&_page={page}&_per_page=10",
            name="/api/bulletins [Filtered Page]"
        )

    @task(3)
    def browse_events_filtered(self):
        page = random.randint(1, 3)
        sort_field = random.choice(["eventDate", "title"])
        order = random.choice(["asc", "desc"])
        self.client.get(
            f"/api/events?_sort={sort_field}&_order={order}&_page={page}&_per_page=10",
            name="/api/events [Filtered Page]"
        )

    @task(3)
    def browse_relational_bulletins(self):
        self.client.get(
            "/api/bulletins?_include=category,author,status&_page=1&_per_page=10",
            name="/api/bulletins [_include=category,author,status]"
        )

    @task(2)
    def browse_users_directory(self):
        self.client.get(
            "/api/users?_include=profile,userStatus,profileStatus&_page=1&_per_page=10",
            name="/api/users [_include=profile,userStatus]"
        )

    @task(2)
    def lookup_statuses(self):
        target = random.choice(["userStatuses", "contentStatuses", "eventStatuses", "degrees", "bulletinCategories"])
        self.client.get(f"/api/{target}", name=f"/api/{target}")

    @task(2)
    def rsvp_to_event(self):
        """Regular users RSVPing to events to build up attendance mass."""
        event_id = random.choice(["evt-active-rsvp-01", "evt-active-rsvp-02"])
        user_id = self.user_id or "usr-reg-01"
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.client.post("/api/userRsvps", json={
            "eventId": event_id,
            "userId": user_id,
            "isAttending": True
        }, headers=headers, name="/api/userRsvps [RSVP Post]")

    @task(1)
    def update_profile(self):
        """Occasional profile bio update."""
        if not self.user_id or not self.token:
            return
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.patch(f"/api/users/{self.user_id}", json={
            "bio": f"Automated profile refresh at {int(time.time())}"
        }, headers=headers, name="/api/users/:id [Profile Patch]")

    @task(1)
    def post_community_bulletin(self):
        """Regular users creating occasional bulletins."""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        cat_id = random.choice(["ueMRjAn-P0", "nEA2WEPc5f", "V377yrrzBG"])
        self.client.post("/api/bulletins", json={
            "title": f"Community Question #{random.randint(100, 9999)}",
            "content": "Looking for advice on alumni chapter meetings.",
            "bulletinCategoryId": cat_id
        }, headers=headers, name="/api/bulletins [Regular Post]")


# ==============================================================================
# 2. OFFICIAL USER PERSONA (Weight: 20)
# Heavy content creators, RSVP participants, profile management
# ==============================================================================
class OfficialUser(HttpUser):
    weight = 20
    wait_time = between(0.3, 1.5)

    def on_start(self):
        self.user_data = random.choice(CONFIG["credentials"]["officials"])
        self.token = None
        self.user_id = None
        try:
            res = self.client.post("/api/auth/login", json={
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }, name="[Auth] Official User Login")
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("token")
                self.user_id = data.get("user", {}).get("id")
        except Exception:
            pass

    @task(4)
    def post_official_bulletin(self):
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        cat_id = random.choice(["ueMRjAn-P0", "nEA2WEPc5f", "bUrCvEmlu5"])
        self.client.post("/api/bulletins", json={
            "title": f"Official Announcement #{random.randint(100, 9999)}",
            "content": "Important update regarding regional alumni conference registration.",
            "bulletinCategoryId": cat_id
        }, headers=headers, name="/api/bulletins [Official Post]")

    @task(3)
    def rsvp_official_event(self):
        event_id = random.choice(["evt-active-rsvp-01", "evt-active-rsvp-02"])
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.client.post("/api/userRsvps", json={
            "eventId": event_id,
            "userId": self.user_id or "usr-off-01",
            "isAttending": True
        }, headers=headers, name="/api/userRsvps [Official RSVP]")

    @task(2)
    def view_official_catalogs(self):
        self.client.get(
            "/api/bulletins?_include=category,author,status&_page=1&_per_page=15",
            name="/api/bulletins [_include=category,author,status]"
        )


# ==============================================================================
# 3. TEN ADMINS "ON CRACK" (Weight: 10)
# Rapid polling of dashboard stats, donation summaries, queue moderation, concluding events
# ==============================================================================
class CrazyAdmin(HttpUser):
    weight = 10
    wait_time = between(0.1, 0.5)  # "On crack" rapid frequency

    def on_start(self):
        admin_creds = random.choice(CONFIG["credentials"]["admins"])
        self.token = None
        self.admin_id = None
        try:
            res = self.client.post("/api/auth/admin/login", json={
                "username": admin_creds["username"],
                "password": admin_creds["password"]
            }, name="[Auth] Admin Login")
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("token")
                self.admin_id = data.get("admin", {}).get("id")
        except Exception:
            pass

    @task(5)
    def poll_dashboard_stats(self):
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.client.get("/api/admin/dashboard-stats", headers=headers, name="/api/admin/dashboard-stats")

    @task(4)
    def poll_donations_dashboard(self):
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.client.get("/api/donations/summary", headers=headers, name="/api/donations/summary")
        self.client.get("/api/donations?_page=1&_per_page=10&_sort=donationDate&_order=desc", headers=headers, name="/api/donations [Table]")

    @task(3)
    def moderate_pending_bulletins(self):
        """Inspects pending bulletins and updates status."""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        bulletin_id = random.choice(["blt-pending-01", "blt-pending-02", "blt-pending-03", "blt-pending-04", "blt-pending-05"])
        new_status = random.choice(["m-_NAqREEk", "jmrJhbs0Tt"])  # Approved or Rejected
        self.client.patch(f"/api/admin/bulletins/{bulletin_id}/status", json={
            "contentStatusId": new_status,
            "adminNotes": f"Moderated at {int(time.time())}"
        }, headers=headers, name="/api/admin/bulletins/:id/status [Moderate]")

    @task(2)
    def moderate_pending_events(self):
        """Inspects pending events and updates status."""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        event_id = random.choice(["evt-pending-01", "evt-pending-02"])
        new_status = random.choice(["j3Ua4WQwdl", "i_nH41i0nE"])  # Approved or Rejected
        self.client.patch(f"/api/admin/events/{event_id}/status", json={
            "eventStatusId": new_status,
            "adminNotes": f"Moderated at {int(time.time())}"
        }, headers=headers, name="/api/admin/events/:id/status [Moderate]")

    @task(1)
    def conclude_active_events(self):
        """Concludes events once substantial RSVPs accumulate."""
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        event_id = random.choice(["evt-active-rsvp-01", "evt-active-rsvp-02"])
        self.client.patch(f"/api/admin/events/{event_id}/status", json={
            "eventStatusId": "-ld2vFCPki",  # Concluded
            "adminNotes": "Concluded after high-concurrency attendance threshold reached."
        }, headers=headers, name="/api/admin/events/:id/status [Conclude]")


# ==============================================================================
# 4. WORST-CASE CONCURRENT REGISTRATIONS (Weight: 15)
# Generates bursts of user registrations (bcrypt hashing + multi-table SQLite transactions)
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
        
        self.client.post("/api/auth/register", json={
            "fullName": f"LoadTest User {rand_id}",
            "email": f"loadtest_{rand_id}@najealp.top",
            "password": "Password123!",
            "degreeProgram": degree,
            "batch": batch,
            "gender": gender
        }, name="/api/auth/register [Worst-Case Write]")


# ==============================================================================
# Locust Lifecycle Hooks to Export Telemetry
# ==============================================================================
@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("\n[*] Locust test completed. Exporting telemetry to locust_metrics.json...")
    output_path = os.path.join(RESULTS_DIR, "locust_metrics.json")
    
    formatted_telemetry = []
    for route_name, data in ROUTE_TELEMETRY.items():
        latencies = data["latencies"]
        if not latencies:
            continue
        sorted_l = sorted(latencies)
        p50 = sorted_l[int(len(sorted_l) * 0.50)]
        p95 = sorted_l[min(int(len(sorted_l) * 0.95), len(sorted_l) - 1)]
        p99 = sorted_l[min(int(len(sorted_l) * 0.99), len(sorted_l) - 1)]
        
        formatted_telemetry.append({
            "route": route_name,
            "method": data["method"],
            "totalCalls": data["total_calls"],
            "totalTimeMs": data["total_time_ms"],
            "minLatency": sorted_l[0],
            "p50Latency": p50,
            "p95Latency": p95,
            "p99Latency": p99,
            "maxLatency": sorted_l[-1],
            "statusCounts": data["status_counts"],
            "recentErrors": data["errors"][:5]
        })
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "routes": formatted_telemetry
        }, f, indent=2)
    print(f"[+] Locust telemetry saved to: {output_path}")
