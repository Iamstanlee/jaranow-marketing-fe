import {useEffect} from 'react';
import {comparisonStart, type Range, rangeKey, rangeStart} from '../period';

// A section declaring how far back the range it is showing reaches, so useBook can pull in the
// records that sit behind the live window. Sections that only ever look at today — Overview,
// End of day — do not use this and never trigger a fetch.
//
// `compare` is for Reports, which draws each period against the one before it: without the
// extra window the comparison reads as a collapse in trading that is really just the edge of
// what was loaded.
//
// Keyed on the range's value rather than its identity: the sections rebuild the Range object
// on every render, and an effect on the object itself would refetch forever.
export function useHistory(range: Range, request: (from: number) => void, compare = false) {
    const key = rangeKey(range);
    useEffect(() => {
        request(compare ? comparisonStart(range) : rangeStart(range));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, compare, request]);
}
