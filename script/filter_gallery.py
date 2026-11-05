#!/usr/bin/env python3
"""
Gallery Album Discrimination & Blacklist Automation Script.

Filters gallery albums per page based on four criteria:
1. empty: Album folder has 0 images (detected locally).
2. lowres: Images with resolution lower than SD (< 640x480) (detected locally).
3. pubmat: Publication material / infographics (detected via Cloudflare Clef Flash).
4. portrait: Officer introduction portraits (detected via Cloudflare Clef Flash).

Usage:
  python script/filter_gallery.py --page page_8
  python script/filter_gallery.py 8 --threshold 0.88 --delay 2.0
  python script/filter_gallery.py --yolo
"""

import argparse
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import time
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

# Root paths
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
GALLERY_DIR = REPO_ROOT / "gallery"
DOCS_REVIEW_DIR = REPO_ROOT / "docs" / "gallery_review"
DOCS_REVIEW_DIR.mkdir(parents=True, exist_ok=True)


def get_image_dimensions(file_path: Path) -> Optional[Tuple[int, int]]:
    """Reads image dimensions (width, height) locally from file header without extra dependencies."""
    try:
        with open(file_path, "rb") as f:
            data = f.read(1024 * 1024)
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            w, h = struct.unpack(">II", data[16:24])
            return w, h
        if data.startswith(b"\xff\xd8"):
            idx = 2
            while idx < len(data):
                if data[idx] != 0xFF:
                    idx += 1
                    continue
                marker = data[idx + 1]
                if marker in (0xC0, 0xC1, 0xC2, 0xC3):
                    h, w = struct.unpack(">HH", data[idx + 5 : idx + 9])
                    return w, h
                elif marker in (0xD9, 0xDA):
                    break
                else:
                    length = struct.unpack(">H", data[idx + 2 : idx + 4])[0]
                    idx += 2 + length
        if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
            if data[12:16] == b"VP8 ":
                w, h = struct.unpack("<HH", data[26:30])
                return w & 0x3FFF, h & 0x3FFF
            elif data[12:16] == b"VP8L":
                b = struct.unpack("<I", data[21:25])[0]
                return 1 + (b & 0x3FFF), 1 + ((b >> 14) & 0x3FFF)
            elif data[12:16] == b"VP8X":
                w = 1 + struct.unpack("<I", data[24:27] + b"\x00")[0]
                h = 1 + struct.unpack("<I", data[27:30] + b"\x00")[0]
                return w, h
    except Exception:
        pass
    return None


def is_lowres(width: int, height: int) -> bool:
    """Checks whether image resolution is lower than SD (640x480)."""
    return (width < 640 and height < 480) or (width * height < 640 * 480)


def compress_images_sharp(image_paths: List[Path]) -> List[str]:
    """
    Compresses images to max 512x512 WebP (quality 80) using Sharp in Node,
    matching the auto-moderation pipeline in api/index.js.
    """
    if not image_paths:
        return []
    paths_json = json.dumps([str(p) for p in image_paths])
    node_script = f"""
    const sharp = require('sharp');
    const paths = {paths_json};
    Promise.all(paths.map(p => 
        sharp(p)
          .resize({{ width: 512, height: 512, fit: 'inside', withoutEnlargement: true }})
          .webp({{ quality: 80 }})
          .toBuffer()
          .then(buf => buf.toString('base64'))
    ))
    .then(b64s => process.stdout.write(JSON.stringify(b64s)))
    .catch(err => {{ process.stderr.write(err.message); process.exit(1); }});
    """
    res = subprocess.run(
        ["node", "-e", node_script],
        capture_output=True,
        text=True,
        cwd=str(REPO_ROOT),
    )
    if res.returncode != 0:
        raise RuntimeError(f"Sharp image compression failed: {res.stderr}")
    return json.loads(res.stdout)


def call_clef_decision(base64_images: List[str]) -> Dict[str, Any]:
    """
    Invokes Cloudflare Clef Flash decision model using cf CLI
    to discriminate between 'pubmat' and 'portrait'.
    
    NOTE: Schema refinement is intentionally not applied because the process
    benefits from false positives on borderline images to strictly filter out
    non-standard gallery content.
    """
    cf_bin = shutil.which("cf") or "cf"
    imgs = [{"content_type": "image/webp", "base64": b64} for b64 in base64_images]
    payload = {
        "model": "clef-flash",
        "state": (
            "We are filtering Facebook photo albums from university student organizations. "
            "Normal valid albums contain candid photos, group activities, competitions, seminars, and events. "
            "We want to detect albums that are either publication materials (infographics, posters, flyers) "
            "or officer introduction portrait sets (solo headshot/portrait photos of each executive officer). "
            "Review the provided album sample images and classify which blacklist category this album belongs to."
        ),
        "images": imgs,
        "questions": {
            "category": {
                "type": "choice",
                "instructions": "Which blacklist category best describes this album?",
                "criteria": {
                    "pubmat": "Publication materials, infographics, flyers, announcements, or posters.",
                    "portrait": "Officer introduction portraits: solo posed portraits/headshots of executive committee officers."
                },
            }
        },
    }

    temp_json = DOCS_REVIEW_DIR / f"temp_payload_{os.getpid()}.json"
    try:
        with open(temp_json, "w") as f:
            json.dump(payload, f)

        cmd = [cf_bin, "ai", "run", "@cf/cloudflare/clef-flash", "--body", f"@{temp_json}"]
        res = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        if res.returncode != 0:
            raise RuntimeError(f"cf CLI inference failed: {res.stderr or res.stdout}")

        out = json.loads(res.stdout)
        ans = out["answers"]["category"]
        if "usage" in out:
            ans["usage"] = out["usage"]
        return ans
    finally:
        if temp_json.exists():
            temp_json.unlink(missing_ok=True)


def parse_page_arg(page_val: str) -> str:
    """Normalizes page argument (e.g. '8', 'page_8') to 'page_8'."""
    clean = page_val.strip().lower()
    if clean.isdigit():
        return f"page_{clean}"
    if clean.startswith("page_"):
        return clean
    match = re.search(r"\d+", clean)
    if match:
        return f"page_{match.group(0)}"
    raise ValueError(f"Invalid page name format: '{page_val}'. Expected e.g. 'page_8' or '8'.")


def process_single_page(
    page_name: str,
    page_dir: Path,
    threshold: float,
    delay: float,
    samples: int,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Processes all albums within a single page directory."""
    print(f"\n============================================================")
    print(f" Processing Gallery Page: {page_name}")
    print(f" Path: {page_dir}")
    print(f" Threshold: {threshold} | Delay: {delay}s | Samples: {samples}")
    print(f"============================================================")

    album_dirs = [d for d in page_dir.iterdir() if d.is_dir() and d.name.startswith("album_")]
    album_dirs.sort(key=lambda d: int(d.name.split("_")[1]) if d.name.split("_")[1].isdigit() else 999)

    if not album_dirs:
        print(f"No albums found in {page_dir}.")
        return {"total": 0, "blacklisted": 0, "entries": []}

    blacklist_entries: List[Tuple[int, str]] = []
    audit_logs: List[Dict[str, Any]] = []

    for idx, adir in enumerate(album_dirs):
        alb_num = int(adir.name.split("_")[1])
        files = [f for f in adir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")]
        files.sort(key=lambda f: int(f.stem.split("_")[1]) if "_" in f.stem and f.stem.split("_")[1].isdigit() else f.name)

        progress_str = f"[{idx + 1}/{len(album_dirs)}] {adir.name} ({len(files)} files)"

        # 1. Check EMPTY locally
        if len(files) == 0:
            print(f"{progress_str} -> EMPTY (tagged locally)")
            blacklist_entries.append((alb_num, "empty"))
            audit_logs.append({
                "album": alb_num,
                "status": "blacklisted",
                "tag": "empty",
                "method": "local",
                "details": "0 files in album directory"
            })
            continue

        # 2. Check LOWRES locally
        lowres_file = None
        for f in files:
            dims = get_image_dimensions(f)
            if dims and is_lowres(*dims):
                lowres_file = (f.name, dims)
                break

        if lowres_file:
            print(f"{progress_str} -> LOWRES (tagged locally: {lowres_file[0]} {lowres_file[1]})")
            blacklist_entries.append((alb_num, "lowres"))
            audit_logs.append({
                "album": alb_num,
                "status": "blacklisted",
                "tag": "lowres",
                "method": "local",
                "details": f"{lowres_file[0]} dims: {lowres_file[1]}"
            })
            continue

        # 3. Decision Model via Cloudflare Clef Flash
        num_samples = min(4, max(1, samples))
        step = max(1, len(files) // num_samples)
        sampled_files = files[::step][:num_samples]

        try:
            compressed_b64s = compress_images_sharp(sampled_files)
            decision = call_clef_decision(compressed_b64s)
            probs = decision.get("probabilities", {})
            choice = decision.get("choice", "")
            choice_prob = probs.get(choice, 0.0)
            confidence = decision.get("confidence", 0.0)
            usage = decision.get("usage", {})

            if choice_prob >= threshold:
                print(f"{progress_str} -> Clef choice: {choice} ({choice_prob:.4f} >= {threshold}) -> BLACKLISTED [{choice}]")
                blacklist_entries.append((alb_num, choice))
                audit_logs.append({
                    "album": alb_num,
                    "status": "blacklisted",
                    "tag": choice,
                    "method": "clef-flash",
                    "probability": choice_prob,
                    "confidence": confidence,
                    "probabilities": probs,
                    "usage": usage,
                    "sampled": [f.name for f in sampled_files]
                })
            else:
                print(f"{progress_str} -> Clef choice: {choice} ({choice_prob:.4f} < {threshold}) -> KEPT (VALID)")
                audit_logs.append({
                    "album": alb_num,
                    "status": "kept",
                    "tag": None,
                    "method": "clef-flash",
                    "probability": choice_prob,
                    "confidence": confidence,
                    "probabilities": probs,
                    "usage": usage,
                    "sampled": [f.name for f in sampled_files]
                })
        except Exception as e:
            print(f"{progress_str} -> ERROR calling Clef Flash: {e}")
            audit_logs.append({
                "album": alb_num,
                "status": "error",
                "error": str(e),
                "sampled": [f.name for f in sampled_files]
            })

        # Pacing: rate limit protection
        if delay > 0 and (idx + 1) < len(album_dirs):
            time.sleep(delay)

    # Sort blacklist by album ID
    blacklist_entries.sort(key=lambda x: x[0])

    print(f"\nSummary for {page_name}: Total {len(album_dirs)} albums, {len(blacklist_entries)} blacklisted.")

    # Save to BLACKLIST.csv in target page directory
    blacklist_csv = page_dir / "BLACKLIST.csv"
    if not dry_run:
        with open(blacklist_csv, "w", newline="", encoding="utf-8") as f:
            f.write("album,tag\n")
            for alb, tag in blacklist_entries:
                f.write(f"{alb},{tag}\n")
        print(f"Written: {blacklist_csv}")
    else:
        print(f"[DRY-RUN] Skipped writing to {blacklist_csv}")

    # Save audit log to docs/gallery_review/
    audit_file = DOCS_REVIEW_DIR / f"{page_name}_review_log.json"
    with open(audit_file, "w", encoding="utf-8") as f:
        json.dump({
            "page": page_name,
            "threshold": threshold,
            "delay": delay,
            "total_albums": len(album_dirs),
            "blacklisted_count": len(blacklist_entries),
            "blacklist": [{"album": a, "tag": t} for a, t in blacklist_entries],
            "audit_logs": audit_logs
        }, f, indent=2)
    print(f"Audit log saved: {audit_file}")

    return {
        "page": page_name,
        "total": len(album_dirs),
        "blacklisted": len(blacklist_entries),
        "entries": blacklist_entries
    }


def confirm_yolo_mode(total_albums: int, num_pages: int, force: bool = False) -> bool:
    """
    Displays three warnings with increasing intensity regarding Cloudflare API credits,
    requiring explicit confirmation to proceed with YOLO mode.
    """
    print("\n" + "=" * 78)
    print(" [WARNING 1/3] -- MULTI-PAGE BATCH INFERENCE INITIATION")
    print("=" * 78)
    print(f"You have triggered YOLO mode across ALL {num_pages} gallery pages ({total_albums} total albums).")
    print(f"This batch run will submit hundreds of automated image embedding requests to")
    print(f"Cloudflare Workers AI (@cf/cloudflare/clef-flash).")
    print(f"Every non-empty, non-SD album will trigger Sharp WebP compression and inference calls.")
    print("=" * 78)
    time.sleep(1.5)

    print("\n" + "#" * 78)
    print(" [WARNING 2/3] -- CLOUDFLARE API CREDITS & RATE LIMIT DEPLETION HAZARD")
    print("#" * 78)
    print(f"CRITICAL CREDIT CONSUMPTION NOTICE:")
    print(f"* Total albums to process: {total_albums}")
    print(f"* Estimated Clef Flash API calls: ~200 - 240 requests")
    print(f"* Estimated input tokens: 150,000 - 220,000+ neural tokens")
    print(f"* Target Cloudflare Account: 33758f8f43835b54fe574adeef803417")
    print(f"* Estimated runtime: 8 to 15 minutes (with rate-limiting pacing delays)")
    print(f"Executing this operation will consume real Cloudflare Workers AI neuron credits,")
    print(f"risks exhausting account daily/monthly quotas, and could trigger edge 429 rate limits.")
    print("#" * 78)
    time.sleep(2.0)

    print("\n" + "!" * 78)
    print(" [WARNING 3/3] -- FINAL IRREVERSIBLE EXECUTION CONFIRMATION")
    print("!" * 78)
    print(f"DANGER: Proceeding will execute batch classification across all pages in gallery/.")
    print(f"All existing and newly generated BLACKLIST.csv files across pages will be OVERWRITTEN.")
    print(f"API credit expenditure will begin immediately and cannot be refunded.")
    print("!" * 78 + "\n")

    if force:
        print("[FORCE MODE ACTIVATED] Automatic confirmation via --force. Proceeding in 3 seconds...")
        time.sleep(3.0)
        return True

    # Interactive confirmation
    if not sys.stdin.isatty():
        print("Non-interactive session detected without --force flag. Aborting YOLO run for safety.")
        print("To run unattended, pass --force alongside --yolo.")
        return False

    prompt = input("To accept the API credit cost and execute YOLO mode, type 'YOLO' and press Enter: ")
    if prompt.strip().upper() == "YOLO":
        print("\nConfirmation accepted. Starting YOLO batch processing across all pages...\n")
        return True
    else:
        print("\nAborted by user. No API calls were made and no credits were consumed.")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Filter gallery albums for a page (or all pages via --yolo) and generate BLACKLIST.csv",
        add_help=True,
    )
    parser.add_argument(
        "--page",
        "-p",
        dest="page",
        required=False,
        default=None,
        help="Target page directory to inspect (e.g. 'page_8' or '8'). Required unless --yolo is set.",
    )
    parser.add_argument(
        "positional_page",
        nargs="?",
        default=None,
        help="Optional positional argument for page (e.g. 'page_8').",
    )
    parser.add_argument(
        "--yolo",
        action="store_true",
        help="YOLO mode: Iterates sequentially through all pages in the gallery directory.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force execution of YOLO mode without interactive confirmation prompt.",
    )
    parser.add_argument(
        "--threshold",
        "-t",
        type=float,
        default=0.88,
        help="Probability threshold to blacklist an album (default: 0.88).",
    )
    parser.add_argument(
        "--delay",
        "-d",
        type=float,
        default=2.0,
        help="Delay in seconds between decision model requests to prevent service abuse (default: 2.0).",
    )
    parser.add_argument(
        "--samples",
        "-s",
        type=int,
        default=4,
        help="Number of images to sample per album for embedding (max 4, default: 4).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run discrimination without writing BLACKLIST.csv.",
    )

    args = parser.parse_args()

    # Discover all pages
    all_pages = [d for d in GALLERY_DIR.iterdir() if d.is_dir() and d.name.startswith("page_")]
    all_pages.sort(key=lambda d: int(d.name.split("_")[1]) if d.name.split("_")[1].isdigit() else 999)

    # Check for YOLO mode
    if args.yolo:
        total_albums = 0
        for p in all_pages:
            dirs = [d for d in p.iterdir() if d.is_dir() and d.name.startswith("album_")]
            total_albums += len(dirs)

        confirmed = confirm_yolo_mode(total_albums, len(all_pages), force=args.force)
        if not confirmed:
            sys.exit(0)

        global_results = []
        for p in all_pages:
            res = process_single_page(
                page_name=p.name,
                page_dir=p,
                threshold=args.threshold,
                delay=args.delay,
                samples=args.samples,
                dry_run=args.dry_run,
            )
            global_results.append(res)

        print("\n" + "=" * 78)
        print(" YOLO BATCH COMPLETED ACROSS ALL PAGES")
        print("=" * 78)
        total_inspected = sum(r["total"] for r in global_results)
        total_blacklisted = sum(r["blacklisted"] for r in global_results)
        print(f"Total Albums Inspected Across All Pages: {total_inspected}")
        print(f"Total Albums Blacklisted: {total_blacklisted}")
        for r in global_results:
            print(f"  • {r['page']}: {r['blacklisted']}/{r['total']} blacklisted")
        print("=" * 78)
        sys.exit(0)

    # Single-page mode: requires argument, no default
    raw_page = args.page or args.positional_page
    if not raw_page:
        print("ERROR: A target page or --yolo must be specified. The script has no default and requires an argument from the user.", file=sys.stderr)
        print("Example usage:\n  python script/filter_gallery.py --page page_8\n  python script/filter_gallery.py 8\n  python script/filter_gallery.py --yolo", file=sys.stderr)
        sys.exit(1)

    try:
        page_name = parse_page_arg(raw_page)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    page_dir = GALLERY_DIR / page_name
    if not page_dir.exists() or not page_dir.is_dir():
        print(f"ERROR: Page directory '{page_dir}' does not exist.", file=sys.stderr)
        sys.exit(1)

    process_single_page(
        page_name=page_name,
        page_dir=page_dir,
        threshold=args.threshold,
        delay=args.delay,
        samples=args.samples,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    main()
