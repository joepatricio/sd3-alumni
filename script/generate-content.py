# TODO: update content to reference author_id FK instead of hard-coded values
import os
import random
import argparse
from datetime import datetime, timedelta
import json
import re

# ---------------- CONFIG ----------------
DEFAULT_COUNT = 10

FILIPINO_FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Angela", "Mark", "Carla", "Paolo", "Andrea",
    "Miguel", "Sofia", "Daniel", "Rica", "John", "Anne", "Chris", "Bea"
]

FILIPINO_LAST_NAMES = [
    "Santos", "Reyes", "Cruz", "Garcia", "Torres", "Flores",
    "Mendoza", "Castro", "Ramos", "Aquino", "Bautista"
]

ROLES = ["Official", "Alumna", "Coordinator", "Tech Entrepreneur"]

BULLETIN_TOPICS = [
    "Scholarship Program Launch",
    "Alumni Startup Success",
    "Homecoming Highlights",
    "Mentorship Program",
    "Campus Updates",
    "Community Outreach",
    "Career Development Initiative"
]

EVENT_CATEGORIES = {
    "Reunion": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1080",
    "Workshop": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080",
    "Conference": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080",
    "Networking": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080",
    "Sports": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1080",
    "Virtual": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1080"
}

# ---------------- HELPERS ----------------
def random_name():
    return f"{random.choice(FILIPINO_FIRST_NAMES)} {random.choice(FILIPINO_LAST_NAMES)}"

def random_date():
    start = datetime(2026, 1, 1)
    end = datetime(2026, 6, 30)
    dt = start + timedelta(days=random.randint(0, (end - start).days))
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")

def random_time():
    hour = random.randint(7, 18)
    ampm = "AM" if hour < 12 else "PM"
    display = hour if 1 <= hour <= 12 else abs(hour - 12)
    return display, ampm

def generate_unique_title(existing, base):
    title = base
    counter = 1
    while title in existing:
        title = f"{base} {counter}"
        counter += 1
    existing.add(title)
    return title

def lorem(n=3):
    base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    return " ".join([base for _ in range(n)])

def random_status():
    return random.choice(["Pending", "Approved"])

# ---------------- BULLETINS ----------------
def generate_bulletins(n):
    bulletins = []
    used_titles = set()

    for i in range(1, n + 1):
        topic = random.choice(BULLETIN_TOPICS)
        title = generate_unique_title(used_titles, f"{topic}")

        bulletin = {
            "id": str(i),
            "title": title,
            "author": {
                "name": random_name(),
                "image": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1080",
                "role": random.choice(ROLES)
            },
            "date": random_date(),
            "readTime": f"{random.randint(2,6)} min read",
            "preview": lorem(1),
            "content": lorem(6),
            "heroImage": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1080",
            "isOfficial": random.choice([True, False]),
            "status": random_status()
        }

        bulletins.append(bulletin)

    return bulletins

# ---------------- EVENTS ----------------
def generate_events(n):
    events = []

    for i in range(1, n + 1):
        category = random.choice(list(EVENT_CATEGORIES.keys()))
        image = EVENT_CATEGORIES[category]

        start_h, start_ampm = random_time()
        end_h = min(start_h + random.randint(1, 4), 11)
        end_ampm = start_ampm

        event = {
            "id": str(i),
            "title": f"{category} Event {i}",
            "description": lorem(2),
            "date": random_date(),
            "time": f"{start_h}:00 {start_ampm} - {end_h}:00 {end_ampm}",
            "location": {
                "region": "Central Visayas",
                "regionCode": "070000000",
                "province": "Cebu",
                "provinceCode": "072200000",
                "cityMunicipality": "City of Cebu",
                "cityCode": "072217000",
                "barangay": "Sample Barangay",
                "landmark": "Sample Landmark",
                "street": "Sample Street",
                "lat": round(10.25 + random.random() * 0.1, 6),
                "lng": round(123.85 + random.random() * 0.1, 6),
            },
            "category": category,
            "image": image,
            "startTimeHour": str(start_h),
            "startTimeMinute": "00",
            "startTimeAmPm": start_ampm,
            "endTimeHour": str(end_h),
            "endTimeMinute": "00",
            "endTimeAmPm": end_ampm,
            "address": "Cebu City, Philippines",
            "organizer": {
                "name": f"{category} Committee",
                "contactName": random_name(),
                "email": f"{category.lower()}{i}@example.com",
                "phone": "(032) 123-4567",
                "website": "www.example.com",
                "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
            },
            "responses": {
                "going": random.randint(10, 500),
                "invited": random.randint(100, 1000)
            },
            "status": random_status()
        }

        if category == "Virtual":
            event["modality"] = random.choice(["Zoom", "Google Meet", "Microsoft Teams"])

        events.append(event)

    return events

# ---------------- EXPORT ----------------
def to_tsx(name, data):
    json_str = json.dumps(data, indent=4)
    # Programmatically inject preview getter
    json_str = re.sub(
        r'"preview":\s*".*?",',
        r'get preview() {\n            return generatePreview(this.content);\n        },',
        json_str
    )
    # Programmatically inject time getter
    json_str = re.sub(
        r'"time":\s*".*?",',
        r'get time() {\n            return generateTime(this);\n        },',
        json_str
    )
    return f"export const {name} = {json_str};\n\n"

# ---------------- MAIN ----------------
def main():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    default_output = os.path.join(script_dir, "generatedMockData.tsx")

    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT)
    parser.add_argument("--output", type=str, default=default_output)

    args = parser.parse_args()

    bulletins = generate_bulletins(args.count)
    events = generate_events(args.count)

    # Sort by date descending
    # events.sort(key=lambda x: x["date"], reverse=True)
    bulletins.sort(key=lambda x: x["date"], reverse=True)

    content = ""
    content += "export const generatePreview = (content: string) => {\n"
    content += "    return content.length > 100 ? content.substring(0, 100).trim() + '...' : content;\n"
    content += "};\n\n"
    content += "export const generateTime = (event: any) => {\n"
    content += "    const base = `${event.startTimeHour}:${event.startTimeMinute} ${event.startTimeAmPm} - ${event.endTimeHour}:${event.endTimeMinute} ${event.endTimeAmPm}`;\n"
    content += "    return event.id === '7' ? `${base} (PHT)` : base;\n"
    content += "};\n\n"
    
    content += to_tsx("bulletins", bulletins)
    content += to_tsx("events", events)


    with open(args.output, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ File generated: {args.output}")
    print(f"   Bulletins: {args.count}")
    print(f"   Events: {args.count}")

if __name__ == "__main__":
    main()