import {useEffect} from 'react';
import {comparisonStart, type Range, rangeKey, rangeStart} from '../period';

// Tells useBook how far back the visible range reaches. `compare` adds the previous period
// (Reports). Keyed on the range's value, since sections rebuild the object every render.
export function useHistory(range: Range, request: (from: number) => void, compare = false) {
    const key = rangeKey(range);
    useEffect(() => {
        request(compare ? comparisonStart(range) : rangeStart(range));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, compare, request]);
}
