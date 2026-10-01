import React, {useState} from 'react';
import {CheckCircle} from 'lucide-react';
import {validatePhoneNumber} from '../../utils/formatters';
import {btn, openWhatsApp} from './ui';
import {trackLead} from '../../utils/metaPixel';

/* A validated enquiry form that hands off to WhatsApp. Fields are data, so a
   new enquiry type is a config array, not another copy of the carwash
   BookingForm. Nothing is sent anywhere else - WhatsApp is the whole backend. */

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'tel' | 'select' | 'textarea';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    /** Span both columns on sm+ screens. */
    full?: boolean;
}

interface WhatsAppFormProps {
    fields: FormField[];
    /** First line of the WhatsApp message, e.g. "Hi Jaranow! I'd like a fleet quote." */
    intro: string;
    submitLabel: string;
    successTitle: string;
    successBody: string;
    resetLabel: string;
    footnote?: string;
    /** Names this form in the Meta Pixel Lead event, e.g. "Rug pickup". */
    leadName: string;
}

const WhatsAppForm: React.FC<WhatsAppFormProps> = ({
    fields,
    intro,
    submitLabel,
    successTitle,
    successBody,
    resetLabel,
    footnote,
    leadName,
}) => {
    const blank = Object.fromEntries(fields.map((f) => [f.name, '']));
    const [values, setValues] = useState<Record<string, string>>(blank);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const found = validate();
        if (Object.keys(found).length) {
            setErrors(found);
            return;
        }
        const lines = fields
            .filter((f) => values[f.name].trim())
            .map((f) => `${f.label}: ${values[f.name].trim()}`);
        trackLead(leadName);
        openWhatsApp(`${intro}\n\n${lines.join('\n')}`);
        setSubmitted(true);
    };

    const inputClasses = (name: string) =>
        `w-full rounded-xl border bg-paper/60 px-4 py-3 text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            errors[name] ? 'border-red-400' : 'border-ink/15'
        }`;

    if (submitted) {
        return (
            <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center sm:p-10">
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
        <form onSubmit={handleSubmit} noValidate className="grid gap-6 rounded-3xl border border-ink/10 bg-white p-7 sm:grid-cols-2 sm:p-10">
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
                            <input {...common} type={f.type} placeholder={f.placeholder}/>
                        )}
                        {errors[f.name] && (
                            <p id={errorId} className="mt-1 text-sm text-red-600">
                                {errors[f.name]}
                            </p>
                        )}
                    </div>
                );
            })}
            <button type="submit" className={`${btn.primary} w-full sm:col-span-2`}>
                {submitLabel}
            </button>
            {footnote && <p className="text-center text-sm text-ink/50 sm:col-span-2">{footnote}</p>}
        </form>
    );
};

export default WhatsAppForm;
