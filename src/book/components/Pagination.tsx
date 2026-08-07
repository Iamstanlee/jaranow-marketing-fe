import {ChevronLeft, ChevronRight} from 'lucide-react';
import type {Pager} from '../hooks/usePage';

export function Pagination({page, pages, total, size, setPage, className = 'border-t border-slate-100 px-5 py-4'}: Pager & {
    className?: string
}) {
    if (total <= size) return null;
    const step = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40';
    return <div className={`flex items-center justify-between gap-3 ${className}`}><p
        className="text-xs text-slate-400">{(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</p>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Page {page} of {pages}</span>
            <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}
                    className={step}><ChevronLeft size={17}/></button>
            <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)}
                    className={step}><ChevronRight size={17}/></button>
        </div>
    </div>
}
