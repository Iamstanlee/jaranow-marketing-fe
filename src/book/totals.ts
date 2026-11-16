import type {Sale} from './types';

export function totalSales(sales: Sale[]) {
    const totals = {revenue: 0, count: 0, cash: 0, transfer: 0, pos: 0, redemptions: 0};
    for (const s of sales) {
        // A balance payment is money in, not a second job.
        if (!s.balanceOf) totals.count += 1;
        totals.revenue += s.amount;
        if (s.payment === 'Cash') totals.cash += s.amount;
        else if (s.payment === 'Transfer') totals.transfer += s.amount;
        else if (s.payment === 'POS') totals.pos += s.amount;
        if (s.redeemed) totals.redemptions += 1;
    }
    return totals;
}

export type Totals = ReturnType<typeof totalSales>;
