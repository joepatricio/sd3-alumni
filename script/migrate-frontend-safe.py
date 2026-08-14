import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove string literals in params object:
    # e.g., '_embed': 'degree', '_embed': 'achievement'
    content = re.sub(r"'_embed':\s*'[^']+',?\s*", "", content)
    content = re.sub(r"_embed:\s*'[^']+',?\s*", "", content)
    content = re.sub(r"'_sort':\s*'[^']+',?\s*", "", content)
    content = re.sub(r"_sort:\s*'[^']+',?\s*", "", content)
    content = re.sub(r"'_expand':\s*'[^']+',?\s*", "", content)
    content = re.sub(r"_expand:\s*'[^']+',?\s*", "", content)
    
    # Remove from URLs: ?_embed=location&_embed=userRsvps
    # We carefully replace ?_embed=... with ? and &_embed=... with nothing
    content = re.sub(r"\?_embed=[a-zA-Z0-9_]+&?", "?", content)
    content = re.sub(r"&_embed=[a-zA-Z0-9_]+", "", content)
    content = re.sub(r"\?_sort=[a-zA-Z0-9_\-]+&?", "?", content)
    content = re.sub(r"&_sort=[a-zA-Z0-9_\-]+", "", content)
    
    # Remove filters like contentStatus.statusName:contains=Approved
    content = re.sub(r"&contentStatus\.statusName:contains=[a-zA-Z]+", "", content)
    content = re.sub(r"&user\.userStatusId:ne=\${[^}]+}", "", content)

    # Carefully clean up trailing ? or dangling & without touching &&
    content = re.sub(r"\?['\"`]", "'", content) # ?" -> "
    content = re.sub(r"\?`", "`", content)
    content = content.replace("?&", "?")
    
    # Special fix for any hanging ? at end of URL string
    content = re.sub(r"\?'", "'", content)
    content = re.sub(r"\?\"", "\"", content)
    content = re.sub(r"\?\)", ")", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    src_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'app')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
