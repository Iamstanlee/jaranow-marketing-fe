import {nextRugTag} from './rugs';
import type {Sale} from './types';

const rug = (tag?: string): Sale => ({id: tag || 'x', loyaltyCode: '—', customer: 'Walk-in', service: 'Small rug', payment: 'Cash', amount: 10000, tag});
const day = new Date('2026-11-16T10:00:00');

describe('nextRugTag', () => {
    it('starts each day at 1', () => {
        expect(nextRugTag([rug('RUG-1511-4'), rug()], day)).toBe('RUG-1611-1');
    });
    it('follows the highest tag issued today, so a deleted sale is not reissued', () => {
        expect(nextRugTag([rug('RUG-1611-3'), rug('RUG-1611-1')], day)).toBe('RUG-1611-4');
    });
});
