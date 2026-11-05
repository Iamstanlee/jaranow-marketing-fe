// The books app's mark, "Ink desk": an Ink tile with "BOOK" in Paper, drawn on the wordmark's
// construction, as large as the tile allows. The same
// geometry as brand/gen-appicon.js, so the sidebar tile and the home-screen icon are one
// object — change one, change both. Internal only: everything a customer sees uses the drop
// (BRAND-STANDARD §2.4).
//
// The capitals are glyphs from brand/gen-marks.js, drawn rather than typed (§2.1), set at the
// icon's heavier 20-unit stroke with spacing widened to keep 12 units clear between letters:
// this is the path and ink box gen-appicon.js emits.
const SW = 20;
const WORD = 'M7 93V16 H33A14 14 0 0 1 47 30V40 A14 14 0 0 1 33 54H7M7 54H40A14 14 0 0 1 54 68V79 A14 14 0 0 1 40 93H7 '
    + 'M86 30A14 14 0 0 1 100 16H126A14 14 0 0 1 140 30V79 A14 14 0 0 1 126 93H100A14 14 0 0 1 86 79Z '
    + 'M172 30A14 14 0 0 1 186 16H212A14 14 0 0 1 226 30V79 A14 14 0 0 1 212 93H186A14 14 0 0 1 172 79Z '
    + 'M258 16V100 M301 16L258 64M272 48.4L301 100';
const BOX = {w: 314, cx: 154, cy: 58}; // ink bounds at SW: x -3..311, y 6..110
const TYPE = 88; // the word's width as a share of the tile, as the launcher icon's `any` build
const K = TYPE / BOX.w;

export function BookMark({className = 'h-10 w-10'}: { className?: string }) {
    return <svg viewBox="0 0 100 100" role="img" aria-label="Jaranow books" className={`shrink-0 ${className}`}>
        <rect width="100" height="100" rx="22.37" fill="#0E1526"/>
        <g transform={`translate(${50 - BOX.cx * K} ${50 - BOX.cy * K}) scale(${K})`}>
            <path d={WORD} fill="none" stroke="#F2F5FB" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>;
}
