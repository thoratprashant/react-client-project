export const states = [
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'DC',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
].sort();

export const units_of_measure = ['EA', 'ML', 'GM'];

export const shippers = ['FEDEX', 'UPS', 'USPS'];

export const MedicationOrderStatus = {
    NEW: 'NEW',
    SHIPPED: 'SHIPPED',
    CANCELLED: 'CANCELLED',
    DELIVERED: 'DELIVERED',
};

export const ShipmentStatus = {
    PENDING: 'PENDING',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
};

export const PrescriptionStatus = {
    CREATED: 'CREATED',
    DISPENSED: 'DISPENSED',
    CANCELLED: 'CANCELLED',
};

export const DAWCodes = [
    {code: 1, description: '1 - DAW'},
    {code: 2, description: '2 - No DAW'},
];

export const SubscriptionTypes = {
    WEGOVY_WEIGHT_LOSS_RPM: {
        moniker: 'WEGOVY_WEIGHT_LOSS_RPM',
        description: 'Wegovy Weight Loss Monitoring',
    },
};
