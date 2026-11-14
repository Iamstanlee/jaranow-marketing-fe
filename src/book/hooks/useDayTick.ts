import {useEffect, useState} from 'react';
import {startOfDay} from '../format';

// Rolls today-scoped figures over at midnight on a desk that is never reloaded.
export function useDayTick() {
    const [day, setDay] = useState(() => startOfDay(new Date()).getTime());
    useEffect(() => {
        const id = setInterval(() => setDay(current => {
            const now = startOfDay(new Date()).getTime();
            return now === current ? current : now;
        }), 60_000);
        return () => clearInterval(id);
    }, []);
    return day;
}
