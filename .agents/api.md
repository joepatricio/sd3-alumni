# REST API Proper Usage

- **Primary Reference**
  - Always consult `.agents/api.md` before implementing, modifying, debugging, or integrating with the project's REST API.
  - Treat `.agents/api.md` as the primary reference for API conventions, endpoints, request and response structures, authentication, validation, error handling, and other documented behaviors.
  - Do not assume undocumented API behavior.

- **Verification Protocol (HTTP-First Testing & Code Introspection)**
  - **Runtime & Contract Verification**: When verifying or testing API endpoints, response shapes, and query syntax, always execute HTTP requests against the live running API server (e.g., using `curl.exe` or lightweight HTTP test scripts).
  - **No Direct Database Probing**: Do not bypass the REST layer to query data directly via SQLite drivers (`better-sqlite3`, raw `.db` files). Raw database queries bypass middleware, authentication, relational hydration, default projections, and JSON serialization, producing misleading representations of what the API actually serves.
  - **Code Introspection Permitted**: Agents are fully permitted and encouraged to read backend source code (e.g., `api/index.js`, `api/queryParser.js`, `prisma/schema.prisma`) to trace route logic, schemas, and parser rules. Code examination must serve understanding and implementation, while behavioral verification remains over HTTP.

- **Relational Inclusion Conventions (`_include`)**
  - When specifying `_include` fields, the API automatically hydrates nested defaults for core domain models (e.g., including `profile` on `/api/users` automatically includes `profile.degree`). Refer to the **Model Relation Hydration Rules** section below for specific defaults.

- **Canonical Lookup & Status Verification**
  - **No Inferred Statuses**: Never assume, extrapolate, or invent status names, category values, or enum-like literals (e.g., `userStatus`, `contentStatus`, `profileStatus`, `eventStatus`) from UI strings, variable names, or legacy code comments.
  - **Ground Truth for Lookups**: Statuses and category names are relational database entities. When constructing queries with relational filters (such as `_where={"userStatus":{"statusName":{"notIn":[...]}}}`), agents must verify exact values against the live lookup endpoints (e.g., `GET /api/userStatuses`, `GET /api/contentStatuses`)
  - **Strict Filter Fidelity**: When the operator or specification supplies an explicit set of filter conditions (e.g., `"Not Banned, Deactivated, or Pending"`), agents must restrict their query payloads strictly to those specified values without embellishing or re-introducing deprecated/stale statuses found elsewhere in legacy code.
  - **Differentiating Active Contracts from Legacy Residue**: If an identifier or status string appears in frontend/backend code (e.g., `disabledUsers`) but is absent from the database lookup table or Prisma schema, treat it as obsolete legacy code—do not propagate it to API requests, query parameters, or documentation.

- **Documentation Synchronization**
  - Whenever an implementation changes the REST API's behavior, `.agents/api.md` must be updated to reflect the changes. Coordinate these changes with your operator.
  - Ensure documentation accurately describes the implemented API, including affected endpoints, request parameters, response structures, status codes, and error handling.
  - Do not consider API-related implementation work complete until the corresponding documentation has been reviewed and updated.

- **Discrepancy Reporting**
  - Compare the documented API behavior against the actual implementation whenever working on relevant API functionality.
  - Report any inconsistencies between `.agents/api.md` and the implemented REST API.
  - Clearly identify:
    1. The affected endpoint or functionality.
    2. The documented behavior.
    3. The observed implementation behavior.
    4. The potential implications of the discrepancy.
  - Do not independently decide whether the implementation or documentation should take precedence when they conflict.
  - Require the operator to make an explicit judgement call on how the discrepancy should be resolved.
  - Do not silently modify documentation to legitimize unexpected implementation behavior, or modify implementation to match potentially outdated documentation, without operator direction.

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

## Filter by condition
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

## Sort by field (descending)

**Query:** `GET /api/achievements?_sort=-achievementTier`

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
  },
  {
    "id": "CQG0tXGlRI",
    "achievementCategory": 1,
    "achievementTier": 1,
    "achievementTitle": "1-Year Club",
    "achievementDescription": "Has been a member for 1 year.",
    "achievementIcon": "Star"
  },
  {
    "id": "W76JeqatUg",
    "achievementCategory": 2,
    "achievementTier": 1,
    "achievementTitle": "Philanthropist",
    "achievementDescription": "Donated to the alumni association. Thank you!",
    "achievementIcon": "Heart"
  },
  {
    "id": "i2jLLJDQCq",
    "achievementCategory": 3,
    "achievementTier": 1,
    "achievementTitle": "Event Enthusiast I",
    "achievementDescription": "Attended 1 events.",
    "achievementIcon": "Calendar1"
  },
  {
    "id": "Uoppeah8Gv",
    "achievementCategory": 4,
    "achievementTier": 1,
    "achievementTitle": "Conversation Starter I",
    "achievementDescription": "Created 1 bulletin.",
    "achievementIcon": "Newspaper"
  },
  {
    "id": "ilKdX_jrfT",
    "achievementCategory": 5,
    "achievementTier": 1,
    "achievementTitle": "Contributor I",
    "achievementDescription": "Written 10 comments.",
    "achievementIcon": "MessageSquare"
  },
  {
    "id": "4KmaAoCnzy",
    "achievementCategory": 10000,
    "achievementTier": 1,
    "achievementTitle": "READS Alumni",
    "achievementDescription": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievementIcon": "BookOpen"
  },
  {
    "id": "8Y9aHvzWQn",
    "achievementCategory": 10001,
    "achievementTier": 1,
    "achievementTitle": "Verified",
    "achievementDescription": "User has been verified.",
    "achievementIcon": "Gear"
  }
]
```

## Pagination

**Query:** `GET /api/users?_page=1&_per_page=3`

```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 18,
  "pages": 18,
  "items": 54,
  "data": [
    {
      "id": "-ubG0Zuwrq",
      "userStatusId": "EF1O2nZJby",
      "currentRecordId": "h_1AcvVOPN",
      "profileStatusId": "rMENIn-dWG",
      "profile": {
        "userId": "-ubG0Zuwrq",
        "userName": "Carla Reyes",
        "gender": "Female",
        "bio": "A proud alumnus of University of San Jose - Recoletos. Batch of 2022.",
        "email": "carla.reyes31@example.com",
        "phone": "+63 917 123 8884",
        "location": "Davao, Philippines",
        "currentJob": "Director",
        "company": "Global Systems",
        "profileImage": "/uploads/profile-image.jpg",
        "degreeId": "AUG-4vBe6k",
        "batch": 2022,
        "birthday": "1990-03-23T07:02:20.000Z",
        "degree": {
          "id": "AUG-4vBe6k",
          "degreeName": "Electrical Engineering",
          "degreeAbbr": "BSEE"
        }
      },
      "userStatus": {
        "id": "EF1O2nZJby",
        "statusName": "Deactivated"
      },
      "profileStatus": {
        "id": "rMENIn-dWG",
        "statusName": "Connections Only"
      },
      "records": [
        {
          "id": "h_1AcvVOPN",
          "userId": "-ubG0Zuwrq",
          "adminId": "ed686ab2-5942-4155-a03c-aa398b0c20aa",
          "userStatusId": "EF1O2nZJby",
          "dateCreated": "2020-11-07T14:09:09.000Z",
          "description": "User created or status updated",
          "dateExpires": null,
          "userStatus": {
            "id": "EF1O2nZJby",
            "statusName": "Deactivated"
          },
          "admin": {
            "id": "ed686ab2-5942-4155-a03c-aa398b0c20aa",
            "username": "admin2",
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y",
            "lastLogin": "2025-06-26T18:03:37.000Z"
          }
        }
      ]
    },
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
      },
      "profileStatus": {
        "id": "kvf-XCOljU",
        "statusName": "Public"
      },
      "records": [
        {
          "id": "d8414be9-b24f-4696-bccc-00657fd17be8",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "adminId": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
          "userStatusId": "OWOyGJzHfV",
          "dateCreated": "2026-10-16T09:23:50.460Z",
          "description": "IEEE President",
          "dateExpires": null,
          "userStatus": {
            "id": "OWOyGJzHfV",
            "statusName": "Official"
          },
          "admin": {
            "id": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
            "username": "admin1",
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y",
            "lastLogin": "2026-10-28T05:57:04.777Z"
          }
        },
        {
          "id": "5688b923-a90b-47cf-bb07-28699d2188c7",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "adminId": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
          "userStatusId": "rc_N8oPtdV",
          "dateCreated": "2026-10-16T09:23:07.225Z",
          "description": "IEEE President",
          "dateExpires": "3026-10-16T00:00:00.000Z",
          "userStatus": {
            "id": "rc_N8oPtdV",
            "statusName": "Suspended"
          },
          "admin": {
            "id": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
            "username": "admin1",
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y",
            "lastLogin": "2026-10-28T05:57:04.777Z"
          }
        },
        {
          "id": "01a7c99f-9f91-4e7e-a20e-50e62d8e251a",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "adminId": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
          "userStatusId": "OWOyGJzHfV",
          "dateCreated": "2026-10-16T02:08:12.096Z",
          "description": "IEEE President",
          "dateExpires": null,
          "userStatus": {
            "id": "OWOyGJzHfV",
            "statusName": "Official"
          },
          "admin": {
            "id": "a7e3e949-a38c-4ce8-bced-30f612baf0ac",
            "username": "admin1",
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y",
            "lastLogin": "2026-10-28T05:57:04.777Z"
          }
        },
        {
          "id": "29c9bbdc-fa4b-4dc8-a80c-7bddada67376",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "adminId": null,
          "userStatusId": "vHzoD5i9CD",
          "dateCreated": "2026-10-16T02:01:21.691Z",
          "description": "User registered",
          "dateExpires": null,
          "userStatus": {
            "id": "vHzoD5i9CD",
            "statusName": "Pending"
          },
          "admin": null
        }
      ]
    },
    {
      "id": "0zruCE1C1L",
      "userStatusId": "2Ue2cfwVMa",
      "currentRecordId": "k4VxgF1KUC",
      "profileStatusId": "rMENIn-dWG",
      "profile": {
        "userId": "0zruCE1C1L",
        "userName": "Mark Flores",
        "gender": "Female",
        "bio": "A proud alumnus of University of San Jose - Recoletos. Batch of 1985.",
        "email": "mark.flores18@example.com",
        "phone": "+63 917 123 9101",
        "location": "Abroad",
        "currentJob": "Software Engineer",
        "company": "Tech Solutions Inc.",
        "profileImage": "/uploads/profile-image.jpg",
        "degreeId": "hAoJF3hX0R",
        "batch": 1985,
        "birthday": "1963-08-18T23:59:24.000Z",
        "degree": {
          "id": "hAoJF3hX0R",
          "degreeName": "Industrial Engineering",
          "degreeAbbr": "BSIE"
        }
      },
      "userStatus": {
        "id": "2Ue2cfwVMa",
        "statusName": "Regular"
      },
      "profileStatus": {
        "id": "rMENIn-dWG",
        "statusName": "Connections Only"
      },
      "records": [
        {
          "id": "k4VxgF1KUC",
          "userId": "0zruCE1C1L",
          "adminId": "271c14e9-5239-490b-bdff-c166a3967310",
          "userStatusId": "2Ue2cfwVMa",
          "dateCreated": "2025-10-30T06:58:12.000Z",
          "description": "User created or status updated",
          "dateExpires": null,
          "userStatus": {
            "id": "2Ue2cfwVMa",
            "statusName": "Regular"
          },
          "admin": {
            "id": "271c14e9-5239-490b-bdff-c166a3967310",
            "username": "admin3",
            "passwordHash": "$2a$10$RF01DLY3wzkMTDihPwqMZuOu9dqipFZokMMf14UutW2Zk9IauaJ4y",
            "lastLogin": "2025-02-03T06:13:56.000Z"
          }
        }
      ]
    }
  ]
}
```

## Include relations

**Query:** `GET /api/users?_include=achievements&_page=1&_per_page=2`

```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 27,
  "pages": 27,
  "items": 54,
  "data": [
    {
      "id": "-ubG0Zuwrq",
      "userStatusId": "EF1O2nZJby",
      "currentRecordId": "h_1AcvVOPN",
      "profileStatusId": "rMENIn-dWG",
      "achievements": [
        {
          "id": "1ef1703b-71e1-4a2d-bebe-fea75ca19613",
          "userId": "-ubG0Zuwrq",
          "achievementId": "Jcb1QpLpXX",
          "achievementTier": 2,
          "achievedDate": "2023-11-07T14:09:09.000Z"
        }
      ]
    },
    {
      "id": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
      "userStatusId": "OWOyGJzHfV",
      "currentRecordId": "d8414be9-b24f-4696-bccc-00657fd17be8",
      "profileStatusId": "kvf-XCOljU",
      "achievements": [
        {
          "id": "bb5f5b2e-98b4-4c63-ae1e-b40dd743e9f6",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "achievementId": "8Y9aHvzWQn",
          "achievementTier": 1,
          "achievedDate": "2026-10-16T09:23:50.464Z"
        },
        {
          "id": "927065c7-3965-436e-a0c4-52ce8baf1f60",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "achievementId": "Uoppeah8Gv",
          "achievementTier": 1,
          "achievedDate": "2026-10-16T09:31:02.333Z"
        },
        {
          "id": "cba41e98-8fac-4de8-a640-134872062b9c",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "achievementId": "W76JeqatUg",
          "achievementTier": 1,
          "achievedDate": "2026-10-16T09:28:03.767Z"
        },
        {
          "id": "303d42f3-f192-45f0-8e02-ff3cfcb394ce",
          "userId": "06f07654-fc6a-41e1-89b2-5bfa3cf55c08",
          "achievementId": "i2jLLJDQCq",
          "achievementTier": 1,
          "achievedDate": "2026-10-16T09:34:37.969Z"
        }
      ]
    }
  ]
}
```

## Complex queries

**Query:** `GET /api/achievements?_where={"or":[{"achievementTier":{"gt":2}},{"id":{"lt":"3"}}]}`

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
  }
]
```

## Filter exact

**Query:** `GET /api/achievements?achievementTier=1`

```json
[
  {
    "id": "CQG0tXGlRI",
    "achievementCategory": 1,
    "achievementTier": 1,
    "achievementTitle": "1-Year Club",
    "achievementDescription": "Has been a member for 1 year.",
    "achievementIcon": "Star"
  },
  {
    "id": "W76JeqatUg",
    "achievementCategory": 2,
    "achievementTier": 1,
    "achievementTitle": "Philanthropist",
    "achievementDescription": "Donated to the alumni association. Thank you!",
    "achievementIcon": "Heart"
  },
  {
    "id": "i2jLLJDQCq",
    "achievementCategory": 3,
    "achievementTier": 1,
    "achievementTitle": "Event Enthusiast I",
    "achievementDescription": "Attended 1 events.",
    "achievementIcon": "Calendar1"
  },
  {
    "id": "Uoppeah8Gv",
    "achievementCategory": 4,
    "achievementTier": 1,
    "achievementTitle": "Conversation Starter I",
    "achievementDescription": "Created 1 bulletin.",
    "achievementIcon": "Newspaper"
  },
  {
    "id": "ilKdX_jrfT",
    "achievementCategory": 5,
    "achievementTier": 1,
    "achievementTitle": "Contributor I",
    "achievementDescription": "Written 10 comments.",
    "achievementIcon": "MessageSquare"
  },
  {
    "id": "4KmaAoCnzy",
    "achievementCategory": 10000,
    "achievementTier": 1,
    "achievementTitle": "READS Alumni",
    "achievementDescription": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievementIcon": "BookOpen"
  },
  {
    "id": "8Y9aHvzWQn",
    "achievementCategory": 10001,
    "achievementTier": 1,
    "achievementTitle": "Verified",
    "achievementDescription": "User has been verified.",
    "achievementIcon": "Gear"
  }
]
```

## Filter in

**Query:** `GET /api/achievements?achievementTier:in=1,3`

```json
[
  {
    "id": "CQG0tXGlRI",
    "achievementCategory": 1,
    "achievementTier": 1,
    "achievementTitle": "1-Year Club",
    "achievementDescription": "Has been a member for 1 year.",
    "achievementIcon": "Star"
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
    "id": "W76JeqatUg",
    "achievementCategory": 2,
    "achievementTier": 1,
    "achievementTitle": "Philanthropist",
    "achievementDescription": "Donated to the alumni association. Thank you!",
    "achievementIcon": "Heart"
  },
  {
    "id": "i2jLLJDQCq",
    "achievementCategory": 3,
    "achievementTier": 1,
    "achievementTitle": "Event Enthusiast I",
    "achievementDescription": "Attended 1 events.",
    "achievementIcon": "Calendar1"
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
    "id": "Uoppeah8Gv",
    "achievementCategory": 4,
    "achievementTier": 1,
    "achievementTitle": "Conversation Starter I",
    "achievementDescription": "Created 1 bulletin.",
    "achievementIcon": "Newspaper"
  },
  {
    "id": "ilKdX_jrfT",
    "achievementCategory": 5,
    "achievementTier": 1,
    "achievementTitle": "Contributor I",
    "achievementDescription": "Written 10 comments.",
    "achievementIcon": "MessageSquare"
  },
  {
    "id": "4KmaAoCnzy",
    "achievementCategory": 10000,
    "achievementTier": 1,
    "achievementTitle": "READS Alumni",
    "achievementDescription": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievementIcon": "BookOpen"
  },
  {
    "id": "8Y9aHvzWQn",
    "achievementCategory": 10001,
    "achievementTier": 1,
    "achievementTitle": "Verified",
    "achievementDescription": "User has been verified.",
    "achievementIcon": "Gear"
  }
]
```

## Filter contains

**Query:** `GET /api/achievements?_where={"achievementTitle":{"contains":"Club"}}`

```json
[
  {
    "id": "CQG0tXGlRI",
    "achievementCategory": 1,
    "achievementTier": 1,
    "achievementTitle": "1-Year Club",
    "achievementDescription": "Has been a member for 1 year.",
    "achievementIcon": "Star"
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

## Filter startsWith

**Query:** `GET /api/achievements?_where={"achievementTitle":{"startsWith":"Philanthropist"}}`

```json
[
  {
    "id": "W76JeqatUg",
    "achievementCategory": 2,
    "achievementTier": 1,
    "achievementTitle": "Philanthropist",
    "achievementDescription": "Donated to the alumni association. Thank you!",
    "achievementIcon": "Heart"
  }
]
```

## Filter endsWith

**Query:** `GET /api/achievements?_where={"achievementTitle":{"endsWith":"I"}}`

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
    "id": "i2jLLJDQCq",
    "achievementCategory": 3,
    "achievementTier": 1,
    "achievementTitle": "Event Enthusiast I",
    "achievementDescription": "Attended 1 events.",
    "achievementIcon": "Calendar1"
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
    "id": "Uoppeah8Gv",
    "achievementCategory": 4,
    "achievementTier": 1,
    "achievementTitle": "Conversation Starter I",
    "achievementDescription": "Created 1 bulletin.",
    "achievementIcon": "Newspaper"
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
    "id": "ilKdX_jrfT",
    "achievementCategory": 5,
    "achievementTier": 1,
    "achievementTitle": "Contributor I",
    "achievementDescription": "Written 10 comments.",
    "achievementIcon": "MessageSquare"
  },
  {
    "id": "jknuI0g9_Q",
    "achievementCategory": 5,
    "achievementTier": 2,
    "achievementTitle": "Contributor II",
    "achievementDescription": "Written 50 comments.",
    "achievementIcon": "MessagesSquare"
  },
  {
    "id": "4KmaAoCnzy",
    "achievementCategory": 10000,
    "achievementTier": 1,
    "achievementTitle": "READS Alumni",
    "achievementDescription": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievementIcon": "BookOpen"
  }
]
```

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