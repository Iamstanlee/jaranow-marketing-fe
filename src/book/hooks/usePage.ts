import {useEffect, useState} from 'react';

export type Pager = { page: number; pages: number; total: number; size: number; setPage: (p: number) => void };

// Live snapshots keep changing the list under the reader, so the page is clamped rather than
// reset — adding a sale on page 3 leaves you on page 3. Pass resetKey for a change that makes
// the current page meaningless (a new report period), which does send you back to page 1.
export function usePage<T>(items: T[], resetKey?: unknown, size = 10): Pager & { slice: T[] } {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [resetKey]);
    const pages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(page, pages);
    return {
        slice: items.slice((current - 1) * size, current * size),
        page: current,
        pages,
        total: items.length,
        size,
        setPage
    };
}
