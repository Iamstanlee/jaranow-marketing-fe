import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {CheckCircle} from 'lucide-react';
import {btn, Container, SectionHeader, openWhatsApp} from '../common/ui';
import {trackLead} from '../../utils/metaPixel';
import {validatePhoneNumber} from '../../utils/formatters';

export interface BookingFormHandle {
    setWashType: (washType: string) => void;
}

const washTypes = ['Exterior Wash - ₦2,000', 'Full Wash - ₦3,000', 'Vacuum Wash - ₦4,000'];

interface FormState {
    name: string;
    phone: string;
    vehicle: string;
    washType: string;
    preferredTime: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    vehicle?: string;
    washType?: string;
    preferredTime?: string;
}

const BookingForm = forwardRef<BookingFormHandle>((_props, ref) => {
    const [form, setForm] = useState<FormState>({
        name: '',
        phone: '',
        vehicle: '',
        washType: '',
        preferredTime: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);

    useImperativeHandle(ref, () => ({
        setWashType: (washType: string) => {
            const match = washTypes.find((t) => t.toLowerCase().startsWith(washType.toLowerCase()));
            if (match) {
                setForm((prev) => ({...prev, washType: match}));
            }
        },
    }));

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
        setErrors((prev) => ({...prev, [name]: undefined}));
    };

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};

        if (!form.name.trim()) {
            newErrors.name = 'Please enter your name.';
        }
        if (!form.phone.trim()) {
            newErrors.phone = 'Please enter your phone number.';
        } else if (!validatePhoneNumber(form.phone)) {
            newErrors.phone = 'Please enter a valid Nigerian phone number.';
        }
        if (!form.vehicle.trim()) {
            newErrors.vehicle = 'Please tell us your vehicle (e.g. Toyota Corolla, silver).';
        }
        if (!form.washType) {
            newErrors.washType = 'Please choose a wash type.';
        }
        if (!form.preferredTime.trim()) {
            newErrors.preferredTime = 'Please choose a preferred time.';
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // TODO(backend): send this booking to the Carwash bookings API once it exists.
        // For now we validate client-side, log the payload, and hand off to WhatsApp.
        console.log('[Carwash booking]', {
            name: form.name.trim(),
            phone: form.phone.trim(),
            vehicle: form.vehicle.trim(),
            washType: form.washType,
            preferredTime: form.preferredTime,
        });

        const message = `Hi Jaranow! I'd like to book a car wash.

Name: ${form.name.trim()}
Phone: ${form.phone.trim()}
Vehicle: ${form.vehicle.trim()}
Wash type: ${form.washType}
Preferred time: ${form.preferredTime}

Location: 6th Avenue, Gwarinpa, Abuja`;

        trackLead('Car wash booking');
        openWhatsApp(message);
        setSubmitted(true);
    };

    const inputClasses = (field: keyof FormErrors) =>
        `w-full rounded-xl border bg-paper/60 px-4 py-3 text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
            errors[field] ? 'border-red-400' : 'border-ink/15'
        }`;

    return (
        <section id="booking" className="bg-paper py-20 sm:py-28">
            <Container className="grid gap-12 lg:grid-cols-12">
                <div className="lg:col-span-5">
                    <SectionHeader
                        eyebrow="Book a car wash"
                        title="Book your wash."
                        intro="Tell us your car, the wash you want and when suits you. We will confirm your slot on WhatsApp."
                    />
                    <ol className="mt-10 space-y-4 text-ink/70">
                        {['Fill in the form', 'WhatsApp opens with your details', 'We reply to confirm your time'].map((item, i) => (
                            <li key={item} className="flex items-center gap-4">
                                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 text-sm font-medium text-ink tabular-nums">
                                    {i + 1}
                                </span>
                                {item}
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="lg:col-span-7">

                    {submitted ? (
                        <div className="rounded-3xl border border-ink/10 bg-white p-8 text-center sm:p-10">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary-50 flex items-center justify-center mb-6">
                                <CheckCircle className="w-9 h-9 text-primary-600"/>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-ink mb-2">You're all set!</h3>
                            <p className="text-ink/65 mb-6">
                                We've opened WhatsApp with your booking details. Send the message and
                                we'll confirm your slot.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="font-medium text-primary-600 underline underline-offset-4"
                            >
                                Book another wash
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="rounded-3xl border border-ink/10 bg-white p-7 sm:p-10 grid gap-6 sm:grid-cols-2"
                        >
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-ink mb-2">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    className={inputClasses('name')}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? 'name-error' : undefined}
                                />
                                {errors.name && (
                                    <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-ink mb-2">
                                    Phone number
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 0903 862 2012"
                                    className={inputClasses('phone')}
                                    aria-invalid={!!errors.phone}
                                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                                />
                                {errors.phone && (
                                    <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="vehicle" className="block text-sm font-medium text-ink mb-2">
                                    Vehicle
                                </label>
                                <input
                                    id="vehicle"
                                    name="vehicle"
                                    type="text"
                                    value={form.vehicle}
                                    onChange={handleChange}
                                    placeholder="e.g. Toyota Corolla, silver"
                                    className={inputClasses('vehicle')}
                                    aria-invalid={!!errors.vehicle}
                                    aria-describedby={errors.vehicle ? 'vehicle-error' : undefined}
                                />
                                {errors.vehicle && (
                                    <p id="vehicle-error" className="mt-1 text-sm text-red-600">{errors.vehicle}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="washType" className="block text-sm font-medium text-ink mb-2">
                                    Wash type
                                </label>
                                <select
                                    id="washType"
                                    name="washType"
                                    value={form.washType}
                                    onChange={handleChange}
                                    className={inputClasses('washType')}
                                    aria-invalid={!!errors.washType}
                                    aria-describedby={errors.washType ? 'washType-error' : undefined}
                                >
                                    <option value="" disabled>
                                        Choose a wash
                                    </option>
                                    {washTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {errors.washType && (
                                    <p id="washType-error" className="mt-1 text-sm text-red-600">{errors.washType}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="preferredTime" className="block text-sm font-medium text-ink mb-2">
                                    Preferred time
                                </label>
                                <input
                                    id="preferredTime"
                                    name="preferredTime"
                                    type="datetime-local"
                                    value={form.preferredTime}
                                    onChange={handleChange}
                                    className={inputClasses('preferredTime')}
                                    aria-invalid={!!errors.preferredTime}
                                    aria-describedby={errors.preferredTime ? 'preferredTime-error' : undefined}
                                />
                                {errors.preferredTime && (
                                    <p id="preferredTime-error" className="mt-1 text-sm text-red-600">
                                        {errors.preferredTime}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={`${btn.primary} w-full sm:col-span-2`}
                            >
                                Book a wash
                            </button>
                            <p className="text-center text-sm text-ink/50 sm:col-span-2">
                                We'll confirm your slot on WhatsApp.
                            </p>
                        </form>
                    )}
                </div>
            </Container>
        </section>
    );
});

BookingForm.displayName = 'BookingForm';

export default BookingForm;
