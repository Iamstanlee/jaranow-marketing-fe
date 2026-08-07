import type {Sale} from './types';

export function totalSales(sales: Sale[]) {
    const byPayment = (payment: string) => sales.filter(s => s.payment === payment).reduce((sum, s) => sum + s.amount, 0);
    return {
        revenue: sales.reduce((sum, s) => sum + s.amount, 0),
        count: sales.length,
        cash: byPayment('Cash'),
        transfer: byPayment('Transfer'),
        pos: byPayment('POS'),
        redemptions: sales.filter(s => s.redeemed).length
    };
}

export type Totals = ReturnType<typeof totalSales>;
