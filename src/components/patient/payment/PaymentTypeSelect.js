import React from 'react';
import {FormControl, InputLabel, Select} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';

export default function PaymentTypeSelect({paymentType, setPaymentType}) {
    return (
        <FormControl fullWidth>
            <InputLabel id="select-payment-type-label">Payment Type</InputLabel>
            <Select
                labelId="select-payment-type-label"
                id="payment-type"
                value={paymentType}
                label="Payment Type"
                onChange={(e) => setPaymentType(e.target.value)}
                defaultValue={'SQUARE_CREDIT_CARD'}
            >
                {/*<MenuItem value={'SQUARE_ACH'}>ACH</MenuItem>*/}
                <MenuItem value={'SQUARE_CREDIT_CARD'}>Credit Card</MenuItem>
            </Select>
        </FormControl>
    );
}
