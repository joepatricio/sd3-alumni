#!/usr/bin/env python3
"""
Cleanup Script for Happy Path Tech Demo Automation Script (happy_path_demo_v2.py)
Alumni Tracking System (https://najealp.top / http://localhost:5173)

This script cleans up all database writes and artifacts created by the demo:
  1. The demo user account(s) (User, UserAuth, Profile, UserStatistic, Record, UserAchievement, etc.)
  2. The discussion comment posted on the bulletin board in Stage 5, including any associated comment likes (Comment, CommentLike)
  3. All incoming friend requests to John Smith (both reciprocal records in UserConnection).
  4. The official event posted in Stage 9 (Event, UserRsvp, ClefLog, and orphaned Location).
  5. Forces a SQLite WAL checkpoint at the end:
     PRAGMA wal_checkpoint(TRUNCATE);
"""

import sys
import os
import argparse
import sqlite3

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def find_db_path(specified_path: str = None) -> str:
    """Resolve the path to dev.db."""
    if specified_path and os.path.exists(specified_path):
        return os.path.abspath(specified_path)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    candidates = [
        specified_path,
        os.path.join(project_root, "dev.db"),
        os.path.join(os.getcwd(), "dev.db"),
        "dev.db",
    ]

    for path in candidates:
        if path and os.path.exists(path):
            return os.path.abspath(path)

    raise FileNotFoundError(
        f"Could not find dev.db in project root ({project_root}) or current working directory. "
        "Please specify path with --db."
    )


def clean_database(
    db_path: str,
    user_name: str = "Jose Hortelano",
    custom_email: str = "",
    target_friend: str = "John Smith",
    event_title: str = "USJ-R Engineering Homecoming & Alumni Gala%",
    comment_text: str = "%Delighted to reconnect with the USJ-R alumni community%",
    dry_run: bool = False,
):
    print("=" * 78)
    print("HAPPY PATH DEMO DATABASE CLEANUP")
    print(f"Target Database: {db_path}")
    if dry_run:
        print("[MODE] DRY-RUN ONLY - No database modifications will be committed.")
    print("=" * 78)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    stats = {
        "users_deleted": 0,
        "profiles_deleted": 0,
        "auth_deleted": 0,
        "records_deleted": 0,
        "comments_deleted": 0,
        "comment_likes_deleted": 0,
        "comments_written_decremented": 0,
        "connections_deleted": 0,
        "events_deleted": 0,
        "locations_deleted": 0,
        "rsvps_deleted": 0,
        "clef_logs_deleted": 0,
        "files_removed": 0,
    }

    try:
        # ----------------------------------------------------------------------
        # 1. IDENTIFY DEMO USER ACCOUNTS
        # ----------------------------------------------------------------------
        print("\n[1/5] Identifying demo user account(s)...")
        clauses = [
            "p.userName = ?",
            "p.userName LIKE ?",
            "a.email LIKE 'demo.%@example.com'",
            "a.email = 'joe.hortz@example.com'",
            "p.email LIKE 'demo.%@example.com'",
            "p.email = 'joe.hortz@example.com'",
        ]
        params = [user_name, f"{user_name}%"]

        if custom_email:
            clauses.append("a.email = ?")
            clauses.append("p.email = ?")
            params.extend([custom_email, custom_email])

        where_clause = " OR ".join(clauses)
        cur.execute(f"""
            SELECT DISTINCT u.id, p.userName, a.email
            FROM User u
            LEFT JOIN Profile p ON u.id = p.userId
            LEFT JOIN UserAuth a ON u.id = a.userId
            WHERE {where_clause}
        """, params)
        demo_users = cur.fetchall()
        demo_user_ids = [u[0] for u in demo_users]

        for uid, name, email in demo_users:
            print(f"  -> Found demo account: ID={uid} | Name='{name}' | Email='{email}'")

        if not demo_users:
            print(f"  -> No demo user accounts found matching '{user_name}' or 'demo.*@example.com'.")

        # ----------------------------------------------------------------------
        # 2. IDENTIFY BULLETIN COMMENT & CHECK FOR LIKES
        # ----------------------------------------------------------------------
        print("\n[2/5] Identifying demo bulletin comment(s) and checking for likes...")
        comment_query = """
            SELECT c.id, c.userId, p.userName, c.bulletinId, c.comment, c.likes
            FROM Comment c
            LEFT JOIN Profile p ON c.userId = p.userId
            WHERE c.comment LIKE ?
        """
        c_params = [comment_text]
        if demo_user_ids:
            placeholders = ",".join("?" for _ in demo_user_ids)
            comment_query += f" OR c.userId IN ({placeholders})"
            c_params.extend(demo_user_ids)

        cur.execute(comment_query, c_params)
        comments_to_delete = cur.fetchall()
        comment_ids_to_delete = [c[0] for c in comments_to_delete]

        # Inspect likes on comments to delete
        comment_likes_on_comments = []
        if comment_ids_to_delete:
            c_placeholders = ",".join("?" for _ in comment_ids_to_delete)
            cur.execute(f"""
                SELECT cl.id, cl.userId, p.userName, cl.commentId, cl.isLiked
                FROM CommentLike cl
                LEFT JOIN Profile p ON cl.userId = p.userId
                WHERE cl.commentId IN ({c_placeholders})
            """, comment_ids_to_delete)
            comment_likes_on_comments = cur.fetchall()

        # Also inspect any comment likes created by demo users on other comments
        comment_likes_by_demo_users = []
        if demo_user_ids:
            u_placeholders = ",".join("?" for _ in demo_user_ids)
            cur.execute(f"""
                SELECT cl.id, cl.userId, cl.commentId, cl.isLiked
                FROM CommentLike cl
                WHERE cl.userId IN ({u_placeholders})
            """, demo_user_ids)
            comment_likes_by_demo_users = cur.fetchall()

        for cid, cuid, cname, bid, ctext, clikes in comments_to_delete:
            preview = ctext[:60] + "..." if len(ctext) > 60 else ctext
            print(f"  -> Found comment: ID={cid} | Author='{cname or cuid}' | LikesCounter={clikes} | Text='{preview}'")

        if comment_likes_on_comments:
            print(f"  -> Found {len(comment_likes_on_comments)} like(s) on target comments:")
            for cl_id, cl_uid, cl_name, cl_cid, is_liked in comment_likes_on_comments:
                print(f"     * CommentLike ID={cl_id} | User='{cl_name or cl_uid}' | isLiked={bool(is_liked)}")
        else:
            print("  -> Verified: 0 likes recorded in CommentLike for target comment(s).")

        if comment_likes_by_demo_users:
            print(f"  -> Found {len(comment_likes_by_demo_users)} comment like(s) authored by demo users on other comments.")
        else:
            print("  -> Verified: 0 comment likes authored by demo user(s).")

        if not comments_to_delete:
            print("  -> No matching demo comments found.")

        # ----------------------------------------------------------------------
        # 3. IDENTIFY INCOMING FRIEND REQUESTS TO JOHN SMITH (BOTH RECORDS)
        # ----------------------------------------------------------------------
        print(f"\n[3/5] Identifying incoming friend requests to {target_friend} (both records)...")
        cur.execute(
            "SELECT userId, userName, email FROM Profile WHERE userName = ? OR userName LIKE ?",
            (target_friend, f"{target_friend}%")
        )
        friend_rows = cur.fetchall()

        connections_to_delete = []
        if friend_rows:
            friend_id = friend_rows[0][0]
            print(f"  -> Found target profile ({target_friend}): ID={friend_id}")

            # Find connection status ID for 'Requested'
            cur.execute("SELECT id FROM ConnectionStatus WHERE connectionName = 'Requested'")
            requested_status = cur.fetchone()
            requested_id = requested_status[0] if requested_status else None

            # 1. Any incoming request to John Smith (where John Smith is userId with status 'Requested')
            # For each such request, the sender is friendId.
            # Both reciprocal records: (userId=friend_id, friendId=sender) and (userId=sender, friendId=friend_id)
            if requested_id:
                cur.execute("""
                    SELECT uc.id, uc.userId, p1.userName, uc.friendId, p2.userName, cs.connectionName
                    FROM UserConnection uc
                    LEFT JOIN Profile p1 ON uc.userId = p1.userId
                    LEFT JOIN Profile p2 ON uc.friendId = p2.userId
                    LEFT JOIN ConnectionStatus cs ON uc.connectionStatusId = cs.id
                    WHERE uc.userId = ? AND uc.connectionStatusId = ?
                """, (friend_id, requested_id))
                incoming_requests = cur.fetchall()

                for uc_id, u1, n1, sender_id, n2, cstatus in incoming_requests:
                    cur.execute("""
                        SELECT uc.id, uc.userId, p1.userName, uc.friendId, p2.userName, cs.connectionName
                        FROM UserConnection uc
                        LEFT JOIN Profile p1 ON uc.userId = p1.userId
                        LEFT JOIN Profile p2 ON uc.friendId = p2.userId
                        LEFT JOIN ConnectionStatus cs ON uc.connectionStatusId = cs.id
                        WHERE (uc.userId = ? AND uc.friendId = ?) OR (uc.userId = ? AND uc.friendId = ?)
                    """, (friend_id, sender_id, sender_id, friend_id))
                    pair = cur.fetchall()
                    for r in pair:
                        if r not in connections_to_delete:
                            connections_to_delete.append(r)

            # 2. Also include any connection involving John Smith and any demo user
            if demo_user_ids:
                placeholders = ",".join("?" for _ in demo_user_ids)
                params_pair = [friend_id] + demo_user_ids + demo_user_ids + [friend_id]
                cur.execute(f"""
                    SELECT uc.id, uc.userId, p1.userName, uc.friendId, p2.userName, cs.connectionName
                    FROM UserConnection uc
                    LEFT JOIN Profile p1 ON uc.userId = p1.userId
                    LEFT JOIN Profile p2 ON uc.friendId = p2.userId
                    LEFT JOIN ConnectionStatus cs ON uc.connectionStatusId = cs.id
                    WHERE (uc.userId = ? AND uc.friendId IN ({placeholders}))
                       OR (uc.userId IN ({placeholders}) AND uc.friendId = ?)
                """, params_pair)
                demo_conns = cur.fetchall()
                for r in demo_conns:
                    if r not in connections_to_delete:
                        connections_to_delete.append(r)

            for uc_id, u1, n1, u2, n2, cstatus in connections_to_delete:
                print(f"  -> Found connection record: ID={uc_id} | '{n1}' -> '{n2}' | Status='{cstatus}'")

            if not connections_to_delete:
                print(f"  -> No pending incoming friend requests to {target_friend} found.")
        else:
            print(f"  -> Notice: Profile for '{target_friend}' not found in database.")

        # ----------------------------------------------------------------------
        # 4. IDENTIFY POSTED EVENT(S)
        # ----------------------------------------------------------------------
        print("\n[4/5] Identifying demo event(s)...")
        event_query = """
            SELECT e.id, e.authorId, p.userName, e.title, e.locationId, e.eventImage
            FROM Event e
            LEFT JOIN Profile p ON e.authorId = p.userId
            WHERE e.title LIKE ?
        """
        e_params = [event_title]
        if demo_user_ids:
            placeholders = ",".join("?" for _ in demo_user_ids)
            event_query += f" OR e.authorId IN ({placeholders})"
            e_params.extend(demo_user_ids)

        cur.execute(event_query, e_params)
        events_to_delete = cur.fetchall()

        for eid, author_id, aname, title, loc_id, img in events_to_delete:
            print(f"  -> Found event: ID={eid} | Author='{aname or author_id}' | Title='{title}' | LocID={loc_id}")

        if not events_to_delete:
            print(f"  -> No demo events found matching '{event_title}'.")

        # ----------------------------------------------------------------------
        # 5. EXECUTE DELETIONS
        # ----------------------------------------------------------------------
        if dry_run:
            print("\n[DRY-RUN] Summary of actions that would be performed:")
            print(f"  - Accounts to delete: {len(demo_users)}")
            print(f"  - Comments to delete: {len(comments_to_delete)}")
            print(f"  - Comment likes to delete: {len(comment_likes_on_comments) + len(comment_likes_by_demo_users)}")
            print(f"  - UserConnection records to delete: {len(connections_to_delete)}")
            print(f"  - Events to delete: {len(events_to_delete)}")
            print("\n[DRY-RUN] No changes committed.")
            return

        print("\n[5/5] Deleting records and restoring clean state...")

        # A. Delete Comment Likes and Comments
        # 1) Delete likes on the target comments
        for cl_id, _, _, _, _ in comment_likes_on_comments:
            cur.execute("DELETE FROM CommentLike WHERE id = ?", (cl_id,))
            stats["comment_likes_deleted"] += 1

        # 2) Delete likes authored by demo users on other comments (and decrement target comment likes)
        for cl_id, _, other_comment_id, is_liked in comment_likes_by_demo_users:
            if other_comment_id not in comment_ids_to_delete:
                cur.execute("UPDATE Comment SET likes = MAX(0, likes - 1) WHERE id = ?", (other_comment_id,))
            cur.execute("DELETE FROM CommentLike WHERE id = ?", (cl_id,))
            stats["comment_likes_deleted"] += 1

        # 3) Delete comments and decrement author's commentsWritten if retained user
        for cid, cuid, _, _, _, _ in comments_to_delete:
            # Also safety delete any remaining CommentLike for this comment
            cl_deleted = cur.execute("DELETE FROM CommentLike WHERE commentId = ?", (cid,)).rowcount
            stats["comment_likes_deleted"] += max(0, cl_deleted)

            # Decrement commentsWritten if author is a retained user
            if cuid not in demo_user_ids:
                cur.execute("""
                    UPDATE UserStatistic
                    SET commentsWritten = MAX(0, commentsWritten - 1)
                    WHERE userId = ? AND commentsWritten > 0
                """, (cuid,))
                stats["comments_written_decremented"] += 1

            cur.execute("DELETE FROM Comment WHERE id = ?", (cid,))
            stats["comments_deleted"] += 1

        print(f"  [OK] Deleted {stats['comments_deleted']} comment(s) and {stats['comment_likes_deleted']} comment like(s).")
        if stats["comments_written_decremented"] > 0:
            print(f"  [OK] Adjusted commentsWritten counter for {stats['comments_written_decremented']} retained author account(s).")

        # B. Delete UserConnection records for John Smith
        for uc_id, _, _, _, _, _ in connections_to_delete:
            cur.execute("DELETE FROM UserConnection WHERE id = ?", (uc_id,))
            stats["connections_deleted"] += 1
        print(f"  [OK] Deleted {stats['connections_deleted']} connection record(s) involving {target_friend}.")

        # C. Delete Events, RSVPs, and Locations
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        for eid, author_id, _, _, loc_id, event_img in events_to_delete:
            # Delete RSVPs for this event
            rsvp_res = cur.execute("DELETE FROM UserRsvp WHERE eventId = ?", (eid,)).rowcount
            stats["rsvps_deleted"] += max(0, rsvp_res)

            # Delete ClefLogs for this event
            clef_res = cur.execute("DELETE FROM ClefLog WHERE targetId = ? AND targetType = 'Event'", (eid,)).rowcount
            stats["clef_logs_deleted"] += max(0, clef_res)

            # Decrement author's eventsCreated count if author is a retained user
            if author_id not in demo_user_ids:
                cur.execute("""
                    UPDATE UserStatistic
                    SET eventsCreated = MAX(0, eventsCreated - 1)
                    WHERE userId = ? AND eventsCreated > 0
                """, (author_id,))

            # Delete Event
            cur.execute("DELETE FROM Event WHERE id = ?", (eid,))
            stats["events_deleted"] += 1

            # Check if Location is still used by other events; if not, delete it
            if loc_id:
                other_events = cur.execute("SELECT COUNT(*) FROM Event WHERE locationId = ?", (loc_id,)).fetchone()[0]
                if other_events == 0:
                    cur.execute("DELETE FROM Location WHERE id = ?", (loc_id,))
                    stats["locations_deleted"] += 1

            # Delete uploaded event banner file if in /uploads/upload-*
            if event_img and event_img.startswith("/uploads/upload-"):
                img_path = os.path.join(project_root, event_img.lstrip("/"))
                if os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                        stats["files_removed"] += 1
                    except Exception as err:
                        print(f"  [WARN] Could not remove uploaded file {img_path}: {err}")

        print(f"  [OK] Deleted {stats['events_deleted']} event(s), {stats['rsvps_deleted']} RSVP(s), and {stats['locations_deleted']} orphaned location(s).")

        # D. Delete Demo User Accounts
        for uid, uname, _ in demo_users:
            # Find profile image file if uploaded
            prof_img_row = cur.execute("SELECT profileImage FROM Profile WHERE userId = ?", (uid,)).fetchone()
            if prof_img_row and prof_img_row[0] and prof_img_row[0].startswith("/uploads/upload-"):
                img_path = os.path.join(project_root, prof_img_row[0].lstrip("/"))
                if os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                        stats["files_removed"] += 1
                    except Exception as err:
                        print(f"  [WARN] Could not remove uploaded file {img_path}: {err}")

            # Break circular reference User.currentRecordId -> Record.id
            cur.execute("UPDATE User SET currentRecordId = NULL WHERE id = ?", (uid,))

            # Delete child tables
            cur.execute("DELETE FROM Record WHERE userId = ?", (uid,))
            stats["records_deleted"] += 1

            cur.execute("DELETE FROM UserAchievement WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM UserConnection WHERE userId = ? OR friendId = ?", (uid, uid))
            cur.execute("DELETE FROM UserRsvp WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM Notification WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM Donation WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM BulletinLike WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM CommentLike WHERE userId = ?", (uid,))
            cur.execute("DELETE FROM ClefLog WHERE targetId = ? AND targetType = 'User'", (uid,))

            cur.execute("DELETE FROM Profile WHERE userId = ?", (uid,))
            stats["profiles_deleted"] += 1

            cur.execute("DELETE FROM UserAuth WHERE userId = ?", (uid,))
            stats["auth_deleted"] += 1

            cur.execute("DELETE FROM UserStatistic WHERE userId = ?", (uid,))

            cur.execute("DELETE FROM User WHERE id = ?", (uid,))
            stats["users_deleted"] += 1

        print(f"  [OK] Deleted {stats['users_deleted']} demo user account(s), {stats['profiles_deleted']} profile(s), {stats['auth_deleted']} auth record(s).")

        # Commit all transaction deletions
        conn.commit()
        print("\n[OK] Transaction successfully committed.")

        # ----------------------------------------------------------------------
        # 6. FORCE WAL CHECKPOINT (TRUNCATE)
        # ----------------------------------------------------------------------
        print("\n[CHECKPOINT] Forcing WAL checkpoint with TRUNCATE...")
        cur.execute("PRAGMA wal_checkpoint(TRUNCATE);")
        checkpoint_result = cur.fetchall()
        print(f"[OK] PRAGMA wal_checkpoint(TRUNCATE) executed. Result: {checkpoint_result}")

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Database cleanup encountered an error: {e}")
        raise
    finally:
        conn.close()

    print("\n" + "=" * 78)
    print("CLEANUP COMPLETED SUCCESSFULLY")
    print("=" * 78)
    for k, v in stats.items():
        print(f"  - {k.replace('_', ' ').capitalize()}: {v}")
    print("=" * 78)


def main():
    parser = argparse.ArgumentParser(
        description="Cleanup database writes caused by happy_path_demo_v2.py"
    )
    parser.add_argument(
        "--db",
        default="",
        help="Path to dev.db SQLite database (default: auto-detected in workspace root)"
    )
    parser.add_argument(
        "--name",
        default="Jose Hortelano",
        help="Demo user full name to clean up (default: 'Jose Hortelano')"
    )
    parser.add_argument(
        "--email",
        default="",
        help="Specific demo user email to clean up (default: matches demo.* and joe.hortz)"
    )
    parser.add_argument(
        "--friend",
        default="John Smith",
        help="Target friend profile for connection cleanup (default: 'John Smith')"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect and list all matching records without performing deletions"
    )

    args = parser.parse_args()
    db_path = find_db_path(args.db)
    clean_database(
        db_path=db_path,
        user_name=args.name,
        custom_email=args.email,
        target_friend=args.friend,
        dry_run=args.dry_run
    )


if __name__ == "__main__":
    main()
