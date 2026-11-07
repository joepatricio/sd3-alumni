# REST API Table Operations & Query Syntax

This document covers standard REST table CRUD operations handled by the project's dynamic query parser (`api/queryParser.js`).

- For general conventions, lookup validation, and verification protocols, see `.agents/api.md`.
- For specialized/custom endpoints (like auth), inspect `api/index.js`.

---

## Query Parameters Overview

Generic table endpoints (e.g., `GET /api/<entities>`) support the following query parameters:

| Parameter | Type / Format | Description | Example |
|---|---|---|---|
| `_where` | JSON String | Prisma-compatible where filter object | `_where={"achievementTier":{"gt":1}}` |
| `_include` | Comma-separated list | Relations to hydrate into response records | `_include=profile,userStatus` |
| `_sort` | Field name | Field to sort results by | `_sort=createdAt` |
| `_order` | `asc` \| `desc` | Sort direction (default: `asc`) | `_order=desc` |
| `_page` | Integer | 1-based page number | `_page=1` |
| `_per_page` | Integer | Maximum items per page (triggers paginated response) | `_per_page=10` |

### Paginated vs Unpaginated Responses
- **Without pagination parameters**: Returns an array of records `[ { ... }, { ... } ]`.
- **With `_per_page` (or `_page`)**: Returns an envelope object `{ "items": <total_count>, "data": [ ... ] }`.

---

## Model Relation Hydration Rules

When querying entities with `_include` (or omitting `_include` when default relationships exist), the API server hydrates nested relational trees:

| Model / Endpoint | Requested Relation (`_include`) | Hydrated Nested Structure |
|---|---|---|
| `/api/users` | `profile` | Includes `degree: true` (`user.profile.degree`) |
| `/api/users` | `userStatus` | Includes user status record (`user.userStatus`) |
| `/api/users` | *(default when omitted)* | `profile` (with `degree`), `userStatus`, `profileStatus`, `records` |
| `/api/bulletins` | `category`, `status`, `author` | Author includes `profile` and `userStatus` |
| `/api/events` | `location`, `category`, `status`, `author` | Author includes `profile` and `userStatus` |
| `/api/userConnections` | `user`, `friend` | Both include `profile` (with `degree`) |

---

## Filter by condition (Numeric Comparison)

**Query:** `GET /api/achievements?_where={"achievementTier":{"gt":1}}`

```json
[
  {
    "id": "Jcb1QpLpXX",
    "achievementCategory": 1,
    "achievementTier": 2,
    "achievementTitle": "3-Year Club",
    "achievementDescription": "Has been a member for 3 years.",
    "achievementIcon": "Sparkle"
  },
  {
    "id": "ur_T72923B",
    "achievementCategory": 1,
    "achievementTier": 3,
    "achievementTitle": "Prestige Alumni",
    "achievementDescription": "Has been a member for 10+ years.",
    "achievementIcon": "Sparkles"
  },
  {
    "id": "M-em4afVuL",
    "achievementCategory": 3,
    "achievementTier": 2,
    "achievementTitle": "Event Enthusiast II",
    "achievementDescription": "Attended 5 events.",
    "achievementIcon": "Calendar"
  },
  {
    "id": "y75Mwy9xw-",
    "achievementCategory": 3,
    "achievementTier": 3,
    "achievementTitle": "Event Enthusiast III",
    "achievementDescription": "Attended 15 events.",
    "achievementIcon": "CalendarHeart"
  },
  {
    "id": "Td2E-M9aiX",
    "achievementCategory": 4,
    "achievementTier": 2,
    "achievementTitle": "Conversation Starter II",
    "achievementDescription": "Created 5 bulletins.",
    "achievementIcon": "Landmark"
  },
  {
    "id": "jknuI0g9_Q",
    "achievementCategory": 5,
    "achievementTier": 2,
    "achievementTitle": "Contributor II",
    "achievementDescription": "Written 50 comments.",
    "achievementIcon": "MessagesSquare"
  }
]
```

---

## Sort by field (descending)

**Query:** `GET /api/achievements?_sort=achievementTier&_order=desc`

```json
[
  {
    "id": "ur_T72923B",
    "achievementCategory": 1,
    "achievementTier": 3,
    "achievementTitle": "Prestige Alumni",
    "achievementDescription": "Has been a member for 10+ years.",
    "achievementIcon": "Sparkles"
  },
  {
    "id": "y75Mwy9xw-",
    "achievementCategory": 3,
    "achievementTier": 3,
    "achievementTitle": "Event Enthusiast III",
    "achievementDescription": "Attended 15 events.",
    "achievementIcon": "CalendarHeart"
  },
  {
    "id": "Jcb1QpLpXX",
    "achievementCategory": 1,
    "achievementTier": 2,
    "achievementTitle": "3-Year Club",
    "achievementDescription": "Has been a member for 3 years.",
    "achievementIcon": "Sparkle"
  }
]
```

---

## Pagination

**Query:** `GET /api/achievements?_page=1&_per_page=2`

```json
{
  "items": 15,
  "data": [
    {
      "id": "18f9g4z3qA",
      "achievementCategory": 1,
      "achievementTier": 1,
      "achievementTitle": "Fresh Face",
      "achievementDescription": "Joined the alumni network.",
      "achievementIcon": "Sparkles"
    },
    {
      "id": "Jcb1QpLpXX",
      "achievementCategory": 1,
      "achievementTier": 2,
      "achievementTitle": "3-Year Club",
      "achievementDescription": "Has been a member for 3 years.",
      "achievementIcon": "Sparkle"
    }
  ]
}
```

---

## Include relations

**Query:** `GET /api/users?_include=profile,userStatus&_per_page=1`

```json
{
  "items": 49,
  "data": [
    {
      "id": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
      "userStatusId": "OWOyGJzHfV",
      "currentRecordId": "d8414be9-b24f-4696-bccc-00657fd17be8",
      "profileStatusId": "kvf-XCOljU",
      "profile": {
        "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
        "userName": "John Smith",
        "gender": "Male",
        "bio": "Let sleeping gods lie...",
        "email": "smith@pym.org",
        "phone": "09129876543",
        "location": "Minglanilla, Cebu",
        "currentJob": "CEO",
        "company": "PymTech",
        "profileImage": "/uploads/upload-695c7d6d-4f1c-4481-9941-c3703ceab81a.jpg",
        "degreeId": "AUG-4vBe6k",
        "batch": 1999,
        "birthday": "1979-05-05T00:00:00.000Z",
        "degree": {
          "id": "AUG-4vBe6k",
          "degreeName": "Electrical Engineering",
          "degreeAbbr": "BSEE"
        }
      },
      "userStatus": {
        "id": "OWOyGJzHfV",
        "statusName": "Official"
      }
    }
  ]
}
```

---

## Complex queries (Combining filters, relations, pagination, and sorting)

**Query:** `GET /api/users?_where={"profile":{"batch":{"gte":2020}}}&_include=profile,userStatus&_page=1&_per_page=1&_sort=createdAt&_order=desc`

```json
{
  "items": 3,
  "data": [
    {
      "id": "5GJpEZBQ_4",
      "userStatusId": "2Ue2cfwVMa",
      "currentRecordId": "21QC2BBEF1",
      "profileStatusId": "kvf-XCOljU",
      "profile": {
        "userId": "5GJpEZBQ_4",
        "userName": "John Ramos",
        "gender": "Male",
        "bio": "A proud alumnus of University of San Jose - Recoletos. Batch of 2020.",
        "email": "john.ramos40@example.com",
        "phone": "+63 917 123 5236",
        "location": "Cebu City, Philippines",
        "currentJob": "Student",
        "company": "Scam Inc.",
        "profileImage": "/uploads/profile-image.jpg",
        "degreeId": "hd2F5ini8q",
        "batch": 2020,
        "birthday": "1974-08-24T23:22:37.000Z",
        "degree": {
          "id": "hd2F5ini8q",
          "degreeName": "Computer Engineering",
          "degreeAbbr": "BSCpE"
        }
      },
      "userStatus": {
        "id": "2Ue2cfwVMa",
        "statusName": "Regular"
      }
    }
  ]
}
```

---

## Filter exact

**Query:** `GET /api/achievements?_where={"achievementTier":1}`

```json
[
  {
    "id": "18f9g4z3qA",
    "achievementCategory": 1,
    "achievementTier": 1,
    "achievementTitle": "Fresh Face",
    "achievementDescription": "Joined the alumni network.",
    "achievementIcon": "Sparkles"
  },
  {
    "id": "eZfN63J397",
    "achievementCategory": 2,
    "achievementTier": 1,
    "achievementTitle": "Profile Pioneer",
    "achievementDescription": "Completed your profile.",
    "achievementIcon": "UserCheck"
  }
]
```

---

## Filter in

**Query:** `GET /api/achievements?_where={"achievementTier":{"in":[2,3]}}`

```json
[
  {
    "id": "Jcb1QpLpXX",
    "achievementCategory": 1,
    "achievementTier": 2,
    "achievementTitle": "3-Year Club",
    "achievementDescription": "Has been a member for 3 years.",
    "achievementIcon": "Sparkle"
  },
  {
    "id": "ur_T72923B",
    "achievementCategory": 1,
    "achievementTier": 3,
    "achievementTitle": "Prestige Alumni",
    "achievementDescription": "Has been a member for 10+ years.",
    "achievementIcon": "Sparkles"
  }
]
```

---

## Filter contains (Substring matching)

**Query:** `GET /api/achievements?_where={"achievementTitle":{"contains":"Club"}}`

```json
[
  {
    "id": "Jcb1QpLpXX",
    "achievementCategory": 1,
    "achievementTier": 2,
    "achievementTitle": "3-Year Club",
    "achievementDescription": "Has been a member for 3 years.",
    "achievementIcon": "Sparkle"
  }
]
```

---

## Filter startsWith

**Query:** `GET /api/achievements?_where={"achievementTitle":{"startsWith":"Event"}}`

```json
[
  {
    "id": "oYgQ7x6u15",
    "achievementCategory": 3,
    "achievementTier": 1,
    "achievementTitle": "Event Enthusiast I",
    "achievementDescription": "Attended 1 event.",
    "achievementIcon": "Calendar"
  },
  {
    "id": "M-em4afVuL",
    "achievementCategory": 3,
    "achievementTier": 2,
    "achievementTitle": "Event Enthusiast II",
    "achievementDescription": "Attended 5 events.",
    "achievementIcon": "Calendar"
  },
  {
    "id": "y75Mwy9xw-",
    "achievementCategory": 3,
    "achievementTier": 3,
    "achievementTitle": "Event Enthusiast III",
    "achievementDescription": "Attended 15 events.",
    "achievementIcon": "CalendarHeart"
  }
]
```

---

## Filter endsWith

**Query:** `GET /api/achievements?_where={"achievementTitle":{"endsWith":"III"}}`

```json
[
  {
    "id": "y75Mwy9xw-",
    "achievementCategory": 3,
    "achievementTier": 3,
    "achievementTitle": "Event Enthusiast III",
    "achievementDescription": "Attended 15 events.",
    "achievementIcon": "CalendarHeart"
  },
  {
    "id": "Yw8v_4oHlZ",
    "achievementCategory": 4,
    "achievementTier": 3,
    "achievementTitle": "Conversation Starter III",
    "achievementDescription": "Created 15 bulletins.",
    "achievementIcon": "Landmark"
  },
  {
    "id": "b-6e-E45Xg",
    "achievementCategory": 5,
    "achievementTier": 3,
    "achievementTitle": "Contributor III",
    "achievementDescription": "Written 150 comments.",
    "achievementIcon": "MessagesSquare"
  }
]
```

---

## Filter by relation negation (notIn)

**Query:** `GET /api/users?_where={"userStatus":{"statusName":{"notIn":["Banned","Deactivated","Pending"]}}}&_include=profile,userStatus&_per_page=1`

```json
{
  "items": 48,
  "data": [
    {
      "id": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
      "userStatusId": "OWOyGJzHfV",
      "currentRecordId": "d8414be9-b24f-4696-bccc-00657fd17be8",
      "profileStatusId": "kvf-XCOljU",
      "profile": {
        "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
        "userName": "John Smith",
        "gender": "Male",
        "bio": "Let sleeping gods lie...",
        "email": "smith@pym.org",
        "phone": "09129876543",
        "location": "Minglanilla, Cebu",
        "currentJob": "CEO",
        "company": "PymTech",
        "profileImage": "/uploads/upload-695c7d6d-4f1c-4481-9941-c3703ceab81a.jpg",
        "degreeId": "AUG-4vBe6k",
        "batch": 1999,
        "birthday": "1979-05-05T00:00:00.000Z",
        "degree": {
          "id": "AUG-4vBe6k",
          "degreeName": "Electrical Engineering",
          "degreeAbbr": "BSEE"
        }
      },
      "userStatus": {
        "id": "OWOyGJzHfV",
        "statusName": "Official"
      }
    }
  ]
}
```

---

## Filter by nested relation property

**Query:** `GET /api/users?_where={"profile":{"degree":{"degreeAbbr":"BSCpE"}}}&_include=profile,userStatus&_per_page=1`

```json
{
  "items": 10,
  "data": [
    {
      "id": "5GJpEZBQ_4",
      "userStatusId": "2Ue2cfwVMa",
      "currentRecordId": "21QC2BBEF1",
      "profileStatusId": "kvf-XCOljU",
      "profile": {
        "userId": "5GJpEZBQ_4",
        "userName": "John Ramos",
        "gender": "Male",
        "bio": "A proud alumnus of University of San Jose - Recoletos. Batch of 2020.",
        "email": "john.ramos40@example.com",
        "phone": "+63 917 123 5236",
        "location": "Cebu City, Philippines",
        "currentJob": "Student",
        "company": "Scam Inc.",
        "profileImage": "/uploads/profile-image.jpg",
        "degreeId": "hd2F5ini8q",
        "batch": 2020,
        "birthday": "1974-08-24T23:22:37.000Z",
        "degree": {
          "id": "hd2F5ini8q",
          "degreeName": "Computer Engineering",
          "degreeAbbr": "BSCpE"
        }
      },
      "userStatus": {
        "id": "2Ue2cfwVMa",
        "statusName": "Regular"
      }
    }
  ]
}
```