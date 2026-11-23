import React, {useState} from 'react';
import {currentService, earnsPoints, isRug, SERVICES, type Service} from '../constants';
import {codeFor, dateOf, dayLabel, isoDay, money, timeLabel} from '../format';
import type {Loyalty, Sale, SalePatch} from '../types';
import {Modal} from './Modal';
import {AmountField, DayField, PaymentField, PriceField, SELECT, ServiceField} from './Fields';
import {who} from './SalesTable';

const half = (price: string) => String(Math.round((Number(price) || 0) / 2));

export function SaleModal({members, admin = false, close, save}: {
    members: Loyalty[];
    admin?: boolean;
    close: () => void;
    save: (r: Omit<Sale, 'id' | 'createdAt'>, m?: Loyalty, newMember?: {
        code: string;
        phone: string
    }, on?: string) => Promise<void>
}) {
    const [on, setOn] = useState(() => isoDay(new Date()));
    const [code, setCode] = useState(''), [service, setService] = useState<Service>('Body wash'), [payment, setPayment] = useState('Transfer'), [redeem, setRedeem] = useState(false), [phone, setPhone] = useState('');
    const [price, setPrice] = useState(String(SERVICES['Body wash']));
    const [part, setPart] = useState(false), [deposit, setDeposit] = useState(''), [rugPhone, setRugPhone] = useState('');
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const rug = isRug(service), onDeposit = rug && part;
    const upfront = Number(deposit) || 0, balance = (Number(price) || 0) - upfront;
    // Padded to LOY-001 so a typed "1" matches. Ignored (not cleared) for a rug.
    const loyal = earnsPoints(service);
    const normalizedCode = loyal && code ? `LOY-${code.replace(/\D/g, '').padStart(3, '0')}` : '';
    const member = members.find((x, i) => codeFor(x, i) === normalizedCode);
    const newCode = Boolean(normalizedCode && !member);
    const canRedeem = Boolean(member && member.points >= 5);
    const amount = redeem ? 0 : onDeposit ? upfront : Number(price) || 0;
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        if (onDeposit && (upfront <= 0 || balance <= 0)) return setError('The deposit must be more than ₦0 and less than the amount.');
        setSubmitting(true);
        setError('');
        try {
            await save({
                loyaltyCode: normalizedCode || '—',
                customer: member?.customer || 'Walk-in',
                service,
                payment,
                amount,
                redeemed: redeem,
                ...(rug ? {phone: rugPhone.trim()} : {}),
                ...(onDeposit ? {balance} : {})
            }, member, newCode ? {code: normalizedCode, phone} : undefined, admin ? on : undefined);
            close();
        } catch (err) {
            console.error('Failed to record sale', err);
            setError('Could not save this sale. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Record a sale" close={close}>
        <form onSubmit={submit} className="space-y-4">{admin && <DayField value={on} onChange={setOn}/>}<label className="block text-sm font-medium">Loyalty code <span
            className="font-normal text-slate-400">(optional)</span>
            <div
                className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span
                    className="grid place-items-center bg-slate-100 px-3 text-sm font-semibold text-slate-500">LOY-</span>
                <input list="loyalty-codes" inputMode="numeric" pattern="[0-9]*" disabled={!loyal}
                       value={loyal ? code.replace(/\D/g, '') : ''}
                       onChange={e => {
                           const digits = e.target.value.replace(/\D/g, '');
                           setCode(digits ? `LOY-${digits}` : '');
                           setRedeem(false);
                       }} onBlur={() => setCode(normalizedCode)}
                       placeholder={loyal ? 'Enter code number' : 'Rugs do not earn or redeem points'}
                       className="w-full rounded-none border-0 py-2 focus:ring-0 disabled:bg-slate-50"/>
            </div>

            <datalist id="loyalty-codes">{members.map((m, i) => <option key={m.id}
                                                                          value={codeFor(m, i).replace(/\D/g, '')}/>)}</datalist>
        </label>{newCode &&
            <div className="space-y-3 rounded-xl bg-blue-50 p-3"><p className="text-sm font-semibold text-blue-900">New
                loyalty customer</p><input value={phone}
                                                                                              onChange={e => setPhone(e.target.value)}
                                                                                              placeholder="Phone number (optional)"
                                                                                              className="w-full rounded-xl border-blue-100"/>
            </div>}{member && <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><span
            className="font-semibold">{normalizedCode}</span><span
            className="float-right font-semibold">{member.points} points</span><p
            className="mt-1 text-xs text-blue-700">{canRedeem ? 'Free wash available — redeem 5 points.' : `${5 - member.points} more point${5 - member.points === 1 ? '' : 's'} to a free wash.`}</p>
        </div>}<ServiceField value={service} onChange={next => {
            setService(next);
            setPrice(String(SERVICES[next]));
            setDeposit(half(String(SERVICES[next])));
            if (!earnsPoints(next)) setRedeem(false);
        }}/>{rug && <>
            <label className="block text-sm font-medium">Phone number
                <input required type="tel" inputMode="tel" value={rugPhone} onChange={e => setRugPhone(e.target.value)}
                       className={SELECT}/>
            </label>
            <label className="block text-sm font-medium">Paying<select value={part ? 'Deposit' : 'Full payment'}
                                                                       onChange={e => {
                                                                           setPart(e.target.value === 'Deposit');
                                                                           setDeposit(half(price));
                                                                       }} className={SELECT}>
                <option>Full payment</option>
                <option>Deposit</option>
            </select></label>
        </>}{canRedeem && <label
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><input
            type="checkbox" checked={redeem} onChange={e => setRedeem(e.target.checked)}
            className="rounded text-emerald-600"/>Redeem 5 points for this wash</label>}<PaymentField value={payment}
                                                                                                      onChange={setPayment}/><PriceField
            service={service} value={price} onChange={next => {
            setPrice(next);
            setDeposit(half(next));
        }} free={redeem}/>
            {onDeposit && <AmountField label="Deposit paid now (₦)" value={deposit} onChange={setDeposit}
                                       note={balance > 0 && upfront > 0 ? `${money(balance)} to collect on delivery` : undefined}/>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : onDeposit ? 'Save deposit' : member && !redeem ? 'Save sale · +1 point' : 'Save sale'}</button>
        </form>
    </Modal>
}

// Code and redemption are fixed; see updateSale.
export function EditSaleModal({sale, close, save}: {
    sale: Sale;
    close: () => void;
    save: (id: string, patch: SalePatch) => Promise<void>
}) {
    const [service, setService] = useState<Service>(currentService(sale.service)), [payment, setPayment] = useState(sale.payment);
    const [price, setPrice] = useState(String(sale.amount)), [balance, setBalance] = useState(String(sale.balance ?? 0));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const onCard = sale.loyaltyCode !== '—' || Boolean(sale.redeemed);
    const owing = (sale.balance ?? 0) > 0;
    // One half of a rug paid in two parts, both halves written: only how it was paid can change,
    // or the two would stop adding up to the rug.
    const settled = Boolean(sale.balanceOf) || sale.balance === 0;
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        if (owing && !(Number(price) > 0 && Number(balance) > 0)) return setError('Enter the deposit paid and the balance still due.');
        setSubmitting(true);
        setError('');
        try {
            await save(sale.id, settled ? {service: sale.service, payment, amount: sale.amount} : {
                service, payment, amount: sale.redeemed ? 0 : Number(price) || 0,
                ...(owing ? {balance: Number(balance)} : {})
            });
            close();
        } catch (err) {
            console.error('Failed to update sale', err);
            setError('Could not save this correction. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Edit sale" close={close}>
        <form onSubmit={submit} className="space-y-4">
            <div className="rounded-xl bg-slate-100 p-3 text-sm"><span
                className="font-semibold">{sale.loyaltyCode}</span><span
                className="float-right text-slate-500">{dayLabel(dateOf(sale))} · {timeLabel(dateOf(sale))}</span><p
                className="mt-1 text-xs text-slate-500">{settled ? `${sale.service} · ${money(sale.amount)} · ${sale.balanceOf ? 'balance payment' : 'deposit, balance since collected'}. To change the amount, delete the balance payment and collect it again.` : owing ? `${who(sale)} · deposit paid, balance due on delivery.` : sale.redeemed ? 'Free wash — 5 points already spent.' : 'To change the code, delete the sale and record it again.'}{onCard && ' It cannot become a rug sale.'}</p>
            </div>
            {!settled && <ServiceField value={service}
                                       disabled={onCard ? s => !earnsPoints(s) : owing ? s => !isRug(s) : undefined}
                                       onChange={next => {
                                           setService(next);
                                           setPrice(owing ? half(String(SERVICES[next])) : String(SERVICES[next]));
                                           if (owing) setBalance(String(SERVICES[next] - Number(half(String(SERVICES[next])))));
                                       }}/>}<PaymentField value={payment} onChange={setPayment}/>
            {owing ? <><AmountField label="Deposit paid (₦)" value={price} onChange={setPrice}/><AmountField
                    label="Balance on delivery (₦)" value={balance} onChange={setBalance}/></>
                : !settled && <PriceField service={service} value={price} onChange={setPrice} free={sale.redeemed}/>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : 'Save changes'}</button>
        </form>
    </Modal>
}
