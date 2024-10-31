import React from 'react';
import {TextField} from '@mui/material';

export default function PatientSubscriptionSerialNumberEdit({serialNumber, setSerialNumber}) {
    return (
        <>
            <h4>
                Please enter the Serial Number of the Weight Scale you are providing to the patient.
            </h4>
            <TextField
                onWheel={(e) => e.target.blur()}
                name="serialNumber"
                id="serialNumber"
                label={`Weight Scale Serial Number`}
                fullWidth
                required
                margin={'normal'}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
            />
        </>
    );
}
