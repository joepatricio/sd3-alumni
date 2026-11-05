import subprocess
import tempfile
import os
import sqlite3
import json

blob_b13 = subprocess.check_output(['git', 'rev-parse', 'b13fe83:dev.db'], text=True).strip()
data_b13 = subprocess.check_output(['git', 'cat-file', '-p', blob_b13])

blob_head = subprocess.check_output(['git', 'rev-parse', 'HEAD:dev.db'], text=True).strip()
data_head = subprocess.check_output(['git', 'cat-file', '-p', blob_head])

with tempfile.NamedTemporaryFile(delete=False, suffix='_b13.db') as f1, tempfile.NamedTemporaryFile(delete=False, suffix='_head.db') as f2:
    f1.write(data_b13)
    f2.write(data_head)
    p_b13 = f1.name
    p_head = f2.name

try:
    conn1 = sqlite3.connect(p_b13)
    conn2 = sqlite3.connect(p_head)
    conn1.row_factory = sqlite3.Row
    conn2.row_factory = sqlite3.Row
    
    cur1 = conn1.cursor()
    cur2 = conn2.cursor()
    
    diff_tables = [
        'User', 'UserAuth', 'Profile', 'UserStatistic', 'Event', 'Location',
        'UserRsvp', 'Comment', 'Donation', 'ClefLog', 'Notification',
        'Record', 'UserAchievement', 'UserConnection'
    ]
    
    for t in diff_tables:
        print(f'=== TABLE: {t} ===')
        try:
            rows1 = cur1.execute(f'SELECT * FROM "{t}"').fetchall()
            rows2 = cur2.execute(f'SELECT * FROM "{t}"').fetchall()
        except Exception as e:
            print(f'Error reading table {t}: {e}')
            continue
            
        pk_col = 'id'
        if t in ['UserAuth', 'Profile', 'UserStatistic']:
            pk_col = 'userId'
            
        map1 = {r[pk_col]: dict(r) for r in rows1}
        map2 = {r[pk_col]: dict(r) for r in rows2}
        
        added = set(map2.keys()) - set(map1.keys())
        removed = set(map1.keys()) - set(map2.keys())
        common = set(map1.keys()) & set(map2.keys())
        
        modified = []
        for k in common:
            if map1[k] != map2[k]:
                col_diffs = {c: (map1[k][c], map2[k][c]) for c in map1[k] if map1[k][c] != map2[k][c]}
                modified.append((k, col_diffs))
                
        print(f'  Added ({len(added)}): {list(added)}')
        for k in list(added)[:3]:
            print(f'    + {map2[k]}')
        print(f'  Removed ({len(removed)}): {list(removed)}')
        for k in list(removed)[:3]:
            print(f'    - {map1[k]}')
        print(f'  Modified ({len(modified)}):')
        for k, diff in modified[:3]:
            print(f'    ~ {k}: {diff}')
        print()

finally:
    try:
        conn1.close()
        conn2.close()
    except:
        pass
    os.remove(p_b13)
    os.remove(p_head)
