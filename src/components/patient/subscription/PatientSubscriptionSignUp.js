import React from 'react';
import {Checkbox, FormControlLabel, FormGroup, LinearProgress, TextField} from '@mui/material';
import {useFindActivePhysicianFee} from '../../../api/physicianApi';
import styled from '@emotion/styled';

const StyledFee = styled.div`
    font-size: 24px;
    margin-top: 10px;
    font-weight: 600;
`;

export default function PatientSubscriptionSignUp({
    primaryPhysicianId,
    hasRpm,
    setHasRpm,
    serialNumber,
    setSerialNumber,
}) {
    const {data: physicianFee, isLoading: isPhysicianFeeLoading} = useFindActivePhysicianFee(
        Boolean(primaryPhysicianId),
        primaryPhysicianId
    );

    return (
        <>
            {isPhysicianFeeLoading && <LinearProgress />}
            <FormGroup>
                <FormControlLabel
                    label={'Subscribe for Monthly Monitoring'}
                    control={
                        <Checkbox
                            checked={hasRpm}
                            onClick={(e) => {
                                setHasRpm(!hasRpm);
                            }}
                        />
                    }
                />
            </FormGroup>
            {!isPhysicianFeeLoading && hasRpm && (
                <StyledFee>{`Monthly Fee (including processing fees): $${(
                    (physicianFee.fee + 0.3) /
                    (1 - 0.03)
                ).toFixed(2)}`}</StyledFee>
            )}
            {hasRpm && (
                <>
                    <h4>
                        Please enter the Serial Number of the Weight Scale you are providing to the
                        patient.
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
            )}
        </>
    );
}
