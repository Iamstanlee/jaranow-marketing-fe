import {useCallback, useState} from 'react';
import axios from 'axios';
import {AirtableResponse, WaitlistFormData} from '../types';

interface UseAirtableReturn {
    submitToWaitlist: (data: WaitlistFormData) => Promise<AirtableResponse>;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

export const useAirtable = (): UseAirtableReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const submitToWaitlist = useCallback(async (data: WaitlistFormData): Promise<AirtableResponse> => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // TODO: move keys to backend side
            const API_KEY = "patnrAkFujQyutuff.6d693a6c651e0385ab6a5ef478eca91984a961f54d78a090c4f872bc0b620da3";
            const BASE_ID = "appTGWr5tHAUF07WH";
            const TABLE_NAME = 'tblyuTZSze059TO40';

            const response = await axios.post(
                `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
                {
                    fields: {
                        'fldefBNT6ruMWX5xG': data.name,
                        'fldWagN1jzTfUKduo': data.phoneNumber,
                        'fldDUKDY7jI259chM': data.laundryFrequency,
                        'fldSiT5eIGSGMOZPr': data.location,
                        'fldXS76j1z6RGYFTD': data.selectedPlan,
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess(true);
            return {
                success: true,
                message: 'Successfully added to waitlist!',
                recordId: response.data.id
            };
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to submit to waitlist';
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        submitToWaitlist,
        isLoading,
        error,
        success
    };
};