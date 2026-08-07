import {Pencil, Trash2} from 'lucide-react';

// Edit sits on the left of delete on every row, so the destructive one is never where the
// thumb lands by habit.
export function RowActions({label, onEdit, onDelete}: { label: string; onEdit: () => void; onDelete?: () => void }) {
    const button = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400';
    return <span className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onEdit} aria-label={`Edit ${label}`}
                className={`${button} hover:text-blue-600`}><Pencil size={15}/></button>
        {onDelete && <button type="button" onClick={onDelete} aria-label={`Delete ${label}`}
                             className={`${button} hover:border-red-200 hover:text-red-600`}><Trash2 size={15}/>
        </button>}
    </span>;
}
