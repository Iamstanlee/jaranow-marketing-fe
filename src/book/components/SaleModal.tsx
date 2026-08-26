import React, {useState} from 'react';
import {currentService, SERVICES, type Service} from '../constants';
import {codeFor, dateOf, dayLabel, timeLabel} from '../format';
import type {Loyalty, Sale} from '../types';
import {Modal} from './Modal';
import {PaymentField, PriceField, ServiceField} from './Fields';

export function SaleModal({members, close, save}: {
    members: Loyalty[];
    close: () => void;
    save: (r: Omit<Sale, 'id' | 'createdAt'>, m?: Loyalty, newMember?: {
        code: string;
        customer: string;
        phone: string
    }) => Promise<void>
}) {
    const [code, setCode] = useState(''), [service, setService] = useState<Service>('Body wash'), [payment, setPayment] = useState('Transfer'), [redeem, setRedeem] = useState(false), [customer, setCustomer] = useState(''), [phone, setPhone] = useState('');
    const [price, setPrice] = useState(String(SERVICES['Body wash']));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    // Codes are stored zero-padded to three digits (LOY-001) so a typed "1" and the
    // auto-generated "001" are the same member. Match, save and display the padded form.
    const normalizedCode = code ? `LOY-${code.replace(/\D/g, '').padStart(3, '0')}` : '';
    const member = members.find((x, i) => codeFor(x, i) === normalizedCode);
    const newCode = Boolean(normalizedCode && !member);
    const canRedeem = Boolean(member && member.points >= 5);
    // A redeemed wash is free whatever the box says, and a service change re-quotes the list
    // price — an attendant who picks the wrong service and corrects it should not be left
    // charging the old one. Anything typed after that stands, which is the point of the field.
    const amount = redeem ? 0 : Number(price) || 0;
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({
                loyaltyCode: normalizedCode || '—',
                customer: member?.customer || 'Walk-in',
                service,
                payment,
                amount,
                redeemed: redeem
            }, member, newCode ? {code: normalizedCode, customer, phone} : undefined);
            close();
        } catch (err) {
            console.error('Failed to record sale', err);
            setError('Could not save this sale. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Record a sale" close={close}>
        <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Loyalty code <span
            className="font-normal text-slate-400">(optional)</span>
            <div
                className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span
                    className="grid place-items-center bg-slate-100 px-3 text-sm font-semibold text-slate-500">LOY-</span>
                <input list="loyalty-codes" inputMode="numeric" pattern="[0-9]*" value={code.replace(/\D/g, '')}
                       onChange={e => {
                           const digits = e.target.value.replace(/\D/g, '');
                           setCode(digits ? `LOY-${digits}` : '');
                           setRedeem(false);
                       }} onBlur={() => setCode(normalizedCode)} placeholder="Enter code number"
                       className="w-full rounded-none border-0 py-2 focus:ring-0"/>
            </div>
            <datalist id="loyalty-codes">{members.map((m, i) => <option key={m.id}
                                                                          value={codeFor(m, i).replace(/\D/g, '')}/>)}</datalist>
        </label>{newCode &&
            <div className="space-y-3 rounded-xl bg-blue-50 p-3"><p className="text-sm font-semibold text-blue-900">New
                loyalty customer</p><p className="text-xs text-blue-700">Name and phone
                are optional.</p><input value={customer} onChange={e => setCustomer(e.target.value)}
                                        placeholder="Customer name (optional)"
                                        className="w-full rounded-xl border-blue-100"/><input value={phone}
                                                                                              onChange={e => setPhone(e.target.value)}
                                                                                              placeholder="Phone number (optional)"
                                                                                              className="w-full rounded-xl border-blue-100"/>
            </div>}{member && <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><span
            className="font-semibold">{normalizedCode}</span><span
            className="float-right font-semibold">{member.points} points</span><p
            className="mt-1 text-xs text-blue-700">{canRedeem ? 'Free wash available — redeem 5 points.' : `${5 - member.points} more point(s) until a free wash.`}</p>
        </div>}<ServiceField value={service} onChange={next => {
            setService(next);
            setPrice(String(SERVICES[next]));
        }}/>{canRedeem && <label
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><input
            type="checkbox" checked={redeem} onChange={e => setRedeem(e.target.checked)}
            className="rounded text-emerald-600"/>Redeem 5 points for this wash</label>}<PaymentField value={payment}
                                                                                                      onChange={setPayment}/><PriceField
            service={service} value={price} onChange={setPrice} free={redeem}/>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : `Save sale ${member && !redeem ? '• earn 1 point' : ''}`}</button>
        </form>
    </Modal>
}

// Corrects what was sold and for how much. The loyalty code and the redemption are shown but
// fixed — see updateSale for why moving them here would leave a point balance wrong.
export function EditSaleModal({sale, close, save}: {
    sale: Sale;
    close: () => void;
    save: (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => Promise<void>
}) {
    const [service, setService] = useState<Service>(currentService(sale.service)), [payment, setPayment] = useState(sale.payment);
    const [price, setPrice] = useState(String(sale.amount));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save(sale.id, {service, payment, amount: sale.redeemed ? 0 : Number(price) || 0});
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
                className="mt-1 text-xs text-slate-500">{sale.redeemed ? 'Redeemed wash — the 5 points are already spent.' : 'The loyalty code and points cannot be changed here. Delete the sale and record it again to move them.'}</p>
            </div>
            <ServiceField value={service} onChange={next => {
                setService(next);
                setPrice(String(SERVICES[next]));
            }}/><PaymentField value={payment} onChange={setPayment}/><PriceField service={service} value={price}
                                                                                 onChange={setPrice}
                                                                                 free={sale.redeemed}/>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : 'Save changes'}</button>
        </form>
    </Modal>
}
