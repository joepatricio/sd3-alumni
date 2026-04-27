import urllib.request
import urllib.parse
import json
import os

base_url = "http://localhost:3000"

example_queries = [
    {
        "description": "Filter by condition",
        "readme_query": "/posts?views:gt=100",
        "our_query": "/ACHIEVEMENTS?achievement_tier:gt=1"
    },
    {
        "description": "Sort by field (descending)",
        "readme_query": "/posts?_sort=-views",
        "our_query": "/ACHIEVEMENTS?_sort=-achievement_tier"
    },
    {
        "description": "Pagination",
        "readme_query": "/posts?_page=1&_per_page=25",
        "our_query": "/USER?_page=1&_per_page=5"
    },
    {
        "description": "Include relations",
        "readme_query": "/posts?_embed=comments",
        "our_query": "/USER?_embed=USER_ACHIEVEMENT&_page=1&_per_page=2"
    },
    {
        "description": "Complex queries",
        "readme_query": "/posts?_where={\"or\":[...]}",
        "our_query": "/ACHIEVEMENTS?_where={\"or\":[{\"achievement_tier\":{\"gt\":2}},{\"id\":{\"lt\":\"3\"}}]}"
    },
    {
        "description": "Filter exact",
        "readme_query": "/posts?title:eq=Hello",
        "our_query": "/ACHIEVEMENTS?achievement_tier:eq=1"
    },
    {
        "description": "Filter in",
        "readme_query": "/posts?id:in=1,2,3",
        "our_query": "/ACHIEVEMENTS?achievement_tier:in=1,3"
    },
    {
        "description": "Filter contains",
        "readme_query": "/posts?title:contains=hello",
        "our_query": "/ACHIEVEMENTS?achievement_title:contains=Club"
    },
    {
        "description": "Filter startsWith",
        "readme_query": "/posts?title:startsWith=Hello",
        "our_query": "/ACHIEVEMENTS?achievement_title:startsWith=Philanthropist"
    },
    {
        "description": "Filter endsWith",
        "readme_query": "/posts?title:endsWith=world",
        "our_query": "/ACHIEVEMENTS?achievement_title:endsWith=I"
    }
]

output_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "Skill.md")

# Ensure the docs directory exists
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(output_file, "w", encoding="utf-8") as f:
    f.write("# json-server REST API Reference\n\n")
    f.write("This document contains the outputs of the example queries from the `json-server` README, adapted for our `db.json`.\n\n")

    for q in example_queries:
        # We need to manually split and encode the query params to ensure proper URL encoding
        path_parts = q["our_query"].split("?")
        path = path_parts[0]
        
        if len(path_parts) > 1:
            # simple split on '&'
            query_string = path_parts[1]
            params = query_string.split("&")
            encoded_params = []
            for p in params:
                if "=" in p:
                    k, v = p.split("=", 1)
                    encoded_params.append(f"{urllib.parse.quote(k)}={urllib.parse.quote(v)}")
                else:
                    encoded_params.append(urllib.parse.quote(p))
            url = base_url + path + "?" + "&".join(encoded_params)
        else:
            url = base_url + path
            
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                
            f.write(f"## {q['description']}\n\n")
            f.write(f"**README Example:** `GET {q['readme_query']}`\n\n")
            f.write(f"**Our Equivalent:** `GET {q['our_query']}`\n\n")
            f.write("```json\n")
            f.write(json.dumps(res_data, indent=2))
            f.write("\n```\n\n")
            
        except Exception as e:
            print(f"Error querying {url}: {e}")
            f.write(f"## {q['description']}\n\n")
            f.write(f"**Our Equivalent:** `GET {q['our_query']}`\n\n")
            f.write(f"**Error:** {e}\n\n")

print(f"Successfully wrote output to {output_file}")