import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {CheckCircle} from 'lucide-react';
import {validatePhoneNumber} from '../../utils/formatters';

export interface BookingFormHandle {
    setWashType: (washType: string) => void;
}

const WHATSAPP_NUMBER = '2349038622012';

const washTypes = ['Exterior Wash - ₦2,000', 'Full Wash - ₦3,000', 'Vacuum Wash - ₦4,000', 'Buffing - ₦20,000'];

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

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setSubmitted(true);
    };

    const inputClasses = (field: keyof FormErrors) =>
        `w-full rounded-xl border px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors ${
            errors[field] ? 'border-red-400' : 'border-gray-300'
        }`;

    return (
        <section id="booking" className="py-20 bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center mb-10">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Book a wash</h2>
                        <p className="text-xl text-gray-600">
                            Tell us a few details and we'll get you booked in.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                                <CheckCircle className="w-9 h-9 text-green-600"/>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h3>
                            <p className="text-gray-600 mb-6">
                                We've opened WhatsApp with your booking details. Send the message and
                                we'll confirm your slot.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-cyan-600 font-semibold hover:underline"
                            >
                                Book another wash
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6"
                        >
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
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
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
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
                                <label htmlFor="vehicle" className="block text-sm font-semibold text-gray-900 mb-2">
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
                                <label htmlFor="washType" className="block text-sm font-semibold text-gray-900 mb-2">
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

                            <div>
                                <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-900 mb-2">
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
                                className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-primary-700 hover:bg-primary-800 text-white transition-colors shadow-lg hover:shadow-xl"
                            >
                                Book a wash
                            </button>
                            <p className="text-center text-sm text-gray-500">
                                We'll confirm your slot on WhatsApp.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
});

BookingForm.displayName = 'BookingForm';

export default BookingForm;
