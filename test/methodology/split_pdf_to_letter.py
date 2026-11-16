#!/usr/bin/env python3
"""
split_pdf_to_letter.py
----------------------
Splits continuous or oversized JMeter HTML/PDF report pages into standard
printable US Letter-sized pages (8.5 x 11 in) with clean section/chart breaks.

Features:
- Scales page width to printable Letter width with margins.
- Enforces clean page breaks between major chart panels:
    * Page break after 'Response Time Percentiles Over Time' (starts 'Active Threads Over Time' on new page).
    * Page break before 'Connect Time Over Time' (preserves the full connect time graph).
    * Page break after 'Response Time Vs Request' (starts 'Latency Vs Request' cleanly on a new page).
    * Preserves chart boundaries across all Over Time and Throughput sections.

Requirements:
    pypdf >= 3.0.0 (run with `uv run --with pypdf python ...` or `pip install pypdf`)

Usage:
    python split_pdf_to_letter.py [input_pdf] [output_pdf] [--margin MARGIN_PT]

Example:
    uv run --with pypdf test/methodology/split_pdf_to_letter.py docs/90/jmeter_report.pdf docs/90/jmeter_report_letter.pdf
"""

import argparse
import copy
import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter, Transformation
    from pypdf.generic import RectangleObject
except ImportError:
    print(
        "Error: pypdf is required. Run via 'uv run --with pypdf ...' or 'pip install pypdf'.",
        file=sys.stderr,
    )
    sys.exit(1)

# Letter dimensions in PDF points (72 points per inch)
LETTER_W = 612.0  # 8.5 inches
LETTER_H = 792.0  # 11.0 inches

# Specialized boundary cuts per original report page (y-coordinates measured from bottom)
# Designed for standard JMeter dashboard reports to avoid chart truncation:
#   Page 1 (Over Time):
#     - 2145.0: Break after 'Response Time Percentiles Over Time'
#     - 1290.0: Break after 'Bytes Throughput Over Time'
#     - 690.0:  Break after 'Latencies Over Time' (keeps 'Connect Time Over Time' intact)
#   Page 2 (Throughput & Response Time vs Request):
#     - 2000.0: Break after 'Codes Per Second'
#     - 1380.0: Break after 'Transactions Per Second'
#     - 515.0:  Break after 'Response Time Vs Request' (keeps 'Latency Vs Request' intact)
#   Page 3 (Distribution & Overview):
#     - 1520.0: Break after 'Response Time Overview'
#     - 720.0:  Break after 'Time Vs Threads' (keeps 'Response Time Distribution' intact)
DEFAULT_PAGE_CUTS = {
    1: [2145.0, 1290.0],
    2: [2000.0, 1380.0],
    3: [1520.0, 720.0],
}


def split_pdf_to_letter(
    input_path: Path,
    output_path: Path,
    margin: float = 20.0,
    page_cuts: dict = None,
) -> int:
    if page_cuts is None:
        page_cuts = DEFAULT_PAGE_CUTS

    usable_w = LETTER_W - (2 * margin)
    usable_h = LETTER_H - (2 * margin)

    reader = PdfReader(str(input_path))
    writer = PdfWriter()

    for page_idx, page in enumerate(reader.pages):
        orig_w = float(page.mediabox.width)
        orig_h = float(page.mediabox.height)

        # Scale down original width to fit printable width
        scale = usable_w / orig_w if orig_w > usable_w else 1.0
        max_slice_h = usable_h / scale

        # Determine target vertical slices
        if page_idx in page_cuts:
            cuts = sorted(page_cuts[page_idx], reverse=True)
            boundaries = [orig_h] + cuts + [0.0]
            slices = []
            for i in range(len(boundaries) - 1):
                top = boundaries[i]
                bottom = boundaries[i + 1]
                if top > bottom:
                    slices.append((top, bottom))
        else:
            slices = []
            curr_top = orig_h
            while curr_top > 0.0:
                curr_bottom = max(0.0, curr_top - max_slice_h)
                slices.append((curr_top, curr_bottom))
                curr_top = curr_bottom

        # Render slices onto Letter pages (subdividing if any custom slice exceeds max_slice_h)
        for top, bottom in slices:
            c_top = top
            while c_top > bottom:
                c_bottom = max(bottom, c_top - max_slice_h)

                new_page = writer.add_blank_page(width=LETTER_W, height=LETTER_H)
                tx = margin
                ty = (LETTER_H - margin) - (c_top * scale)

                slice_page = copy.copy(page)
                slice_page.mediabox = RectangleObject((0, c_bottom, orig_w, c_top))
                slice_page.cropbox = RectangleObject((0, c_bottom, orig_w, c_top))

                transform = Transformation().scale(scale, scale).translate(tx, ty)
                new_page.merge_transformed_page(slice_page, transform, over=True)

                c_top = c_bottom

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        writer.write(f)

    return len(writer.pages)


def main():
    parser = argparse.ArgumentParser(
        description="Split oversized or long continuous PDF pages into standard Letter pages with clean chart breaks."
    )
    parser.add_argument(
        "input",
        nargs="?",
        default="docs/90/jmeter_report.pdf",
        help="Path to input PDF (default: docs/90/jmeter_report.pdf)",
    )
    parser.add_argument(
        "output",
        nargs="?",
        default="docs/90/jmeter_report_letter.pdf",
        help="Path to output PDF (default: docs/90/jmeter_report_letter.pdf)",
    )
    parser.add_argument(
        "--margin",
        type=float,
        default=20.0,
        help="Margin around Letter printable area in points (default: 20.0 pt)",
    )

    args = parser.parse_args()
    input_file = Path(args.input)
    output_file = Path(args.output)

    if not input_file.exists():
        print(f"Error: input file '{input_file}' not found.", file=sys.stderr)
        sys.exit(1)

    print(f"Processing '{input_file}' -> '{output_file}'...")
    total_pages = split_pdf_to_letter(input_file, output_file, margin=args.margin)
    print(f"Successfully generated '{output_file}' with {total_pages} Letter pages.")


if __name__ == "__main__":
    main()
