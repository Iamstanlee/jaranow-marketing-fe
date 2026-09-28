import React from 'react';

/** The Jaranow symbol, flat, for use as a ghost watermark behind a section.
 *  Same geometry as /public/brand/jaranow-symbol.svg - counter kept open. */
const Drop: React.FC<{ className?: string }> = ({className = ''}) => (
    <svg viewBox="2 -6 96 112" className={className} aria-hidden="true" focusable="false">
        <path
            fillRule="evenodd"
            fill="currentColor"
            d="M50 8 L81 44 A34 34 0 1 1 19 44 Z M50 51 A13 13 0 1 1 50 77 A13 13 0 1 1 50 51 Z"
        />
    </svg>
);

export default Drop;
