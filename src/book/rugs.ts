import type {Sale} from './types';

// Written on the rug's label at the desk: RUG-<day><month>-<nth rug that day>. Numbered from
// the highest tag already issued today, not a count, so a deleted sale never reissues a tag.
export function nextRugTag(sales: Sale[], now = new Date()) {
    const prefix = `RUG-${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}-`;
    const last = sales.reduce((max, s) => s.tag?.startsWith(prefix) ? Math.max(max, Number(s.tag.slice(prefix.length)) || 0) : max, 0);
    return `${prefix}${last + 1}`;
}
