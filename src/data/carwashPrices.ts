/* Hand-mirrors `pricelist-carwash` in brand/gen-pricelist.js (not importable); change both.
   `onCards` rows also live in the five places listed in CLAUDE.md. */

export interface PriceRow {
    name: string;
    note?: string;
    price: number;
    /** Tier marker, not a sales line - same rule as the printed sheet. */
    badge?: string;
    onCards?: boolean;
}

export interface PriceSection {
    title: string;
    items: PriceRow[];
}

export const CARWASH_PRICE_LIST: PriceSection[] = [
    {
        title: 'Car',
        items: [
            {name: 'Body wash', note: 'Body, tyres and glass', price: 2000, onCards: true},
            {name: 'Full wash', note: 'Body wash · inside cleaned', price: 3000, onCards: true},
            {name: 'Wash & vacuum', note: 'Body wash · inside vacuumed', price: 4000, onCards: true},
            {
                name: 'Full wash + engine',
                note: 'Body wash · inside cleaned · engine area washed · note: engine wash is 100% at owners risk',
                price: 7000,
            },
            {name: 'Deep wash', note: 'Body wash · deep interior cleaning & vacuum', price: 10000, badge: 'Premium'},
            {
                name: 'Buffing & polish',
                note: 'Body wash · inside cleaned · paint correction · scratch removal · shine restoration',
                price: 20000,
                badge: 'Premium',
            },
            {
                name: 'Premium detailing',
                note: 'Body wash · deep interior cleaning & vacuum · engine area · polish & wax',
                price: 35000,
                badge: 'Premium',
            },
        ],
    },
    {
        title: 'Rug',
        items: [
            {name: 'Small rug', note: 'Bedside or centre rug', price: 10000},
            {name: 'Medium rug', note: 'Big bedside or centre rug', price: 15000},
            {name: 'Large rug', note: 'Sitting room size rug', price: 20000},
        ],
    },
];
