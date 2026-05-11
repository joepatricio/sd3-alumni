import json
import os
import random
import datetime
import sys
import shutil
from nanoid import generate

# Phase 1: Structural Foundation & Reference Tables

DEGREE = [
    {"degreeName": "Mechanical Engineering", "degreeAbbr": "BSME"},
    {"degreeName": "Civil Engineering", "degreeAbbr": "BSCE"},
    {"degreeName": "Industrial Engineering", "degreeAbbr": "BSIE"},
    {"degreeName": "Electrical Engineering", "degreeAbbr": "BSEE"},
    {"degreeName": "Electronics and Communications Engineering", "degreeAbbr": "BSECE"},
    {"degreeName": "Computer Engineering", "degreeAbbr": "BSCpE"}
]
for base in DEGREE:
    base["id"] = generate(size=10)

CONNECTION_STATUS = [
    {"connectionName": "Requesting"},
    {"connectionName": "Requested"},
    {"connectionName": "Accepted"},
    {"connectionName": "Blocking"},
    {"connectionName": "Blocked"}
]
for base in CONNECTION_STATUS:
    base["id"] = generate(size=10)

CONTENT_STATUS = [
    {"statusName": "Pending"},
    {"statusName": "Approved"},
    {"statusName": "Rejected"}
]
for base in CONTENT_STATUS:
    base["id"] = generate(size=10)

USER_STATUS = [
    {"statusName": "Pending"},
    {"statusName": "Regular"},
    {"statusName": "Official"},
    {"statusName": "Suspended"},
    {"statusName": "Banned"}
]
for base in USER_STATUS:
    base["id"] = generate(size=10)

DONATION_STATUS = [
    {"statusName": "Processing"},
    {"statusName": "Completed"},
    {"statusName": "Failed"}
]
for base in DONATION_STATUS:
    base["id"] = generate(size=10)

EVENT_CATEGORY = [
    {"eventCategoryName": "Reunion"},
    {"eventCategoryName": "Workshop"},
    {"eventCategoryName": "Conference"},
    {"eventCategoryName": "Networking"},
    {"eventCategoryName": "Sports"},
    {"eventCategoryName": "Virtual"}
]
for base in EVENT_CATEGORY:
    base["id"] = generate(size=10)

PROFILE_STATUS = [
    {"statusName": "Private"},
    {"statusName": "Connections Only"},
    {"statusName": "Public"}
]
for base in PROFILE_STATUS:
    base["id"] = generate(size=10)

ACHIEVEMENTS = [
    {"achievementCategory": 1, "achievementTier": 1, "achievementTitle": "1-Year Club", "achievementDescription": "Has been a member for 1 year.", "achievementIcon": "Star"},
    {"achievementCategory": 1, "achievementTier": 2, "achievementTitle": "3-Year Club", "achievementDescription": "Has been a member for 3 years.", "achievementIcon": "Sparkle"},
    {"achievementCategory": 1, "achievementTier": 3, "achievementTitle": "Prestige Alumni", "achievementDescription": "Has been a member for 10+ years.", "achievementIcon": "Sparkles"},
    {"achievementCategory": 2, "achievementTier": 1, "achievementTitle": "Philanthropist", "achievementDescription": "Donated to the alumni association. Thank you!", "achievementIcon": "Heart"},
    {"achievementCategory": 3, "achievementTier": 1, "achievementTitle": "Event Enthusiast I", "achievementDescription": "Attended 1 events.", "achievementIcon": "Calendar1"},    
    {"achievementCategory": 3, "achievementTier": 2, "achievementTitle": "Event Enthusiast II", "achievementDescription": "Attended 5 events.", "achievementIcon": "Calendar"},
    {"achievementCategory": 3, "achievementTier": 3, "achievementTitle": "Event Enthusiast III", "achievementDescription": "Attended 15 events.", "achievementIcon": "CalendarHeart"},
    {"achievementCategory": 4, "achievementTier": 1, "achievementTitle": "Conversation Starter I", "achievementDescription": "Created 1 bulletin.", "achievementIcon": "Newspaper"},
    {"achievementCategory": 4, "achievementTier": 2, "achievementTitle": "Conversation Starter II", "achievementDescription": "Created 5 bulletins.", "achievementIcon": "Newspaper"},
    {"achievementCategory": 5, "achievementTier": 1, "achievementTitle": "Contributor I", "achievementDescription": "Written 10 comments.", "achievementIcon": "MessageSquare"},
    {"achievementCategory": 5, "achievementTier": 2, "achievementTitle": "Contributor II", "achievementDescription": "Written 50 comments.", "achievementIcon": "MessageCircle"},
    {"achievementCategory": 10000, "achievementTier": 1, "achievementTitle": "READS Alumni", "achievementDescription": "Part of the Recoletos Educational Assistance for Deserving Students.", "achievementIcon": "BookOpen"},
    {"achievementCategory": 10001, "achievementTier": 1, "achievementTitle": "Verified", "achievementDescription": "User has been verified.", "achievementIcon": "Gear"}
]
for base in ACHIEVEMENTS:
    base["id"] = generate(size=10)

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
        user_status = random.choices(USER_STATUS, weights=[10, 70, 10, 5, 5])[0]
        status_id = user_status["id"]
        status_name = user_status["statusName"]
        
        record_id = generate(size=10)
        user_id = generate(size=10)
        
        USER.append({
            "id": user_id,
            "profileStatusId": random.choices([p["id"] for p in PROFILE_STATUS], weights=[20, 40, 40])[0],
            "userStatusId": status_id,
            "recordId": record_id
        })
        
        date_created = random_date()
        date_expires = None
        description = "User created or status updated"
        if status_name == "Suspended":
            expires_dt = datetime.datetime.now() + datetime.timedelta(days=30)
            date_expires = expires_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            description = "Suspended for terms violation"
        elif status_name == "Banned":
            description = "Banned permanently"

        RECORDS.append({
            "id": record_id,
            "userId": user_id,
            "adminId": random.choice(["admin1", "admin2", "admin3"]), # Placeholder admin
            "userStatusId": status_id,
            "dateCreated": date_created,
            "description": description,
            "dateExpires": date_expires
        })
        
        fn = random.choice(FILIPINO_FIRST_NAMES)
        ln = random.choice(FILIPINO_LAST_NAMES)
        email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
        
        USER_AUTH.append({
            "userId": user_id,
            "email": email,
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
            "lastLogin": random_date(2025, 2026)
        })
        
        job = random.choice(["Software Engineer", "Manager", "Analyst", "Consultant", "Director", "Student"])
        company = random.choice(COMPANIES)
        name = f"{fn} {ln}"
        
        degree_id = random.choice([d["id"] for d in DEGREE])
        birthday = random_date(1960, 2002)
        birth_year = int(birthday.split("-")[0])
        batch = random.randint(birth_year + 20, 2025)

        PROFILE.append({
            "userId": user_id,
            "userName": name,
            "bio": f"A proud alumnus of University of San Jose - Recoletos. Batch of {batch}.",
            "email": email,
            "phone": f"+63 917 123 {random.randint(1000, 9999)}",
            "location": random.choice(["Cebu City, Philippines", "Manila, Philippines", "Davao, Philippines", "Abroad"]),
            "currentJob": job,
            "company": company,
            "profileImage": "http://localhost:3000/profile-image.jpg",
            "degreeId": degree_id,
            "batch": batch,
            "birthday": birthday
        })
        
        USER_STATISTICS.append({
            "userId": user_id,
            "dateRegistered": date_created,
            "userConnections": 0,
            "eventsAttended": 0,
            "eventsCreated": 0,
            "bulletinsCreated": 0,
            "commentsWritten": 0,
            "achievements": 0,
            "donatedAmount": 0,
        })

    return USER, USER_AUTH, RECORDS, PROFILE, USER_STATISTICS

# ----------------- PHASE 3: User Relationships & Accolades -----------------

def get_connection_status_id(name):
    return next(s["id"] for s in CONNECTION_STATUS if s["connectionName"] == name)

def get_achievement_id(category, tier=1):
    return next(a["id"] for a in ACHIEVEMENTS if a["achievementCategory"] == category and a["achievementTier"] == tier)

def generate_phase_3(USER, USER_STATISTICS):
    USER_CONNECTIONS = []
    USER_ACHIEVEMENT = []
    
    # 1. Connections (Erdős-Rényi G(n, p) bidirectional graph)
    user_ids = [u["id"] for u in USER]
    p_connect = 0.12
    
    for i in range(len(user_ids)):
        for j in range(i + 1, len(user_ids)):
            if random.random() < p_connect:
                uid1 = user_ids[i]
                uid2 = user_ids[j]
                
                status_name_1 = random.choices(["Requesting", "Accepted", "Blocking"], weights=[10, 70, 20])[0]
                status_id_1 = get_connection_status_id(status_name_1)
                date_updated = random_date(2025, 2026)
                
                # Bilateral connection entries
                USER_CONNECTIONS.append({
                    "userId": uid1,
                    "friendId": uid2,
                    "connectionStatusId": status_id_1, 
                    "dateUpdated": date_updated
                })
                
                if status_name_1 == "Requesting":
                    status_name_2 = "Requested"
                elif status_name_1 == "Blocking":
                    status_name_2 = "Blocked"
                else:
                    status_name_2 = status_name_1
                    
                status_id_2 = get_connection_status_id(status_name_2)
                USER_CONNECTIONS.append({
                    "userId": uid2,
                    "friendId": uid1,
                    "connectionStatusId": status_id_2,
                    "dateUpdated": date_updated
                })

    # 2. Base Achievements
    today = datetime.datetime.now()
    
    for uid in user_ids:
        # Check 1-Year Club dynamically
        user_stats = next((s for s in USER_STATISTICS if s["userId"] == uid), None)
        if user_stats:
            date_registered_str = user_stats["dateRegistered"]
            date_registered = datetime.datetime.strptime(date_registered_str, "%Y-%m-%dT%H:%M:%S.000Z")
            one_year_later = date_registered + datetime.timedelta(days=365)
            three_year_later = date_registered + datetime.timedelta(days=365 * 3)
            ten_year_later = date_registered + datetime.timedelta(days=365 * 10)
            
            if today > ten_year_later:
                USER_ACHIEVEMENT.append({
                    "userId": uid,
                    "achievementId": get_achievement_id(1, 3),
                    "achievementTier": 3,
                    "achievedDate": ten_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
            elif today > three_year_later:
                USER_ACHIEVEMENT.append({
                    "userId": uid,
                    "achievementId": get_achievement_id(1, 2),
                    "achievementTier": 2,
                    "achievedDate": three_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
            elif today > one_year_later:
                USER_ACHIEVEMENT.append({
                    "userId": uid,
                    "achievementId": get_achievement_id(1, 1),
                    "achievementTier": 1,
                    "achievedDate": one_year_later.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                })
                
        # 5% chance to be READS Alumni
        if random.random() < 0.05:
            USER_ACHIEVEMENT.append({
                "userId": uid,
                "achievementId": get_achievement_id(10000, 1),
                "achievementTier": 1,
                "achievedDate": random_date(2025, 2026)
            })
            
        # Give Verified achievement if status is Official
        user_obj = next((u for u in USER if u["id"] == uid), None)
        if user_obj:
            status_name = next((s["statusName"] for s in USER_STATUS if s["id"] == user_obj["userStatusId"]), "")
            if status_name == "Official":
                USER_ACHIEVEMENT.append({
                    "userId": uid,
                    "achievementId": get_achievement_id(10001, 1),
                    "achievementTier": 1,
                    "achievedDate": random_date(2025, 2026)
                })
            
    return USER_CONNECTIONS, USER_ACHIEVEMENT

# ----------------- PHASE 4: Content Generation -----------------

def generate_phase_4(USER):
    ADMIN = []
    LOCATION = []
    BULLETIN = []
    EVENTS = []
    
    # 1. ADMIN
    ADMIN.append({
        "id": "admin1",
        "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "lastLogin": random_date(2025, 2026)
    })
    ADMIN.append({
        "id": "admin2",
        "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "lastLogin": random_date(2025, 2026)
    })
    ADMIN.append({
        "id": "admin3",
        "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y", 
        "lastLogin": random_date(2025, 2026)
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
        LOCATION.append({
            "id": generate(size=10),
            "regionCode": base["region_code"],
            "province": base["province"],
            "provinceCode": base["province_code"],
            "cityMunicipality": base["city_municipality"],
            "cityCode": base["city_code"],
            "barangay": base["barangay"],
            "landmark": base["landmark"],
            "street": base["street"],
            "lat": base["lat"],
            "lng": base["lng"]
        })
        
    # 3. BULLETIN
    NUM_BULLETINS = 30
    user_ids = [u["id"] for u in USER]
    for i in range(1, NUM_BULLETINS + 1):
        bid = generate(size=10)
        author_id = random.choice(user_ids)
        content_status = random.choice(CONTENT_STATUS)
        content_status_id = content_status["id"]
        
        bulletin_date_dt = datetime.datetime.strptime(random_date(2025, 2026), "%Y-%m-%dT%H:%M:%S.000Z")
        bulletin_date = bulletin_date_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        review_date = None
        if content_status["statusName"] != "Pending":
            # review happens after bulletin date
            review_dt = bulletin_date_dt + datetime.timedelta(days=random.randint(1, 30))
            review_date = review_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        BULLETIN.append({
            "id": bid,
            "adminId": random.choice(["admin1", "admin2", "admin3"]),
            "authorId": author_id,
            "contentStatusId": content_status_id,
            "bulletinDate": bulletin_date,
            "reviewDate": review_date,
            "title": f"Community Update {i}",
            "readTimeMinutes": random.randint(2, 10),
            "content": f"Lorem ipsum dolor sit amet. Content for bulletin {i}.",
            "bulletinImage": "http://localhost:3000/bulletin-image.jpg"
        })
        
    # 4. EVENTS
    NUM_EVENTS = 20
    official_users = [u for u in USER if next((s["statusName"] for s in USER_STATUS if s["id"] == u["userStatusId"]), "") == "Official"]
    if not official_users:
        official_users = USER
        
    for i in range(1, NUM_EVENTS + 1):
        eid = generate(size=10)
        organizer = random.choice(official_users)
        organizer_id = organizer["id"]
        status = random.choice(CONTENT_STATUS)
        status_id = status["id"]
        location_id = random.choice([l["id"] for l in LOCATION])
        event_category_id = random.choice([c["id"] for c in EVENT_CATEGORY])
        
        event_date_dt = datetime.datetime.strptime(random_date(2026, 2027), "%Y-%m-%dT%H:%M:%S.000Z")
        event_date = event_date_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        review_date = None
        if status["statusName"] != "Pending":
            # review happens before event date
            review_dt = event_date_dt - datetime.timedelta(days=random.randint(10, 100))
            review_date = review_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        
        modality = random.choice(["In-Person", "Hybrid", "Virtual"])
        if next((c["eventCategoryName"] for c in EVENT_CATEGORY if c["id"] == event_category_id), "") == "Virtual":
            modality = "Virtual"
            
        start_hour = random.randint(8, 16)
        duration_hours = random.randint(1, 4)
        end_hour = start_hour + duration_hours
        
        # JS Temporal format (HH:MM:SS)
        start_time = f"{start_hour:02d}:00:00"
        end_time = f"{end_hour:02d}:00:00"
            
        EVENTS.append({
            "id": eid,
            "adminId": random.choice(["admin1", "admin2", "admin3"]),
            "authorId": organizer_id,
            "statusId": status_id,
            "locationId": location_id,
            "eventCategoryId": event_category_id,
            "eventDate": event_date,
            "reviewDate": review_date,
            "title": f"Awesome Event {i}",
            "description": f"Detailed description for event {i}.",
            "startTime": start_time,
            "endTime": end_time,
            "responses": random.randint(10, 100),
            "modality": modality,
            "eventImage": "http://localhost:3000/events-image.jpg"
        })
        
    return ADMIN, LOCATION, BULLETIN, EVENTS

# ----------------- PHASE 5: User Interactions & Activity -----------------

def generate_phase_5(USER, BULLETIN, EVENTS, USER_STATISTICS, USER_CONNECTIONS, USER_ACHIEVEMENT):
    COMMENTS = []
    DONATIONS = []
    USER_RSVP = []
    
    user_ids = [u["id"] for u in USER]
    
    # 1. COMMENTS
    NUM_COMMENTS = 100
    for i in range(1, NUM_COMMENTS + 1):
        author_id = random.choice(user_ids)
        bulletin = random.choice(BULLETIN)
        comment_date = random_date(2025, 2026) 
        
        COMMENTS.append({
            "id": generate(size=10),
            "userId": author_id,
            "bulletinId": bulletin["id"],
            "commentDate": comment_date,
            "comment": f"This is comment {i}",
            "likes": random.randint(0, 20)
        })
        
    # 2. DONATIONS
    NUM_DONATIONS = 50
    for i in range(1, NUM_DONATIONS + 1):
        uid = random.choice(user_ids)
        donation_amount = random.choice([500.0, 1000.0, 5000.0, 10000.0, 25000.0])
        status = random.choice(DONATION_STATUS)
        status_id = status["id"]
        ALPHABET = "23456789BCDFGHJKLMNPQRSTVWXYZ"
        DONATIONS.append({
            "id": generate(size=10),
            "donationReference": f"DON-{generate(ALPHABET, size=3)}-{generate(ALPHABET, size=3)}",
            "userId": uid,
            "donationStatusId": status_id,
            "donationDate": random_date(2025, 2026),
            "donationAmount": donation_amount,
            "donationAmountPhp": f"₱{donation_amount:,.2f}",
            "donationAnonymous": random.choice([True, False]),
            "donationEmail": f"donor{i}@example.com"
        })
        
    # 3. USER_RSVP
    for event in EVENTS:
        num_rsvps = random.randint(5, 15)
        attendees = random.sample(user_ids, num_rsvps)
        for uid in attendees:
            USER_RSVP.append({
                "userId": uid,
                "eventId": event["id"],
                "isAttending": random.choice([True, False])
            })
            
    # 4. Finalize USER_STATISTICS and dynamic interaction achievements
    for stat in USER_STATISTICS:
        uid = stat["userId"]
        
        # Connections count (bilateral means we just look for matching userId)
        accepted_status_id = get_connection_status_id("Accepted")
        stat["userConnections"] = sum(1 for c in USER_CONNECTIONS if c["userId"] == uid and c["connectionStatusId"] == accepted_status_id)
        
        attended_count = sum(1 for r in USER_RSVP if r["userId"] == uid and r["isAttending"])
        stat["eventsAttended"] = attended_count
        
        events_count = sum(1 for e in EVENTS if e["authorId"] == uid)
        stat["eventsCreated"] = events_count

        bulletin_count = sum(1 for b in BULLETIN if b["authorId"] == uid)
        stat["bulletinsCreated"] = bulletin_count

        comment_count = sum(1 for c in COMMENTS if c["userId"] == uid)
        stat["commentsWritten"] = comment_count
        
        completed_status_id = next(s["id"] for s in DONATION_STATUS if s["statusName"] == "Completed")
        total_donated_public = sum(d["donationAmount"] for d in DONATIONS 
            if d["userId"] == uid and d["donationStatusId"] == completed_status_id)
        stat["donatedAmount"] = total_donated_public

        def award_achievement(cat_id, tier = 1):
            USER_ACHIEVEMENT.append({
                "userId": uid,
                "achievementId": get_achievement_id(cat_id, tier),
                "achievementTier": tier,
                "achievedDate": random_date(2026, 2026)
            })
        
        if total_donated_public > 0:
            award_achievement(2, 1)
                
        if attended_count >= 15:
            award_achievement(3, 3)
        elif attended_count >= 5:
            award_achievement(3, 2)
        elif attended_count >= 1:
            award_achievement(3, 1)
            
        if bulletin_count >= 5:
            award_achievement(4, 2)
        elif bulletin_count >= 1:
            award_achievement(4, 1)
            
        if comment_count >= 50:
            award_achievement(5, 2)
        elif comment_count >= 10:
            award_achievement(5, 1)
            
        stat["achievements"] = sum(1 for a in USER_ACHIEVEMENT if a["userId"] == uid)
            
    return COMMENTS, DONATIONS, USER_RSVP

def main():
    if "--empty" in sys.argv:
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db.json")
        empty_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db-empty.json")
        shutil.copy(empty_path, output_path)
        print(f"Generated empty database at {output_path}")
        return

    USER, USER_AUTH, RECORDS, PROFILE, USER_STATISTICS = generate_phase_2()
    USER_CONNECTIONS, USER_ACHIEVEMENT = generate_phase_3(USER, USER_STATISTICS)
    ADMIN, LOCATION, BULLETIN, EVENTS = generate_phase_4(USER)
    COMMENTS, DONATIONS, USER_RSVP = generate_phase_5(USER, BULLETIN, EVENTS, USER_STATISTICS, USER_CONNECTIONS, USER_ACHIEVEMENT)

    db = {
        "degrees": DEGREE,
        "connectionStatuses": CONNECTION_STATUS,
        "contentStatuses": CONTENT_STATUS,
        "userStatuses": USER_STATUS,
        "donationStatuses": DONATION_STATUS,
        "eventCategories": EVENT_CATEGORY,
        "profileStatuses": PROFILE_STATUS,
        "achievements": ACHIEVEMENTS,
        "users": USER,
        "userAuths": USER_AUTH,
        "records": RECORDS,
        "profiles": PROFILE,
        "userStatistics": USER_STATISTICS,
        "userConnections": USER_CONNECTIONS,
        "userAchievements": USER_ACHIEVEMENT,
        "admins": ADMIN,
        "locations": LOCATION,
        "bulletins": BULLETIN,
        "events": EVENTS,
        "comments": COMMENTS,
        "donations": DONATIONS,
        "userRsvps": USER_RSVP
    }

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "db.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4)
    print(f"Generated Phase 1-5 database at {output_path}")

if __name__ == "__main__":
    main()