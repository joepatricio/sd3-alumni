/**
 * Check whether the document overflows the horizontal viewport.
 * @param {import('puppeteer-core').Page} page
 * @returns {Promise<{ scrollWidth: number, innerWidth: number, hasOverflow: boolean }>}
 */
export async function checkDocumentOverflow(page) {
    return page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
            scrollWidth,
            innerWidth,
            hasOverflow: scrollWidth > innerWidth,
        };
    });
}

/**
 * Inspect visible controls inside a filter container for horizontal clipping
 * and pairwise bounding-box overlap.
 *
 * @param {import('puppeteer-core').Page} page
 * @param {string} containerSelector
 */
export async function checkFilterGeometry(page, containerSelector) {
    return page.evaluate((selector) => {
        const container = document.querySelector(selector);
        if (!container) {
            return {
                found: false,
                controlCount: 0,
                clippedControls: [],
                overlaps: [],
                ok: false,
            };
        }

        const containerRect = container.getBoundingClientRect();
        const rawControls = Array.from(
            container.querySelectorAll('input, select, button, [role="combobox"]')
        );

        const visibleControls = rawControls.filter((el) => {
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
        });

        const describe = (el) => {
            const tag = el.tagName.toLowerCase();
            const text = (el.textContent || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '')
                .trim()
                .slice(0, 40);
            return `${tag}${text ? `(${text})` : ''}`;
        };

        const containerStyle = window.getComputedStyle(container);
        const allowsVerticalScroll =
            containerStyle.overflowY === 'auto' || containerStyle.overflowY === 'scroll';

        const clippedControls = [];
        for (const el of visibleControls) {
            const r = el.getBoundingClientRect();
            const horizontalClip =
                r.left < containerRect.left - 1 || r.right > containerRect.right + 1;
            const verticalClip =
                !allowsVerticalScroll &&
                (r.top < containerRect.top - 1 || r.bottom > containerRect.bottom + 1);
            if (horizontalClip || verticalClip) {
                clippedControls.push({
                    control: describe(el),
                    left: r.left,
                    right: r.right,
                    top: r.top,
                    bottom: r.bottom,
                    containerLeft: containerRect.left,
                    containerRight: containerRect.right,
                    containerTop: containerRect.top,
                    containerBottom: containerRect.bottom,
                });
            }
        }

        const overlaps = [];
        for (let i = 0; i < visibleControls.length; i++) {
            for (let j = i + 1; j < visibleControls.length; j++) {
                const a = visibleControls[i];
                const b = visibleControls[j];
                if (a.contains(b) || b.contains(a)) continue;

                const ra = a.getBoundingClientRect();
                const rb = b.getBoundingClientRect();
                const overlapW = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
                const overlapH = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
                if (overlapW > 1 && overlapH > 1 && overlapW * overlapH > 1) {
                    overlaps.push({
                        first: describe(a),
                        second: describe(b),
                        area: Math.round(overlapW * overlapH * 100) / 100,
                    });
                }
            }
        }

        return {
            found: true,
            controlCount: visibleControls.length,
            clippedControls,
            overlaps,
            ok: clippedControls.length === 0 && overlaps.length === 0,
        };
    }, containerSelector);
}

/**
 * Verify that each visible `<thead> th` aligns in width and x-offset with the
 * corresponding `<td>` cells of the first data row.
 *
 * @param {import('puppeteer-core').Page} page
 * @param {string} tableSelector
 */
export async function checkTableColumnAlignment(page, tableSelector) {
    return page.evaluate((selector) => {
        const table = document.querySelector(selector);
        if (!table) {
            return { found: false, hasDataRow: false, columnCount: 0, mismatches: [], ok: false };
        }

        const ths = Array.from(table.querySelectorAll('thead tr th')).filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
        });

        const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
        const dataRow = bodyRows.find((tr) => {
            const cells = Array.from(tr.querySelectorAll('td'));
            return cells.length === ths.length && cells.every((td) => !td.hasAttribute('colspan'));
        });

        if (!dataRow) {
            return {
                found: true,
                hasDataRow: false,
                columnCount: ths.length,
                mismatches: [],
                ok: ths.length > 0,
            };
        }

        const tds = Array.from(dataRow.querySelectorAll('td'));
        const mismatches = [];

        for (let i = 0; i < ths.length; i++) {
            const thRect = ths[i].getBoundingClientRect();
            const tdRect = tds[i].getBoundingClientRect();
            const widthDiff = Math.abs(thRect.width - tdRect.width);
            const leftDiff = Math.abs(thRect.left - tdRect.left);

            if (widthDiff > 1 || leftDiff > 1) {
                mismatches.push({
                    index: i,
                    header: (ths[i].textContent || '').trim(),
                    thWidth: Math.round(thRect.width * 100) / 100,
                    tdWidth: Math.round(tdRect.width * 100) / 100,
                    widthDiff: Math.round(widthDiff * 100) / 100,
                    leftDiff: Math.round(leftDiff * 100) / 100,
                });
            }
        }

        return {
            found: true,
            hasDataRow: true,
            columnCount: ths.length,
            mismatches,
            ok: mismatches.length === 0,
        };
    }, tableSelector);
}

/**
 * Check height, border, and SVG icon sizing consistency across action buttons.
 *
 * @param {import('puppeteer-core').Page} page
 * @param {string[]} selectors
 */
export async function checkUniformActionButtons(page, selectors) {
    return page.evaluate((sels) => {
        const items = [];
        const missingSelectors = [];

        for (const sel of sels) {
            const matches = Array.from(document.querySelectorAll(sel));
            let visibleForSel = 0;
            for (const el of matches) {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) continue;
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    continue;
                }
                visibleForSel++;
                const svg = el.querySelector('svg');
                const svgRect = svg ? svg.getBoundingClientRect() : null;
                items.push({
                    selector: sel,
                    text: (el.textContent || '').trim(),
                    height: Math.round(r.height * 100) / 100,
                    borderTopWidth: style.borderTopWidth,
                    borderTopColor: style.borderTopColor,
                    svgWidth: svgRect ? Math.round(svgRect.width * 100) / 100 : null,
                    svgHeight: svgRect ? Math.round(svgRect.height * 100) / 100 : null,
                });
            }
            if (visibleForSel === 0) {
                missingSelectors.push(sel);
            }
        }

        const heights = items.map((i) => i.height);
        const maxHeightDiff = heights.length > 0 ? Math.max(...heights) - Math.min(...heights) : 0;

        const mismatches = [];
        if (items.length > 1) {
            const baseline = items[0];
            for (let i = 1; i < items.length; i++) {
                const cur = items[i];
                const diffs = [];
                if (Math.abs(cur.height - baseline.height) > 1) {
                    diffs.push(`height: ${cur.height} vs ${baseline.height}`);
                }
                if (cur.borderTopWidth !== baseline.borderTopWidth) {
                    diffs.push(`borderTopWidth: ${cur.borderTopWidth} vs ${baseline.borderTopWidth}`);
                }
                if (cur.borderTopColor !== baseline.borderTopColor) {
                    diffs.push(`borderTopColor: ${cur.borderTopColor} vs ${baseline.borderTopColor}`);
                }
                if (
                    (cur.svgWidth === null) !== (baseline.svgWidth === null) ||
                    (cur.svgWidth !== null &&
                        baseline.svgWidth !== null &&
                        Math.abs(cur.svgWidth - baseline.svgWidth) > 1)
                ) {
                    diffs.push(`svgWidth: ${cur.svgWidth} vs ${baseline.svgWidth}`);
                }
                if (
                    (cur.svgHeight === null) !== (baseline.svgHeight === null) ||
                    (cur.svgHeight !== null &&
                        baseline.svgHeight !== null &&
                        Math.abs(cur.svgHeight - baseline.svgHeight) > 1)
                ) {
                    diffs.push(`svgHeight: ${cur.svgHeight} vs ${baseline.svgHeight}`);
                }
                if (diffs.length > 0) {
                    mismatches.push({
                        selector: cur.selector,
                        text: cur.text,
                        baselineSelector: baseline.selector,
                        baselineText: baseline.text,
                        diffs,
                    });
                }
            }
        }

        const svgWidths = items.map((i) => i.svgWidth).filter((v) => v !== null);
        const svgHeights = items.map((i) => i.svgHeight).filter((v) => v !== null);
        const maxSvgWidthDiff = svgWidths.length > 0 ? Math.max(...svgWidths) - Math.min(...svgWidths) : 0;
        const maxSvgHeightDiff = svgHeights.length > 0 ? Math.max(...svgHeights) - Math.min(...svgHeights) : 0;

        return {
            items,
            maxHeightDiff,
            maxSvgWidthDiff,
            maxSvgHeightDiff,
            missingSelectors,
            mismatches,
            ok:
                items.length > 0 &&
                missingSelectors.length === 0 &&
                maxHeightDiff <= 1 &&
                maxSvgWidthDiff <= 1 &&
                maxSvgHeightDiff <= 1 &&
                mismatches.length === 0,
        };
    }, selectors);
}
