# json-server REST API Reference

This document contains the outputs of the example queries from the `json-server` README, adapted for our `db.json`.

## Filter by condition

**README Example:** `GET /posts?views:gt=100`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_tier:gt=1`

```json
[
  {
    "id": "1",
    "achievement_tier": 2,
    "achievement_title": "3-Year Club",
    "achievement_description": "Has been a member for 3 years.",
    "achievement_icon": "Sparkle"
  },
  {
    "id": "1",
    "achievement_tier": 3,
    "achievement_title": "Prestige Alumni",
    "achievement_description": "Has been a member for 10+ years.",
    "achievement_icon": "Sparkles"
  },
  {
    "id": "2",
    "achievement_tier": 2,
    "achievement_title": "Philanthropist II",
    "achievement_description": "Donated a medium amount to the association (up to \u20b120,000 total).",
    "achievement_icon": "HeartPulse"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  },
  {
    "id": "3",
    "achievement_tier": 2,
    "achievement_title": "Event Enthusiast II",
    "achievement_description": "Attended 5 events.",
    "achievement_icon": "Calendar"
  },
  {
    "id": "3",
    "achievement_tier": 3,
    "achievement_title": "Event Enthusiast III",
    "achievement_description": "Attended 15 events.",
    "achievement_icon": "CalendarHeart"
  },
  {
    "id": "4",
    "achievement_tier": 2,
    "achievement_title": "Conversation Starter II",
    "achievement_description": "Created 5 bulletins.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 2,
    "achievement_title": "Contributor II",
    "achievement_description": "Written 50 comments.",
    "achievement_icon": "MessageCircle"
  }
]
```

## Sort by field (descending)

**README Example:** `GET /posts?_sort=-views`

**Our Equivalent:** `GET /ACHIEVEMENTS?_sort=-achievement_tier`

```json
[
  {
    "id": "1",
    "achievement_tier": 3,
    "achievement_title": "Prestige Alumni",
    "achievement_description": "Has been a member for 10+ years.",
    "achievement_icon": "Sparkles"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  },
  {
    "id": "3",
    "achievement_tier": 3,
    "achievement_title": "Event Enthusiast III",
    "achievement_description": "Attended 15 events.",
    "achievement_icon": "CalendarHeart"
  },
  {
    "id": "1",
    "achievement_tier": 2,
    "achievement_title": "3-Year Club",
    "achievement_description": "Has been a member for 3 years.",
    "achievement_icon": "Sparkle"
  },
  {
    "id": "2",
    "achievement_tier": 2,
    "achievement_title": "Philanthropist II",
    "achievement_description": "Donated a medium amount to the association (up to \u20b120,000 total).",
    "achievement_icon": "HeartPulse"
  },
  {
    "id": "3",
    "achievement_tier": 2,
    "achievement_title": "Event Enthusiast II",
    "achievement_description": "Attended 5 events.",
    "achievement_icon": "Calendar"
  },
  {
    "id": "4",
    "achievement_tier": 2,
    "achievement_title": "Conversation Starter II",
    "achievement_description": "Created 5 bulletins.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 2,
    "achievement_title": "Contributor II",
    "achievement_description": "Written 50 comments.",
    "achievement_icon": "MessageCircle"
  },
  {
    "id": "1",
    "achievement_tier": 1,
    "achievement_title": "1-Year Club",
    "achievement_description": "Has been a member for 1 year.",
    "achievement_icon": "Star"
  },
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "3",
    "achievement_tier": 1,
    "achievement_title": "Event Enthusiast I",
    "achievement_description": "Attended 1 events.",
    "achievement_icon": "Calendar1"
  },
  {
    "id": "4",
    "achievement_tier": 1,
    "achievement_title": "Conversation Starter I",
    "achievement_description": "Created 1 bulletin.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 1,
    "achievement_title": "Contributor I",
    "achievement_description": "Written 10 comments.",
    "achievement_icon": "MessageSquare"
  },
  {
    "id": "10000",
    "achievement_tier": 1,
    "achievement_title": "READS Alumni",
    "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievement_icon": "BookOpen"
  },
  {
    "id": "10001",
    "achievement_tier": 1,
    "achievement_title": "Verified",
    "achievement_description": "User has been verified.",
    "achievement_icon": "Gear"
  }
]
```

## Pagination

**README Example:** `GET /posts?_page=1&_per_page=25`

**Our Equivalent:** `GET /USER?_page=1&_per_page=5`

```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 10,
  "pages": 10,
  "items": 50,
  "data": [
    {
      "id": "1",
      "status_id": "401",
      "current_record_id": "c45e716a-b595-4821-a998-3c63c3b84fb2"
    },
    {
      "id": "2",
      "status_id": "401",
      "current_record_id": "568ae2e6-eeaf-47a2-a9d3-7f7df42e6795"
    },
    {
      "id": "3",
      "status_id": "401",
      "current_record_id": "0b95135e-3c87-4178-a942-dd058e05b17d"
    },
    {
      "id": "4",
      "status_id": "401",
      "current_record_id": "6ce8dfaa-910a-433e-ab59-85bdceddf471"
    },
    {
      "id": "5",
      "status_id": "401",
      "current_record_id": "d1af79dd-f7dd-441f-8170-0e6f70b01151"
    }
  ]
}
```

## Include relations (BUGGED, DEFER TO OTHER SOLUTIONS)

**README Example:** `GET /posts?_embed=comments`

**Our Equivalent:** `GET /USER?_embed=USER_ACHIEVEMENT&_page=1&_per_page=2`

```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 25,
  "pages": 25,
  "items": 50,
  "data": [
    {
      "id": "1",
      "status_id": "401",
      "current_record_id": "c45e716a-b595-4821-a998-3c63c3b84fb2"
    },
    {
      "id": "2",
      "status_id": "401",
      "current_record_id": "568ae2e6-eeaf-47a2-a9d3-7f7df42e6795"
    }
  ]
}
```

## Complex queries

**README Example:** `GET /posts?_where={"or":[...]}`

**Our Equivalent:** `GET /ACHIEVEMENTS?_where={"or":[{"achievement_tier":{"gt":2}},{"id":{"lt":"3"}}]}`

```json
[
  {
    "id": "1",
    "achievement_tier": 1,
    "achievement_title": "1-Year Club",
    "achievement_description": "Has been a member for 1 year.",
    "achievement_icon": "Star"
  },
  {
    "id": "1",
    "achievement_tier": 2,
    "achievement_title": "3-Year Club",
    "achievement_description": "Has been a member for 3 years.",
    "achievement_icon": "Sparkle"
  },
  {
    "id": "1",
    "achievement_tier": 3,
    "achievement_title": "Prestige Alumni",
    "achievement_description": "Has been a member for 10+ years.",
    "achievement_icon": "Sparkles"
  },
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "2",
    "achievement_tier": 2,
    "achievement_title": "Philanthropist II",
    "achievement_description": "Donated a medium amount to the association (up to \u20b120,000 total).",
    "achievement_icon": "HeartPulse"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  },
  {
    "id": "3",
    "achievement_tier": 3,
    "achievement_title": "Event Enthusiast III",
    "achievement_description": "Attended 15 events.",
    "achievement_icon": "CalendarHeart"
  },
  {
    "id": "10000",
    "achievement_tier": 1,
    "achievement_title": "READS Alumni",
    "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievement_icon": "BookOpen"
  },
  {
    "id": "10001",
    "achievement_tier": 1,
    "achievement_title": "Verified",
    "achievement_description": "User has been verified.",
    "achievement_icon": "Gear"
  }
]
```

## Filter exact

**README Example:** `GET /posts?title:eq=Hello`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_tier:eq=1`

```json
[
  {
    "id": "1",
    "achievement_tier": 1,
    "achievement_title": "1-Year Club",
    "achievement_description": "Has been a member for 1 year.",
    "achievement_icon": "Star"
  },
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "3",
    "achievement_tier": 1,
    "achievement_title": "Event Enthusiast I",
    "achievement_description": "Attended 1 events.",
    "achievement_icon": "Calendar1"
  },
  {
    "id": "4",
    "achievement_tier": 1,
    "achievement_title": "Conversation Starter I",
    "achievement_description": "Created 1 bulletin.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 1,
    "achievement_title": "Contributor I",
    "achievement_description": "Written 10 comments.",
    "achievement_icon": "MessageSquare"
  },
  {
    "id": "10000",
    "achievement_tier": 1,
    "achievement_title": "READS Alumni",
    "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievement_icon": "BookOpen"
  },
  {
    "id": "10001",
    "achievement_tier": 1,
    "achievement_title": "Verified",
    "achievement_description": "User has been verified.",
    "achievement_icon": "Gear"
  }
]
```

## Filter in

**README Example:** `GET /posts?id:in=1,2,3`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_tier:in=1,3`

```json
[
  {
    "id": "1",
    "achievement_tier": 1,
    "achievement_title": "1-Year Club",
    "achievement_description": "Has been a member for 1 year.",
    "achievement_icon": "Star"
  },
  {
    "id": "1",
    "achievement_tier": 3,
    "achievement_title": "Prestige Alumni",
    "achievement_description": "Has been a member for 10+ years.",
    "achievement_icon": "Sparkles"
  },
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  },
  {
    "id": "3",
    "achievement_tier": 1,
    "achievement_title": "Event Enthusiast I",
    "achievement_description": "Attended 1 events.",
    "achievement_icon": "Calendar1"
  },
  {
    "id": "3",
    "achievement_tier": 3,
    "achievement_title": "Event Enthusiast III",
    "achievement_description": "Attended 15 events.",
    "achievement_icon": "CalendarHeart"
  },
  {
    "id": "4",
    "achievement_tier": 1,
    "achievement_title": "Conversation Starter I",
    "achievement_description": "Created 1 bulletin.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 1,
    "achievement_title": "Contributor I",
    "achievement_description": "Written 10 comments.",
    "achievement_icon": "MessageSquare"
  },
  {
    "id": "10000",
    "achievement_tier": 1,
    "achievement_title": "READS Alumni",
    "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievement_icon": "BookOpen"
  },
  {
    "id": "10001",
    "achievement_tier": 1,
    "achievement_title": "Verified",
    "achievement_description": "User has been verified.",
    "achievement_icon": "Gear"
  }
]
```

## Filter contains

**README Example:** `GET /posts?title:contains=hello`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_title:contains=Club`

```json
[
  {
    "id": "1",
    "achievement_tier": 1,
    "achievement_title": "1-Year Club",
    "achievement_description": "Has been a member for 1 year.",
    "achievement_icon": "Star"
  },
  {
    "id": "1",
    "achievement_tier": 2,
    "achievement_title": "3-Year Club",
    "achievement_description": "Has been a member for 3 years.",
    "achievement_icon": "Sparkle"
  }
]
```

## Filter startsWith

**README Example:** `GET /posts?title:startsWith=Hello`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_title:startsWith=Philanthropist`

```json
[
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "2",
    "achievement_tier": 2,
    "achievement_title": "Philanthropist II",
    "achievement_description": "Donated a medium amount to the association (up to \u20b120,000 total).",
    "achievement_icon": "HeartPulse"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  }
]
```

## Filter endsWith

**README Example:** `GET /posts?title:endsWith=world`

**Our Equivalent:** `GET /ACHIEVEMENTS?achievement_title:endsWith=I`

```json
[
  {
    "id": "1",
    "achievement_tier": 3,
    "achievement_title": "Prestige Alumni",
    "achievement_description": "Has been a member for 10+ years.",
    "achievement_icon": "Sparkles"
  },
  {
    "id": "2",
    "achievement_tier": 1,
    "achievement_title": "Philanthropist I",
    "achievement_description": "Donated a small amount to the association (up to \u20b15,000 total).",
    "achievement_icon": "Heart"
  },
  {
    "id": "2",
    "achievement_tier": 2,
    "achievement_title": "Philanthropist II",
    "achievement_description": "Donated a medium amount to the association (up to \u20b120,000 total).",
    "achievement_icon": "HeartPulse"
  },
  {
    "id": "2",
    "achievement_tier": 3,
    "achievement_title": "Philanthropist III",
    "achievement_description": "Donated a large amount to the association (over \u20b120,000 total).",
    "achievement_icon": "HandCoins"
  },
  {
    "id": "3",
    "achievement_tier": 1,
    "achievement_title": "Event Enthusiast I",
    "achievement_description": "Attended 1 events.",
    "achievement_icon": "Calendar1"
  },
  {
    "id": "3",
    "achievement_tier": 2,
    "achievement_title": "Event Enthusiast II",
    "achievement_description": "Attended 5 events.",
    "achievement_icon": "Calendar"
  },
  {
    "id": "3",
    "achievement_tier": 3,
    "achievement_title": "Event Enthusiast III",
    "achievement_description": "Attended 15 events.",
    "achievement_icon": "CalendarHeart"
  },
  {
    "id": "4",
    "achievement_tier": 1,
    "achievement_title": "Conversation Starter I",
    "achievement_description": "Created 1 bulletin.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "4",
    "achievement_tier": 2,
    "achievement_title": "Conversation Starter II",
    "achievement_description": "Created 5 bulletins.",
    "achievement_icon": "Newspaper"
  },
  {
    "id": "5",
    "achievement_tier": 1,
    "achievement_title": "Contributor I",
    "achievement_description": "Written 10 comments.",
    "achievement_icon": "MessageSquare"
  },
  {
    "id": "5",
    "achievement_tier": 2,
    "achievement_title": "Contributor II",
    "achievement_description": "Written 50 comments.",
    "achievement_icon": "MessageCircle"
  },
  {
    "id": "10000",
    "achievement_tier": 1,
    "achievement_title": "READS Alumni",
    "achievement_description": "Part of the Recoletos Educational Assistance for Deserving Students.",
    "achievement_icon": "BookOpen"
  }
]
```

