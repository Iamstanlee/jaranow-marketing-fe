// aria-hidden: the surrounding region carries aria-busy.
export function Skeleton({className = ''}: { className?: string }) {
    return <span aria-hidden className={`block animate-pulse rounded bg-slate-200 ${className}`}/>;
}
