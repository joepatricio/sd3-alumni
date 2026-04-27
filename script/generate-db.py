import json
import os
import random
import uuid
import datetime
from nanoid import generate

# Phase 1: Structural Foundation & Reference Tables

DEGREE = [
    {"degree_id": 100, "degree_name": "Mechanical Engineering", "degree_abbr": "BSME"},
    {"degree_id": 101, "degree_name": "Civil Engineering", "degree_abbr": "BSCE"},
    {"degree_id": 102, "degree_name": "Industrial Engineering", "degree_abbr": "BSIE"},
    {"degree_id": 103, "degree_name": "Electrical Engineering", "degree_abbr": "BSEE"},
    {"degree_id": 104, "degree_name": "Electronics and Communications Engineering", "degree_abbr": "BSECE"},
    {"degree_id": 105, "degree_name": "Computer Engineering", "degree_abbr": "BSCpE"}
]

CONNECTION_STATUS = [
    {"connection_id": 200, "connection_name": "Pending"},
    {"connection_id": 201, "connection_name": "Accepted"},
    {"connection_id": 202, "connection_name": "Blocked"}
]

CONTENT_STATUS = [
    {"content_id": 300, "status_name": "Pending"},
    {"content_id": 301, "status_name": "Approved"},
    {"content_id": 302, "status_name": "Rejected"}
]

USER_STATUS = [
    {"user_id": 400, "status_name": "Pending"},
    {"user_id": 401, "status_name": "Regular"},
    {"user_id": 402, "status_name": "Official"},
    {"user_id": 403, "status_name": "Suspended"},
    {"user_id": 404, "status_name": "Banned"}
]

DONATION_STATUS = [
    {"donation_id": 500, "status_name": "Processing"},
    {"donation_id": 501, "status_name": "Completed"},
    {"donation_id": 502, "status_name": "Failed"}
]

EVENT_CATEGORY = [
    {"event_id": 600, "event_category_name": "Reunion"},
    {"event_id": 601, "event_category_name": "Workshop"},
    {"event_id": 602, "event_category_name": "Conference"},
    {"event_id": 603, "event_category_name": "Networking"},
    {"event_id": 604, "event_category_name": "Sports"},
    {"event_id": 605, "event_category_name": "Virtual"}
]

ACHIEVEMENTS = [
    {"achievement_id": 1, "achievement_tier": 1, "achievement_title": "1-Year Club", "achievement_description": "Has been a member for 1 year.", "achievement_icon": "Star"},
    {"achievement_id": 1, "achievement_tier": 2, "achievement_title": "3-Year Club", "achievement_description": "Has been a member for 3 years.", "achievement_icon": "Sparkle"},
    {"achievement_id": 1, "achievement_tier": 3, "achievement_title": "Prestige Alumni", "achievement_description": "Has been a member for 10+ years.", "achievement_icon": "Sparkles"},
    {"achievement_id": 2, "achievement_tier": 1, "achievement_title": "Philanthropist I", "achievement_description": "Donated a small amount to the association (up to ₱5,000 total).", "achievement_icon": "Heart"},
    {"achievement_id": 2, "achievement_tier": 2, "achievement_title": "Philanthropist II", "achievement_description": "Donated a medium amount to the association (up to ₱20,000 total).", "achievement_icon": "HeartPulse"},
    {"achievement_id": 2, "achievement_tier": 3, "achievement_title": "Philanthropist III", "achievement_description": "Donated a large amount to the association (over ₱20,000 total).", "achievement_icon": "HandCoins"},
    {"achievement_id": 3, "achievement_tier": 1, "achievement_title": "Event Enthusiast I", "achievement_description": "Attended 1 events.", "achievement_icon": "Calendar1"},    
    {"achievement_id": 3, "achievement_tier": 2, "achievement_title": "Event Enthusiast II", "achievement_description": "Attended 5 events.", "achievement_icon": "Calendar"},
    {"achievement_id": 3, "achievement_tier": 3, "achievement_title": "Event Enthusiast III", "achievement_description": "Attended 15 events.", "achievement_icon": "CalendarHeart"},
    {"achievement_id": 4, "achievement_tier": 1, "achievement_title": "Conversation Starter I", "achievement_description": "Created 1 bulletin.", "achievement_icon": "Newspaper"},
    {"achievement_id": 4, "achievement_tier": 2, "achievement_title": "Conversation Starter II", "achievement_description": "Created 5 bulletins.", "achievement_icon": "Newspaper"},
    {"achievement_id": 5, "achievement_tier": 1, "achievement_title": "Contributor I", "achievement_description": "Written 10 comments.", "achievement_icon": "MessageSquare"},
    {"achievement_id": 5, "achievement_tier": 2, "achievement_title": "Contributor II", "achievement_description": "Written 50 comments.", "achievement_icon": "MessageCircle"},
    {"achievement_id": 10000, "achievement_tier": 1, "achievement_title": "READS Alumni", "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.", "achievement_icon": "BookOpen"},
    {"achievement_id": 10001, "achievement_tier": 1, "achievement_title": "Verified", "achievement_description": "User has been verified.", "achievement_icon": "Gear"}
]

# ----------------- PHASE 2: Core User Data Generation -----------------

NUM_USERS = 50

FILIPINO_FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Angela", "Mark", "Carla", "Paolo", "Andrea",
    "Miguel", "Sofia", "Daniel", "Rica", "John", "Anne", "Chris", "Bea"
]

FILIPINO_LAST_NAMES = [
    "Santos", "Reyes", "Cruz", "Garcia", "Torres", "Flores",
    "Mendoza", "Castro", "Ramos", "Aquino", "Bautista"
]

COMPANIES = ["Tech Solutions Inc.", "Innovatech", "Global Systems", "Scam Inc.", "Freelance", "Acme Corp"]

def random_date(start_year=2020, end_year=2025):
    start = datetime.datetime(start_year, 1, 1)
    end = datetime.datetime(end_year, 12, 31)
    dt = start + datetime.timedelta(days=random.randint(0, (end - start).days))
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

def generate_phase_2():
    USER = []
    USER_AUTH = []
    RECORDS = []
    PROFILE = []
    USER_STATISTICS = []

    for i in range(1, NUM_USERS + 1):
        user_id = i
        
        status_weights = ["400", "401", "402", "403", "404"]
        status_id = random.choices(status_weights, weights=[10, 70, 10, 5, 5])[0]
        
        record_id = generate(size=10)
        
        USER.append({
            "user_id": user_id,
            "status_id": status_id,
            "current_record_id": record_id
        })
        
        date_created = random_date()
        date_expires = None
        description = "User created or status updated"
        if status_id == "403":
            expires_dt = datetime.datetime.now() + datetime.timedelta(days=30)
            date_expires = expires_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            description = "Suspended for terms violation"
        elif status_id == "404":
            description = "Banned permanently"

        RECORDS.append({
            "record_id": record_id,
            "user_id": user_id,
            "admin_id": random.choice(["admin1", "admin2", "admin3"]), # Placeholder admin
            "status_id": status_id,
            "date_created": date_created,
            "description": description,
            "date_expires": date_expires
        })
        
        fn = random.choice(FILIPINO_FIRST_NAMES)
        ln = random.choice(FILIPINO_LAST_NAMES)
        email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
        
        USER_AUTH.append({
            "user_id": user_id,
            "email": email,
            "password_hash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
            "last_login": random_date(2025, 2026)
        })
        
        job = random.choice(["Software Engineer", "Manager", "Analyst", "Consultant", "Director", "Student"])
        company = random.choice(COMPANIES)
        name = f"{fn} {ln}"
        
        degree_id = random.choice([100, 101, 102, 103, 104, 105])
        birthday = random_date(1960, 2002)
        birth_year = int(birthday.split("-")[0])
        batch = random.randint(birth_year + 20, 2025)

        PROFILE.append({
            "user_id": user_id,
            "user_name": name,
            "email": email,
            "phone": f"+63 917 123 {random.randint(1000, 9999)}",
            "location": random.choice(["Cebu City, Philippines", "Manila, Philippines", "Davao, Philippines", "Abroad"]),
            "currentJob": job,
            "company": company,
            "profileImage": "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080",
            "degree_id": degree_id,
            "batch": batch,
            "birthday": birthday
        })
        
        USER_STATISTICS.append({
            "user_id": user_id,
            "date_registered": date_created,
            "user_connections": 0,
            "events_attended": 0,
            "events_created": 0,
            "bulletins_created": 0,
            "comments_written": 0,
            "achievements": 0,
            "donated_amount": 0
        })

    return USER, USER_AUTH, RECORDS, PROFILE, USER_STATISTICS

# ----------------- PHASE 3: User Relationships & Accolades -----------------

def generate_phase_3(USER, USER_STATISTICS):
    USER_CONNECTIONS = []
    USER_ACHIEVEMENT = []
    
    # 1. Connections (Erdős-Rényi G(n, p) bidirectional graph)
    user_ids = [u["user_id"] for u in USER]
    p_connect = 0.08
    
    for i in range(len(user_ids)):
        for j in range(i + 1, len(user_ids)):
            if random.random() < p_connect:
                uid1 = user_ids[i]
                uid2 = user_ids[j]
                date_updated = random_date(2025, 2026)
                
                # Bilateral connection entries
                USER_CONNECTIONS.append({
                    "connection_id": generate(size=10),
                    "user_id": uid1,
                    "friend_id": uid2,
                    "connection_code": 201, # Accepted
                    "date_updated": date_updated
                })
                USER_CONNECTIONS.append({
                    "connection_id": generate(size=10),
                    "user_id": uid2,
                    "friend_id": uid1,
                    "connection_code": 201, # Accepted
                    "date_updated": date_updated
                })

    # 2. Base Achievements
    today = datetime.datetime.now()
    
    for uid in user_ids:
        # Check 1-Year Club dynamically
        user_stats = next((s for s in USER_STATISTICS if s["user_id"] == uid), None)
        if user_stats:
            date_registered_str = user_stats["date_registered"]
            date_registered = datetime.datetime.strptime(date_registered_str, "%Y-%m-%dT%H:%M:%S.000Z")
            one_year_later = date_registered + datetime.timedelta(days=365)
            three_year_later = date_registered + datetime.timedelta(days=365 * 3)
            ten_year_later = date_registered + datetime.timedelta(days=365 * 10)
            
            if today > ten_year_later:
                USER_ACHIEVEMENT.append({
                    "user_achievement_id": generate(size=10),
                    "user_id": uid,
                    "achievement_id": 1,
                    "achievement_tier": 3,
                    "achieved_date": ten_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
            elif today > three_year_later:
                USER_ACHIEVEMENT.append({
                    "user_achievement_id": generate(size=10),
                    "user_id": uid,
                    "achievement_id": 1,
                    "achievement_tier": 2,
                    "achieved_date": three_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
            elif today > one_year_later:
                USER_ACHIEVEMENT.append({
                    "user_achievement_id": generate(size=10),
                    "user_id": uid,
                    "achievement_id": 1,
                    "achievement_tier": 1,
                    "achieved_date": one_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
                
        # 5% chance to be READS Alumni
        if random.random() < 0.05:
            USER_ACHIEVEMENT.append({
                "user_achievement_id": generate(size=10),
                "user_id": uid,
                "achievement_id": 10000,
                "achievement_tier": 1,
                "achieved_date": random_date(2025, 2026)
            })
            
        # Give Verified achievement if status is Official (402)
        user_obj = next((u for u in USER if u["user_id"] == uid), None)
        if user_obj and user_obj["status_id"] == "402":
            USER_ACHIEVEMENT.append({
                "user_achievement_id": generate(size=10),
                "user_id": uid,
                "achievement_id": 10001,
                "achievement_tier": 1,
                "achieved_date": random_date(2025, 2026)
            })
            
    # Interaction achievements (Philanthropist, etc.) will be dynamically awarded in Phase 5
    return USER_CONNECTIONS, USER_ACHIEVEMENT

# ----------------- PHASE 4: Content Generation -----------------

def generate_phase_4(USER):
    ADMIN = []
    LOCATION = []
    BULLETIN = []
    EVENTS = []
    
    # 1. ADMIN
    ADMIN.append({
        "admin_id": "admin1",
        "password_hash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "last_login": random_date(2025, 2026)
    })
    ADMIN.append({
        "admin_id": "admin2",
        "password_hash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "last_login": random_date(2025, 2026)
    })
    ADMIN.append({
        "admin_id": "admin3",
        "password_hash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "last_login": random_date(2025, 2026)
    })
    
    # 2. LOCATION (Pre-fetched real OSM nodes via reverse-geocoding to guarantee API success)
    locations_base = [
        {"osm_id": "459927080", "region_code": "PH-07", "province": "Cebu", "province_code": "0722", "city_municipality": "Cebu City", "city_code": "072217", "barangay": "Banilad", "landmark": "University of San Carlos Talamban Campus", "street": "Prince Street", "lat": 10.3559376, "lng": 123.9071538},
        {"osm_id": "226488304", "region_code": "PH-07", "province": "Cebu", "province_code": "0722", "city_municipality": "Cebu City", "city_code": "072217", "barangay": "Carreta", "landmark": "Cebu Technological University", "street": "M.J. Cuenco Avenue", "lat": 10.2965937, "lng": 123.9065431},
        {"osm_id": "155927183", "region_code": "PH-07", "province": "Cebu", "province_code": "0722", "city_municipality": "Cebu City", "city_code": "072217", "barangay": "Sambag I", "landmark": "Cebu Normal University", "street": "Osmeña Boulevard", "lat": 10.3016486, "lng": 123.8967853},
        {"osm_id": "155748501", "region_code": "PH-07", "province": "Cebu", "province_code": "0722", "city_municipality": "Cebu City", "city_code": "072217", "barangay": "Lahug", "landmark": "University of Southern Philippines Foundation", "street": "Salinas Drive", "lat": 10.3285606, "lng": 123.9008849},
        {"osm_id": "155643436", "region_code": "PH-07", "province": "Cebu", "province_code": "0722", "city_municipality": "Cebu City", "city_code": "072217", "barangay": "Duljo Fatima", "landmark": "Cebu Institute of Technology - University", "street": "Natalio Bacalso Avenue", "lat": 10.2957783, "lng": 123.8804425}
    ]
    for base in locations_base:
        loc_obj = base.copy()
        loc_obj["id"] = generate(size=10)
        LOCATION.append(loc_obj)
        
    # 3. BULLETIN
    NUM_BULLETINS = 30
    user_ids = [u["user_id"] for u in USER]
    for i in range(1, NUM_BULLETINS + 1):
        bid = i
        author_id = random.choice(user_ids)
        content_status_id = random.choice(["300", "301", "302"]) # Pending, Approved, Rejected
        
        bulletin_date_dt = datetime.datetime.strptime(random_date(2025, 2026), "%Y-%m-%dT%H:%M:%S.000Z")
        bulletin_date = bulletin_date_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        review_date = None
        if content_status_id != "300":
            # review happens after bulletin date
            review_dt = bulletin_date_dt + datetime.timedelta(days=random.randint(1, 30))
            review_date = review_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        BULLETIN.append({
            "bulletin_id": bid,
            "author_id": author_id,
            "content_status_id": content_status_id,
            "bulletin_date": bulletin_date,
            "review_date": review_date,
            "title": f"Community Update {i}",
            "read_time_minutes": random.randint(2, 10),
            "content": f"Lorem ipsum dolor sit amet. Content for bulletin {i}.",
            "bulletin_image": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080"
        })
        
    # 4. EVENTS
    NUM_EVENTS = 20
    official_users = [u for u in USER if u["status_id"] == "402"]
    # Fallback in case probability yielded 0 officials
    if not official_users:
        official_users = USER
        
    for i in range(1, NUM_EVENTS + 1):
        eid = i
        organizer = random.choice(official_users)
        organizer_id = organizer["user_id"]
        status_id = random.choice([300, 301, 302])
        location_id = random.choice([l["id"] for l in LOCATION])
        event_category_id = random.choice([600, 601, 602, 603, 604, 605])
        
        event_date_dt = datetime.datetime.strptime(random_date(2026, 2027), "%Y-%m-%dT%H:%M:%S.000Z")
        event_date = event_date_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        review_date = None
        if status_id != "300":
            # review happens before event date
            review_dt = event_date_dt - datetime.timedelta(days=random.randint(10, 100))
            review_date = review_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        modality = random.choice(["In-Person", "Hybrid", "Virtual"])
        if event_category_id == "605":
            modality = "Virtual"
            
        start_hour = random.randint(8, 16)
        duration_hours = random.randint(1, 4)
        end_hour = start_hour + duration_hours
        
        # JS Temporal format (HH:MM:SS)
        start_time = f"{start_hour:02d}:00:00"
        end_time = f"{end_hour:02d}:00:00"
            
        EVENTS.append({
            "event_id": eid,
            "admin_id": random.choice(["admin1", "admin2", "admin3"]),
            "organizer_id": organizer_id,
            "status_id": status_id,
            "location_id": location_id,
            "event_category_id": event_category_id,
            "event_date": event_date,
            "review_date": review_date,
            "title": f"Awesome Event {i}",
            "description": f"Detailed description for event {i}.",
            "startTime": start_time,
            "endTime": end_time,
            "responses": random.randint(10, 100),
            "modality": modality,
            "event_image": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080"
        })
        
    return ADMIN, LOCATION, BULLETIN, EVENTS

# ----------------- PHASE 5: User Interactions & Activity -----------------

def generate_phase_5(USER, BULLETIN, EVENTS, USER_STATISTICS, USER_CONNECTIONS, USER_ACHIEVEMENT):
    COMMENTS = []
    DONATIONS = []
    USER_RSVP = []
    
    user_ids = [u["user_id"] for u in USER]
    
    # 1. COMMENTS
    NUM_COMMENTS = 100
    for i in range(1, NUM_COMMENTS + 1):
        author_id = random.choice(user_ids)
        bulletin = random.choice(BULLETIN)
        comment_date = random_date(2025, 2026) 
        
        COMMENTS.append({
            "comment_id": generate(size=10),
            "user_id": author_id,
            "bulletin_id": bulletin["bulletin_id"],
            "comment_date": comment_date,
            "comment": f"This is comment {i}",
            "likes": random.randint(0, 20)
        })
        
    # 2. DONATIONS
    NUM_DONATIONS = 50
    for i in range(1, NUM_DONATIONS + 1):
        uid = random.choice(user_ids)
        donation_amount = random.choice([500.0, 1000.0, 5000.0, 10000.0, 25000.0])
        status_id = random.choice([500, 501, 502]) # Processing, Completed, Failed
        DONATIONS.append({
            "donation_id": generate(size=10),
            "user_id": uid,
            "donation_status_id": status_id,
            "donation_date": random_date(2025, 2026),
            "donation_amount": donation_amount,
            "donation_amount_php": f"₱{donation_amount:,.2f}"
        })
        
    # 3. USER_RSVP
    for event in EVENTS:
        num_rsvps = random.randint(5, 15)
        attendees = random.sample(user_ids, num_rsvps)
        for uid in attendees:
            USER_RSVP.append({
                "rsvp_id": generate(size=10),
                "user_id": uid,
                "event_id": event["event_id"],
                "is_attending": random.choice([True, False])
            })
            
    # 4. Finalize USER_STATISTICS and dynamic interaction achievements
    for stat in USER_STATISTICS:
        uid = stat["user_id"]
        
        # Connections count (bilateral means we just look for matching user_id)
        stat["user_connections"] = sum(1 for c in USER_CONNECTIONS if c["user_id"] == uid)
        
        attended_count = sum(1 for r in USER_RSVP if r["user_id"] == uid and r["is_attending"])
        stat["events_attended"] = attended_count
        
        events_count = sum(1 for e in EVENTS if e["organizer_id"] == uid)
        stat["events_created"] = events_count

        bulletin_count = sum(1 for b in BULLETIN if b["author_id"] == uid)
        stat["bulletins_created"] = bulletin_count

        comment_count = sum(1 for c in COMMENTS if c["user_id"] == uid)
        stat["comments_written"] = comment_count
        
        total_donated = sum(d["donation_amount"] for d in DONATIONS if d["user_id"] == uid and d["donation_status_id"] == 501)
        stat["donated_amount"] = total_donated

        def award_achievement(ach_id, tier = 1):
            USER_ACHIEVEMENT.append({
                "user_achievement_id": generate(size=10),
                "user_id": uid,
                "achievement_id": ach_id,
                "achievement_tier": tier,
                "achieved_date": random_date(2026, 2026)
            })
        
        if total_donated > 20000:
            award_achievement("2", 3)
        elif total_donated > 5000:
            award_achievement("2", 2)
        elif total_donated > 0:
            award_achievement("2", 1)
                
        if attended_count >= 15:
            award_achievement("3", 3)
        elif attended_count >= 5:
            award_achievement("3", 2)
        elif attended_count >= 1:
            award_achievement("3", 1)
            
        if bulletin_count >= 5:
            award_achievement("4", 2)
        elif bulletin_count >= 1:
            award_achievement("4", 1)
            
        if comment_count >= 50:
            award_achievement("5", 2)
        elif comment_count >= 10:
            award_achievement("5", 1)
            
        stat["achievements"] = sum(1 for a in USER_ACHIEVEMENT if a["user_id"] == uid)
            
    return COMMENTS, DONATIONS, USER_RSVP

def main():
    USER, USER_AUTH, RECORDS, PROFILE, USER_STATISTICS = generate_phase_2()
    USER_CONNECTIONS, USER_ACHIEVEMENT = generate_phase_3(USER, USER_STATISTICS)
    ADMIN, LOCATION, BULLETIN, EVENTS = generate_phase_4(USER)
    COMMENTS, DONATIONS, USER_RSVP = generate_phase_5(USER, BULLETIN, EVENTS, USER_STATISTICS, USER_CONNECTIONS, USER_ACHIEVEMENT)

    db = {
        "DEGREE": DEGREE,
        "CONNECTION_STATUS": CONNECTION_STATUS,
        "CONTENT_STATUS": CONTENT_STATUS,
        "USER_STATUS": USER_STATUS,
        "DONATION_STATUS": DONATION_STATUS,
        "EVENT_CATEGORY": EVENT_CATEGORY,
        "ACHIEVEMENTS": ACHIEVEMENTS,
        "USER": USER,
        "USER_AUTH": USER_AUTH,
        "RECORDS": RECORDS,
        "PROFILE": PROFILE,
        "USER_STATISTICS": USER_STATISTICS,
        "USER_CONNECTIONS": USER_CONNECTIONS,
        "USER_ACHIEVEMENT": USER_ACHIEVEMENT,
        "ADMIN": ADMIN,
        "LOCATION": LOCATION,
        "BULLETIN": BULLETIN,
        "EVENTS": EVENTS,
        "COMMENTS": COMMENTS,
        "DONATIONS": DONATIONS,
        "USER_RSVP": USER_RSVP
    }

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4)
    print(f"Generated Phase 1-5 database at {output_path}")

if __name__ == "__main__":
    main()