// A bar standing in for a figure that has not arrived yet. Sized by the caller so it occupies
// roughly the space its content will, and the screen does not jump when the snapshot lands.
// Always aria-hidden: the surrounding region carries aria-busy, and a screen reader reading
// out a row of empty boxes is worse than it reading nothing.
export function Skeleton({className = ''}: { className?: string }) {
    return <span aria-hidden className={`block animate-pulse rounded bg-slate-200 ${className}`}/>;
}
