#!/usr/bin/env python3
"""
Orphaned Image Scanner for SD3 Alumni Portal Database & Storage.

Scans for:
1. Dangling / Broken References in the Database:
   Records in the database whose image file does not exist on disk.
   Target schema fields:
   - Profile.profileImage   (prisma/schema.prisma:193-194)
   - Bulletin.bulletinImage (prisma/schema.prisma:231-232)
   - Event.eventImage       (prisma/schema.prisma:269-270)

2. Orphaned / Unreferenced Files in Storage:
   Files residing in the storage directory (`uploads/`) that are no longer
   referenced by any of the target database fields (e.g. replaced profile photos,
   deleted bulletins/events, or abandoned uploads).
   - Distinguishes between orphaned user uploads (`upload-*`) and static UI assets.

3. Relational Orphans:
   Records containing images whose parent/author User accounts no longer exist.
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sqlite3
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from urllib.parse import unquote, urlparse

def find_project_root() -> Path:
    """Finds project root by locating prisma/schema.prisma or .env."""
    current = Path(__file__).resolve().parent
    for p in [current, *current.parents]:
        if (p / "prisma" / "schema.prisma").is_file() or (p / ".env").is_file():
            return p
    return Path.cwd()


# Ensure workspace virtualenv packages (e.g. Lib/site-packages) are available
_proj_root = find_project_root()
for _site_pkg in [
    _proj_root / "Lib" / "site-packages",
    _proj_root / ".venv" / "Lib" / "site-packages",
    _proj_root / "venv" / "Lib" / "site-packages",
]:
    if _site_pkg.is_dir() and str(_site_pkg) not in sys.path:
        sys.path.insert(0, str(_site_pkg))

import send2trash


def resolve_db_path(project_root: Path, custom_db: Optional[str] = None) -> Path:
    """Resolves SQLite database path from argument, .env, or default locations."""
    if custom_db:
        db_p = Path(custom_db)
        if not db_p.is_absolute():
            db_p = project_root / db_p
        return db_p

    # Check .env file
    env_file = project_root / ".env"
    if env_file.is_file():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("DATABASE_URL="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val.startswith("file:"):
                            rel_path = val[5:]
                            return (project_root / rel_path).resolve()
        except Exception:
            pass

    # Common defaults
    for candidate in [project_root / "dev.db", project_root / "prisma" / "dev.db"]:
        if candidate.is_file():
            return candidate

    return project_root / "dev.db"


def resolve_uploads_dir(project_root: Path, custom_dir: Optional[str] = None) -> Path:
    """Resolves uploads directory path from argument or default."""
    if custom_dir:
        p = Path(custom_dir)
        return p if p.is_absolute() else project_root / p
    return project_root / "uploads"


def normalize_image_filename(img_val: Optional[str]) -> Optional[str]:
    """Extracts base filename from stored image path or URL."""
    if not img_val:
        return None
    val = img_val.strip()
    if not val:
        return None

    # Handle full URLs (e.g. http://localhost:3000/uploads/foo.jpg)
    if "://" in val:
        parsed = urlparse(val)
        val = parsed.path

    # URL decode (e.g. %20 -> space)
    val = unquote(val)

    # Normalize slashes and extract filename
    val = val.replace("\\", "/")
    filename = val.split("/")[-1]
    return filename if filename else None


def format_bytes(size: int) -> str:
    """Formats bytes into human readable size."""
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.2f} KB"
    elif size < 1024 * 1024 * 1024:
        return f"{size / (1024 * 1024):.2f} MB"
    return f"{size / (1024 * 1024 * 1024):.2f} GB"


class ImageScanner:
    def __init__(self, db_path: Path, uploads_dir: Path):
        self.db_path = db_path
        self.uploads_dir = uploads_dir

    def scan(self) -> Dict[str, Any]:
        if not self.db_path.is_file():
            raise FileNotFoundError(f"Database not found at: {self.db_path}")
        if not self.uploads_dir.is_dir():
            raise FileNotFoundError(f"Uploads directory not found at: {self.uploads_dir}")

        # Open in read-only mode so SQLite doesn't touch the DB file or WAL
        db_uri = f"file:{self.db_path.resolve().as_posix()}?mode=ro"
        try:
            conn = sqlite3.connect(db_uri, uri=True)
        except sqlite3.OperationalError:
            conn = sqlite3.connect(str(self.db_path))

        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Target fields mapping
        # table -> (primary_key, label_column, image_column, user_fk_column, schema_lines)
        target_tables = [
            {
                "table": "Profile",
                "pk": "userId",
                "label_col": "userName",
                "image_col": "profileImage",
                "user_fk": "userId",
                "schema_ref": "prisma/schema.prisma:193-194",
            },
            {
                "table": "Bulletin",
                "pk": "id",
                "label_col": "title",
                "image_col": "bulletinImage",
                "user_fk": "authorId",
                "schema_ref": "prisma/schema.prisma:231-232",
            },
            {
                "table": "Event",
                "pk": "id",
                "label_col": "title",
                "image_col": "eventImage",
                "user_fk": "authorId",
                "schema_ref": "prisma/schema.prisma:269-270",
            },
        ]

        # 1. Read files physically present in uploads directory
        disk_files: Dict[str, Dict[str, Any]] = {}
        for entry in self.uploads_dir.iterdir():
            if entry.is_file():
                stat = entry.stat()
                disk_files[entry.name] = {
                    "filename": entry.name,
                    "path": str(entry.resolve()),
                    "size_bytes": stat.st_size,
                    "size_formatted": format_bytes(stat.st_size),
                    "modified_at": datetime.datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "is_user_upload": entry.name.startswith("upload-"),
                }

        # 2. Query DB image records and check against disk
        db_records_with_image: List[Dict[str, Any]] = []
        referenced_filenames: Set[str] = set()
        filename_usage_count: Dict[str, int] = {}
        broken_db_references: List[Dict[str, Any]] = []
        relational_orphans: List[Dict[str, Any]] = []

        table_stats = {}

        for cfg in target_tables:
            tbl = cfg["table"]
            pk = cfg["pk"]
            lbl = cfg["label_col"]
            img_col = cfg["image_col"]
            user_fk = cfg["user_fk"]
            schema_ref = cfg["schema_ref"]

            # Check table existence
            table_check = cur.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (tbl,)
            ).fetchone()
            if not table_check:
                table_stats[tbl] = {"error": "Table does not exist"}
                continue

            # Query all records
            query = f"SELECT {pk} AS record_id, {lbl} AS record_label, {img_col} AS image_val, {user_fk} AS user_fk FROM {tbl}"
            rows = cur.execute(query).fetchall()

            total_records = len(rows)
            with_img_records = 0
            missing_file_count = 0

            for row in rows:
                img_val = row["image_val"]
                if not img_val or not str(img_val).strip():
                    continue

                with_img_records += 1
                fname = normalize_image_filename(img_val)
                file_exists = False
                disk_path = None

                if fname:
                    referenced_filenames.add(fname)
                    filename_usage_count[fname] = filename_usage_count.get(fname, 0) + 1
                    target_file = self.uploads_dir / fname
                    if target_file.is_file():
                        file_exists = True
                        disk_path = str(target_file.resolve())

                rec_info = {
                    "table": tbl,
                    "schema_ref": schema_ref,
                    "record_id": str(row["record_id"]),
                    "label": str(row["record_label"]),
                    "image_value": str(img_val),
                    "extracted_filename": fname,
                    "file_exists_on_disk": file_exists,
                    "disk_path": disk_path,
                }
                db_records_with_image.append(rec_info)

                if not file_exists:
                    missing_file_count += 1
                    broken_db_references.append(rec_info)

            # Check relational orphans (rows with image where user_fk does not exist in User)
            rel_query = f"""
                SELECT T.{pk} AS record_id, T.{lbl} AS record_label, T.{img_col} AS image_val, T.{user_fk} AS user_fk
                FROM {tbl} T
                LEFT JOIN User U ON T.{user_fk} = U.id
                WHERE T.{img_col} IS NOT NULL AND TRIM(T.{img_col}) != '' AND U.id IS NULL
            """
            try:
                rel_rows = cur.execute(rel_query).fetchall()
                for rrow in rel_rows:
                    relational_orphans.append({
                        "table": tbl,
                        "schema_ref": schema_ref,
                        "record_id": str(rrow["record_id"]),
                        "label": str(rrow["record_label"]),
                        "image_value": str(rrow["image_val"]),
                        "user_fk": str(rrow["user_fk"]),
                        "reason": f"Foreign key '{user_fk}' ({rrow['user_fk']}) has no matching User record",
                    })
            except Exception as e:
                # If User table is missing or query fails
                pass

            table_stats[tbl] = {
                "schema_ref": schema_ref,
                "total_records": total_records,
                "records_with_image": with_img_records,
                "missing_file_references": missing_file_count,
            }

        conn.close()

        # 3. Categorize disk files
        orphaned_user_uploads: List[Dict[str, Any]] = []
        unreferenced_static_assets: List[Dict[str, Any]] = []
        referenced_files: List[Dict[str, Any]] = []

        for fname, finfo in disk_files.items():
            if fname in referenced_filenames:
                finfo["db_reference_count"] = filename_usage_count.get(fname, 0)
                referenced_files.append(finfo)
            else:
                if finfo["is_user_upload"]:
                    orphaned_user_uploads.append(finfo)
                else:
                    unreferenced_static_assets.append(finfo)

        # Sort lists
        orphaned_user_uploads.sort(key=lambda x: x["filename"])
        unreferenced_static_assets.sort(key=lambda x: x["filename"])
        broken_db_references.sort(key=lambda x: (x["table"], x["label"]))

        total_orphaned_bytes = sum(x["size_bytes"] for x in orphaned_user_uploads)
        total_static_unref_bytes = sum(x["size_bytes"] for x in unreferenced_static_assets)
        total_disk_bytes = sum(x["size_bytes"] for x in disk_files.values())

        return {
            "metadata": {
                "scan_time": datetime.datetime.now().isoformat(),
                "db_path": str(self.db_path.resolve()),
                "uploads_dir": str(self.uploads_dir.resolve()),
                "fields_scanned": [
                    "Profile.profileImage (prisma/schema.prisma:193-194)",
                    "Bulletin.bulletinImage (prisma/schema.prisma:231-232)",
                    "Event.eventImage (prisma/schema.prisma:269-270)",
                ],
            },
            "summary": {
                "total_disk_files": len(disk_files),
                "total_disk_size": format_bytes(total_disk_bytes),
                "referenced_files_count": len(referenced_files),
                "orphaned_user_uploads_count": len(orphaned_user_uploads),
                "orphaned_user_uploads_size": format_bytes(total_orphaned_bytes),
                "orphaned_user_uploads_bytes": total_orphaned_bytes,
                "unreferenced_static_assets_count": len(unreferenced_static_assets),
                "unreferenced_static_assets_size": format_bytes(total_static_unref_bytes),
                "broken_db_references_count": len(broken_db_references),
                "relational_orphans_count": len(relational_orphans),
                "table_stats": table_stats,
            },
            "broken_db_references": broken_db_references,
            "relational_orphans": relational_orphans,
            "orphaned_user_uploads": orphaned_user_uploads,
            "unreferenced_static_assets": unreferenced_static_assets,
            "referenced_files": referenced_files,
        }


def print_cli_report(results: Dict[str, Any], verbose: bool = False, filter_mode: str = "all") -> None:
    meta = results["metadata"]
    summary = results["summary"]
    table_stats = summary["table_stats"]

    print("=" * 80)
    print(" 🔍 SD3 ALUMNI - ORPHANED IMAGE & DATABASE SCANNER REPORT")
    print("=" * 80)
    print(f" Database:     {meta['db_path']}")
    print(f" Uploads Dir:  {meta['uploads_dir']}")
    print(f" Scanned At:   {meta['scan_time']}")
    print(" Fields:       Profile.profileImage, Bulletin.bulletinImage, Event.eventImage")
    print("-" * 80)

    # 1. Summary by table
    print("\n📊 DATABASE FIELD STATISTICS:")
    header = f" {'Table':<12} | {'Schema Ref':<32} | {'Total':<7} | {'With Image':<11} | {'Broken Refs':<11}"
    print(header)
    print(" " + "-" * (len(header) - 1))
    for tbl, s in table_stats.items():
        if "error" in s:
            print(f" {tbl:<12} | {s['error']}")
        else:
            print(
                f" {tbl:<12} | {s['schema_ref']:<32} | {s['total_records']:<7} | {s['records_with_image']:<11} | {s['missing_file_references']:<11}"
            )

    # 2. Storage summary
    print("\n📁 STORAGE SCAN SUMMARY:")
    print(f"  • Total files in uploads/               : {summary['total_disk_files']} ({summary['total_disk_size']})")
    print(f"  • Active files referenced in DB         : {summary['referenced_files_count']}")
    print(f"  • Orphaned user uploads (upload-*)      : {summary['orphaned_user_uploads_count']} ({summary['orphaned_user_uploads_size']} reclaimable)")
    print(f"  • Unreferenced static assets (UI/theme) : {summary['unreferenced_static_assets_count']} ({summary['unreferenced_static_assets_size']})")

    # 3. Broken Database References (Dangling records)
    broken = results["broken_db_references"]
    print(f"\n❌ BROKEN DB REFERENCES (Files missing from disk): {len(broken)}")
    if broken:
        for idx, item in enumerate(broken, 1):
            print(f"  [{idx}] [{item['table']}] ID: {item['record_id']} | Label: \"{item['label']}\"")
            print(f"      Stored URL:     {item['image_value']}")
            print(f"      Missing file:   {item['extracted_filename']}")
            print(f"      Schema field:   {item['schema_ref']}")
    else:
        print("  ✓ No broken image references found in database records.")

    # 4. Relational Orphans (Images attached to non-existent Users)
    rel_orphans = results["relational_orphans"]
    print(f"\n⚠️  RELATIONAL ORPHANS (Records with images without valid User): {len(rel_orphans)}")
    if rel_orphans:
        for idx, item in enumerate(rel_orphans, 1):
            print(f"  [{idx}] [{item['table']}] ID: {item['record_id']} | \"{item['label']}\"")
            print(f"      Reason: {item['reason']}")
            print(f"      Image:  {item['image_value']}")
    else:
        print("  ✓ No relational orphans found (all image records link to valid users).")

    # 5. Orphaned User Uploads
    orphaned_uploads = results["orphaned_user_uploads"]
    if filter_mode in ("all", "uploads-only"):
        print(f"\n🗑️  ORPHANED USER UPLOADS ({len(orphaned_uploads)} files, {summary['orphaned_user_uploads_size']}):")
        print("   (These are dynamic uploads not linked to any Profile, Bulletin, or Event)")
        if orphaned_uploads:
            display_items = orphaned_uploads if verbose else orphaned_uploads[:15]
            for idx, item in enumerate(display_items, 1):
                print(f"  {idx:2d}. {item['filename']:<50} {item['size_formatted']:>10}  (modified: {item['modified_at'][:19]})")
            if not verbose and len(orphaned_uploads) > 15:
                print(f"  ... and {len(orphaned_uploads) - 15} more files. Use --verbose to view all.")
        else:
            print("  ✓ No orphaned user uploads found in uploads/.")

    # 6. Unreferenced Static Assets
    unref_static = results["unreferenced_static_assets"]
    if filter_mode in ("all", "static-only"):
        print(f"\n🎨 UNREFERENCED STATIC / PRESET ASSETS ({len(unref_static)} files, {summary['unreferenced_static_assets_size']}):")
        print("   (Preset images or UI assets stored in uploads/ but not referenced in the 3 DB columns)")
        if unref_static:
            display_items = unref_static if verbose else unref_static[:15]
            for idx, item in enumerate(display_items, 1):
                print(f"  {idx:2d}. {item['filename']:<35} {item['size_formatted']:>10}  (modified: {item['modified_at'][:19]})")
            if not verbose and len(unref_static) > 15:
                print(f"  ... and {len(unref_static) - 15} more files. Use --verbose to view all.")
        else:
            print("  ✓ All static files in uploads/ are referenced.")

    print("\n" + "=" * 80)
    print("💡 RECOMMENDATIONS:")
    if broken:
        print(f"  • Fix {len(broken)} broken database reference(s) by updating or setting the image field to NULL/fallback.")
    if orphaned_uploads:
        print(f"  • Reclaim {summary['orphaned_user_uploads_size']} of disk space by moving {len(orphaned_uploads)} orphaned user uploads to the Recycle Bin.")
        print("    Run with: python script/scan_orphaned_images.py --recycle-orphans --dry-run")
        print("    Or confirm: python script/scan_orphaned_images.py --recycle-orphans --confirm")
    if not broken and not orphaned_uploads:
        print("  • Database image references and disk uploads are clean and synchronized!")
    print("=" * 80)


def move_orphans_to_recycle_bin(
    orphaned_uploads: List[Dict[str, Any]],
    dry_run: bool = True,
    permanent: bool = False,
) -> None:
    """Moves orphaned upload-* files to the Recycle Bin via send2trash (or permanently deletes if permanent=True)."""
    if not orphaned_uploads:
        print("No orphaned user uploads to process.")
        return

    total_bytes = sum(x["size_bytes"] for x in orphaned_uploads)
    action_noun = "permanently delete" if permanent else "move to Recycle Bin"
    action_verb = "PERMANENTLY DELETING" if permanent else "MOVING TO RECYCLE BIN"
    tag = "DELETE" if permanent else "RECYCLE"

    print("\n" + ("=" * 65))
    if dry_run:
        print(f"DRY RUN: Would {action_noun} {len(orphaned_uploads)} orphaned file(s) ({format_bytes(total_bytes)})")
        for item in orphaned_uploads[:10]:
            print(f"  [DRY-RUN {tag}] {item['filename']} ({item['size_formatted']})")
        if len(orphaned_uploads) > 10:
            print(f"  ... and {len(orphaned_uploads) - 10} more files.")
        print(f"\nTo actually {action_noun} these files, pass --confirm (without --dry-run).")
    else:
        print(f"{action_verb} {len(orphaned_uploads)} orphaned file(s) ({format_bytes(total_bytes)})...")
        success_count = 0
        success_bytes = 0
        failed_count = 0

        for item in orphaned_uploads:
            p = Path(item["path"])
            if not p.is_file():
                continue

            if permanent:
                try:
                    p.unlink()
                    success_count += 1
                    success_bytes += item["size_bytes"]
                    print(f"  [DELETED] {item['filename']}")
                except Exception as err:
                    failed_count += 1
                    print(f"  [FAILED] Could not delete {item['filename']}: {err}")
            else:
                try:
                    send2trash.send2trash(str(p.resolve()))
                    success_count += 1
                    success_bytes += item["size_bytes"]
                    print(f"  [MOVED TO RECYCLE BIN] {item['filename']}")
                except Exception as err:
                    failed_count += 1
                    print(f"  [FAILED] Could not recycle {item['filename']}: {err}")

        print("-" * 65)
        action_done = "Permanently deleted" if permanent else "Moved to Recycle Bin"
        print(f"Summary: {action_done} {success_count} file(s) ({format_bytes(success_bytes)}). Failed: {failed_count}.")
    print("=" * 65)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scan SD3 Alumni Database & Storage for orphaned images and broken references."
    )
    parser.add_argument(
        "--db",
        type=str,
        default=None,
        help="Path to SQLite database file (default: auto-detected from .env or dev.db)",
    )
    parser.add_argument(
        "--uploads-dir",
        type=str,
        default=None,
        help="Path to uploads directory (default: project_root/uploads)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output scan results as JSON to stdout",
    )
    parser.add_argument(
        "--export",
        type=str,
        default=None,
        help="Export results to specified JSON file path",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show detailed lists of all files and records without truncation",
    )
    parser.add_argument(
        "--filter",
        choices=["all", "uploads-only", "static-only"],
        default="all",
        help="Filter display of unreferenced files (default: all)",
    )
    parser.add_argument(
        "--recycle-orphans", "--delete-orphans",
        dest="recycle_orphans",
        action="store_true",
        help="Move unreferenced user uploads (upload-* files) to the Recycle Bin",
    )
    parser.add_argument(
        "--permanent",
        action="store_true",
        help="Permanently delete files with unlink() instead of moving to Recycle Bin (use with caution)",
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Confirm moving orphaned files to the Recycle Bin (disables dry-run)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview moving files to Recycle Bin without making changes (default safety mode)",
    )

    args = parser.parse_args()

    project_root = find_project_root()
    db_path = resolve_db_path(project_root, args.db)
    uploads_dir = resolve_uploads_dir(project_root, args.uploads_dir)

    try:
        scanner = ImageScanner(db_path=db_path, uploads_dir=uploads_dir)
        results = scanner.scan()
    except Exception as e:
        print(f"Error during scan: {e}", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_cli_report(results, verbose=args.verbose, filter_mode=args.filter)

    if args.export:
        export_path = Path(args.export)
        if not export_path.is_absolute():
            export_path = project_root / export_path
        try:
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=2)
            print(f"\n[OK] Successfully exported full scan report to: {export_path}")
        except Exception as e:
            print(f"\n[ERROR] Failed to export report to {export_path}: {e}", file=sys.stderr)

    if args.recycle_orphans:
        dry_run = not args.confirm or args.dry_run
        move_orphans_to_recycle_bin(
            results["orphaned_user_uploads"],
            dry_run=dry_run,
            permanent=args.permanent,
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
