import {useEffect, useState} from 'react';
import {startOfDay} from '../format';

// Nothing re-renders on its own at midnight, so a desk left open overnight would keep
// counting yesterday's sales as "today" until someone reloaded. Checking once a minute rolls
// the header date and every today-scoped figure over on their own.
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
