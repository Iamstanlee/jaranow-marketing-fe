// Same geometry as brand/gen-appicon.js — change both together (see CLAUDE.md "Book app icon").
const SW = 14;
const B = 'M7 93V16H33A14 14 0 0 1 47 30V40A14 14 0 0 1 33 54H7M7 54H40A14 14 0 0 1 54 68V79A14 14 0 0 1 40 93H7';
const BOX = {h: 91, cx: 30.5, cy: 54.5}; // ink bounds at SW: x 0..61, y 9..100
const TYPE = 66; // the letter's height as a share of the tile, as the launcher icon's `any` build
const K = TYPE / BOX.h;

export function BookMark({className = 'h-10 w-10'}: { className?: string }) {
    return <svg viewBox="0 0 100 100" role="img" aria-label="Jaranow books" className={`shrink-0 ${className}`}>
        <rect width="100" height="100" rx="22.37" fill="#0E1526"/>
        <g transform={`translate(${50 - BOX.cx * K} ${50 - BOX.cy * K}) scale(${K})`}>
            <path d={B} fill="none" stroke="#F2F5FB" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
        </g>
    </svg>;
}
