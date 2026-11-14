import React, {useState} from 'react';
import {CheckCircle} from 'lucide-react';
import {validatePhoneNumber} from '../../utils/formatters';
import {btn} from './ui';

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'tel' | 'select' | 'textarea';
    placeholder?: string;
    options?: readonly string[];
    required?: boolean;
    full?: boolean;
}

export type FormValues = Record<string, string>;

export interface EnquiryFormProps {
    fields: FormField[];
    submitLabel: string;
    busyLabel?: string;
    successTitle: string;
    successBody: string;
    resetLabel: string;
    footnote?: React.ReactNode;
    /** Called synchronously from the submit event, so a window.open inside it is not popup-blocked. */
    onSubmit: (values: FormValues) => void | Promise<void>;
    /** Shown when onSubmit rejects. */
    failure?: (values: FormValues) => React.ReactNode;
}

const EnquiryForm: React.FC<EnquiryFormProps> = ({
    fields,
    submitLabel,
    busyLabel = 'Sending…',
    successTitle,
    successBody,
    resetLabel,
    footnote,
    onSubmit,
    failure,
}) => {
    const blank = Object.fromEntries(fields.map((f) => [f.name, '']));
    const [values, setValues] = useState<FormValues>(blank);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setValues((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: ''}));
    };

    const validate = () => {
        const next: Record<string, string> = {};
        for (const f of fields) {
            const v = values[f.name].trim();
            if (f.required && !v) {
                next[f.name] = f.type === 'select' ? `Please choose ${f.label.toLowerCase()}.` : `Please enter ${f.label.toLowerCase()}.`;
            } else if (f.type === 'tel' && v && !validatePhoneNumber(v)) {
                next[f.name] = 'Please enter a valid Nigerian phone number.';
            }
        }
        return next;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;
        const found = validate();
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }
        const trimmed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()]));
        setFailed(false);
        setBusy(true);
        try {
            await onSubmit(trimmed);
            setSubmitted(true);
        } catch (err) {
            console.error('Form submission failed', err);
            setFailed(true);
        } finally {
            setBusy(false);
        }
    };

    const inputClasses = (name: string) =>
        `w-full rounded-xl border bg-paper/60 px-4 py-3 text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            errors[name] ? 'border-red-400' : 'border-ink/15'
        }`;

    if (submitted) {
        return (
            <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center sm:p-10" role="status">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                    <CheckCircle className="h-9 w-9 text-primary-600"/>
                </div>
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-ink">{successTitle}</h3>
                <p className="mb-6 text-ink/65">{successBody}</p>
                <button
                    onClick={() => {
                        setValues(blank);
                        setSubmitted(false);
                    }}
                    className="font-medium text-primary-600 underline underline-offset-4"
                >
                    {resetLabel}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate aria-busy={busy}
              className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-7 sm:grid-cols-2 sm:p-10">
            {fields.map((f) => {
                const errorId = errors[f.name] ? `${f.name}-error` : undefined;
                const common = {
                    id: f.name,
                    name: f.name,
                    value: values[f.name],
                    onChange: handleChange,
                    className: inputClasses(f.name),
                    'aria-invalid': !!errors[f.name],
                    'aria-describedby': errorId,
                };
                return (
                    <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                        <label htmlFor={f.name} className="mb-2 block text-sm font-medium text-ink">
                            {f.label}
                            {!f.required && <span className="ml-1 font-normal text-ink/45">(optional)</span>}
                        </label>
                        {f.type === 'select' ? (
                            <select {...common}>
                                <option value="" disabled>
                                    {f.placeholder || 'Choose one'}
                                </option>
                                {f.options?.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        ) : f.type === 'textarea' ? (
                            <textarea {...common} rows={4} placeholder={f.placeholder}/>
                        ) : (
                            <input {...common} type={f.type} placeholder={f.placeholder}
                                   autoComplete={f.type === 'tel' ? 'tel' : f.name === 'name' ? 'name' : undefined}/>
                        )}
                        {errors[f.name] && (
                            <p id={errorId} className="mt-1 text-sm text-red-600">
                                {errors[f.name]}
                            </p>
                        )}
                    </div>
                );
            })}
            {failed && failure && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                    {failure(values)}
                </div>
            )}
            <button type="submit" disabled={busy} className={`${btn.primary} w-full disabled:opacity-60 sm:col-span-2`}>
                {busy ? busyLabel : submitLabel}
            </button>
            {footnote && <p className="text-center text-sm text-ink/50 sm:col-span-2">{footnote}</p>}
        </form>
    );
};

export default EnquiryForm;
