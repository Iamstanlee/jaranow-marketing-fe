import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useForm} from 'react-hook-form';
import {WaitlistFormData} from '../types';
import {useAirtable} from '../hooks/useAirtable';
import {formatPhoneNumber, validatePhoneNumber} from '../utils/formatters';

interface WaitlistFormProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPlan?: string;
}

const laundryFrequencyOptions = [
    {value: 'Once a week', label: 'Once a week'},
    {value: 'Twice a week', label: 'Twice a week'},
    {value: 'Once a Month', label: 'Once a month'},
    {value: 'Multiple times per month', label: 'I outsource my laundry multiple times per week'},
    {value: 'Irregular', label: "I don't do laundry regularly"},
];

const WaitlistForm: React.FC<WaitlistFormProps> = ({isOpen, onClose, selectedPlan}) => {
    const {register, handleSubmit, formState: {errors}, setValue} = useForm<WaitlistFormData>();
    const {submitToWaitlist, isLoading, error} = useAirtable();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue('phoneNumber', formatted);
    };

    const onSubmit = async (data: WaitlistFormData) => {
        const result = await submitToWaitlist({...data, selectedPlan});
        if (result.success) {
            setIsSubmitted(true);
        }
    };

    const SuccessContent = () => (
        <motion.div
            className="text-center py-8"
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.5}}
        >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"/>
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to JaraNow Wash!</h3>
            <p className="text-gray-600 mb-6">
                You're now on our priority waitlist. We'll notify you as soon as we launch in your area.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-primary-700 mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Early access to download our app</li>
                    <li>• Exclusive launch week discounts</li>
                    <li>• First month 50% off</li>
                </ul>
            </div>
            <button
                onClick={onClose}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-300"
            >
                Got it!
            </button>
        </motion.div>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    exit={{scale: 0.8, opacity: 0}}
                    transition={{type: "spring", duration: 0.5}}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isSubmitted ? 'Thank You!' : 'Join the Waitlist'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {isSubmitted ? (
                            <SuccessContent/>
                        ) : (
                            <>
                                {selectedPlan && (
                                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                                        <p className="text-primary-700 font-medium">
                                            🎉 Interested in the <span
                                            className="font-bold">{selectedPlan === 'lite' ? 'Lite Plan' : 'Premium Plan'}</span>
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            {...register('name', {
                                                required: 'Name is required',
                                                minLength: {value: 2, message: 'Name must be at least 2 characters'}
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phoneNumber"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            {...register('phoneNumber', {
                                                required: 'Phone number is required',
                                                validate: (value) => validatePhoneNumber(value) || 'Please enter a valid Nigerian phone number'
                                            })}
                                            onChange={handlePhoneChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                            placeholder="+234 xxx xxx xxxx"
                                        />
                                        {errors.phoneNumber && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="laundryFrequency"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            How often do you do laundry? *
                                        </label>
                                        <select
                                            id="laundryFrequency"
                                            {...register('laundryFrequency', {required: 'Please select your laundry frequency'})}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                        >
                                            <option value="">Select frequency...</option>
                                            {laundryFrequencyOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.laundryFrequency && (
                                            <p className="mt-1 text-sm text-red-600">{errors.laundryFrequency.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="location"
                                               className="block text-sm font-medium text-gray-700 mb-2">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            id="location"
                                            {...register('location', {
                                                required: 'Location is required',
                                                minLength: {value: 3, message: 'Location must be at least 3 characters'}
                                            })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Abuja, Gwarinpa, Maitama, etc."
                                        />
                                        {errors.location && (
                                            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    )}

                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center"
                                        whileHover={{scale: isLoading ? 1 : 1.02}}
                                        whileTap={{scale: isLoading ? 1 : 0.98}}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor"
                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adding to waitlist...
                                            </>
                                        ) : (
                                            'Join Waitlist - Free'
                                        )}
                                    </motion.button>

                                    <p className="text-xs text-gray-500 text-center">
                                        No spam, unsubscribe anytime.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WaitlistForm;