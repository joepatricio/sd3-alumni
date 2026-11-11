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
| `_include` | Comma-separated list (or `none`) | Relations to hydrate into response records; omit for endpoint list/detail defaults, or pass `none` for scalars only | `_include=profile,userStatus` || `_sort` | Field name | Field to sort results by | `_sort=createdAt` |
| `_order` | `asc` \| `desc` | Sort direction (default: `asc`) | `_order=desc` |
| `_page` | Integer | 1-based page number | `_page=1` |
| `_per_page` | Integer | Maximum items per page (triggers paginated response) | `_per_page=10` |

### Paginated vs Unpaginated Responses
- **Without pagination parameters**: Returns an array of records `[ { ... }, { ... } ]`.
- **With `_per_page` (or `_page`)**: Returns an envelope object `{ "items": <total_count>, "data": [ ... ] }`.

---

## Flat Query Filters & Aliases (`api/queryParser.js`)

In addition to `_where` JSON filters, any non-`_` query parameter is parsed as a filter (and combined with `_where` via `AND`):
- **Suffix operators**: `:in`, `:nin` / `:notIn` / `:not_in` (comma-separated values), `:gte`, `:gt`, `:lte`, `:lt`, `:ne` / `:not`, `:eq` / `:equals`, `:contains`, `:startsWith` / `:starts_with`, `:endsWith` / `:ends_with`.
- **Nested dot paths**: Flat keys support dot notation (e.g., `status.statusName:in=Approved,Flagged`, `profile.batch:gte=2020`), wrapped into Prisma `{ is: { ... } }` filters.
- **`_where` shorthand keys**: `or` → `OR`, `and` → `AND`, `eq` → `equals`, `ne` → `not`, `nin` → `notIn`.
- **Field & relation normalization**: `snake_case` keys convert to `camelCase`; model aliases map `user.userId` → `id`, `bulletin.profileId` → `authorId`, `comment.profileId` → `userId`, `contentStatus`/`eventStatus`/`donationStatus` → `status`, `bulletinCategory`/`eventCategory` → `category`, and `userRsvps` → `rsvps`.

## Output Normalization, Write Endpoints & Excluded Models
- **PK normalization**: `profile`, `userAuth`, and `userStatistic` use `userId` as their DB primary key; `formatOutput` copies `userId` to `id`.
- **Write endpoints**: `POST /api/:table` and `PATCH /api/:table/:id` strip unknown fields (`filterModelFields`) and hydrate detail `defaultIncludes`; `PUT /api/:table/:id` returns scalar columns only (no `include`).
- **Sanitization**: `passwordHash` is recursively stripped from all generic table responses.
- **Models not on `/api/:table`**: `Admin`, `NotificationType`, and `HeroGallery` are omitted from `tableToModel` (e.g., use `GET /api/hero/images` for hero gallery images).

## Model Relation Hydration Rules 

Generic endpoints resolve `_include` (or `_embed` / `_expand`) via `resolveQueryIncludes` in `api/index.js`:
- **Omitted `_include`**: List (`GET /api/:table`) uses slim defaults (`defaultListIncludes`), while single-item (`GET /api/:table/:id`, `POST`, `PATCH`) uses detail defaults (`defaultIncludes`).
- **`_include=none`**: Suppresses default includes and returns scalar columns only across any table endpoint.
- **Public profile sanitization (`publicProfileOmit`)**: Nested `author.profile` (bulletins/events), `comment.user.profile`, and `userConnection` `user`/`friend` `profile` omit `email`, `phone`, `birthday`, and `bio`.

| Model / Endpoint | Omitted `_include` (List `GET /api/:table`) | Omitted `_include` (Detail `GET /api/:table/:id`) | Explicit `_include` Support & Hydrated Structure |
|---|---|---|---|
| `/api/users` | `profile` (with `degree`), `userStatus`, `profileStatus` *(omits `records`)* | `profile` (with `degree`), `userStatus`, `profileStatus`, `records` (ordered `dateCreated` desc, with `userStatus` and `admin: { id, username }`) | `profile` (with `degree`), `userStatus`, `profileStatus`, `records`, `achievements` (with `achievement`; aliases: `user_achievement`, `userachievement`, `userachievements`) |
| `/api/bulletins` | `status` (mapped to `contentStatus`), `category` (mapped to `bulletinCategory`), `author` (`userStatus` + sanitized `profile`; also aliased to top-level `profile`) *(omits `comments`, `likes`, `admin`)* | Same as list (`status`, `category`, `author`) | `comments` (sanitized `user` + `likesList`), `likes`, `admin` (`{ id, username }`), `status` (`contentStatus`), `category` (`categories`, `bulletinCategory`), `author` |
| `/api/events` | `location`, `status` (mapped to `eventStatus`), `category` (mapped to `eventCategory`), `author` (`userStatus` + sanitized `profile`) *(omits `rsvps`, `admin`)* | Same as list + `rsvps` (mapped to `userRsvps`, each with `user` including `profile` + `degree`, `userStatus`, `profileStatus`) | `rsvps` (aliases: `userRsvps`, `userRsvp`; mapped to `userRsvps`), `location`, `status` (`eventStatus`), `category` (`eventCategory`), `author`, `admin` (`{ id, username }`) |
| `/api/userConnections` | `status` only | `status` only | `status`, `user`, `friend` (`user`/`friend` use sanitized `userSummaryInclude`: `profile` omitting `email`/`phone`/`birthday`/`bio` with `degree`) |
| `/api/comments` | Sanitized `user` (`profile` omitting `email`/`phone`/`birthday`/`bio`; also aliased to `profile`/`profileId`) + `likesList` *(omits `bulletin`)* | Same as list (`user`, `likesList`) | `user`, `bulletin`, `likesList` |
| `/api/userRsvps` | *(none — scalars only)* | `user` (with `profile` + `degree`, `userStatus`, `profileStatus`) | `user` (alias: `users`), `event` (alias: `events`) |
| `/api/profiles` | `degree` only | `degree` only | `degree`, `user` (`_include=none` omits all relations) |
| `/api/userAchievements` | `achievement` | `achievement` | `achievement` |
| `/api/donations` | `status` (mapped to `donationStatus`), `user` (`profile.userName` only) | Same as list | `status`, `user` |
| `/api/userAuths` | `user` (`profile` with `degree`, `userStatus`, `profileStatus`) | Same as list | `user` |
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