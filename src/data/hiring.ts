// The /careers form's options. Applications store the chosen string, so renaming an option
// leaves older applications on the old wording.
export const AREAS = [
    'Gwarinpa',
    'Dawaki',
    'Kado',
    'Life Camp',
    'Karmo',
    'Jahi',
    'Katampe',
    'Kubwa',
    'Dutse',
    'Mpape',
    'Somewhere else in Abuja',
] as const;

// A short commute is one of the better signs someone stays; the book tags these "Close by".
export const NEARBY: readonly string[] = ['Gwarinpa', 'Dawaki', 'Kado', 'Life Camp', 'Karmo'];

export const START = ['Immediately', 'Within one week', 'Within one month'] as const;
export const EXPERIENCE = ['Yes, at a car wash', 'Yes, but not at a car wash', 'No, but I am ready to learn'] as const;
export const FULL_DAY = ['Yes', 'Fewer days'] as const;
export const SOURCES = [
    'Poster at the car wash',
    'WhatsApp status or group',
    'Facebook or Instagram',
    'Someone who works at Jaranow',
    'Friend or family',
    'Somewhere else',
] as const;

// Must match the hasOnly() list for car_wash_applicants in firestore.rules.
export const APPLICATION_FIELDS = ['name', 'phone', 'area', 'start', 'experience', 'fullDay', 'source'] as const;
