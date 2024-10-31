import React, {useCallback, useEffect, useState} from 'react';
import {Grid} from '@mui/material';
import styled from '@emotion/styled';
import PaymentTypeSelect from './PaymentTypeSelect';
import PaymentAccountDetails from './PaymentAccountDetails';
import {useCreatePatientPaymentToken} from '../../../api/patientApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';

const StyledSummaryContainer = styled.div`
    margin-bottom: 10px;
    margin-top: 10px;
`;

export default function PatientPaymentEdit({
    lastFour: existingLastFour,
    subType: existingSubType,
    squareLocationId,
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    patientId,
    setShowEditPayment,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const [paymentType, setPaymentType] = useState('');
    const [token, setToken] = useState('');
    const [verifiedBuyerToken, setVerifiedBuyerToken] = useState('');
    const [lastFour, setLastFour] = useState(existingLastFour || '');
    const [subType, setSubType] = useState(existingSubType || '');

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['subscriptions']}).then(() => {
                enqueueSnackbar(`${paymentType} has been successfully saved for this patient.`, {
                    variant: 'success',
                });
                setShowEditPayment(false);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error saving the ${paymentType} information for this patient${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitPaymentToken} = useCreatePatientPaymentToken(submissionOptions);

    const handleSubmit = useCallback(() => {
        setTimeout(() => {
            const submission = {
                patientId,
                feeToken: token,
                feeTokenType: paymentType,
                subType,
                lastFour,
                verifiedBuyerToken,
            };

            submitPaymentToken({body: submission});
        }, 100);
    }, [lastFour, patientId, paymentType, subType, submitPaymentToken, token, verifiedBuyerToken]);

    useEffect(() => {
        if ((token, lastFour, subType, verifiedBuyerToken)) {
            handleSubmit();
        }
    }, [token, lastFour, subType, verifiedBuyerToken, handleSubmit]);

    return (
        <StyledSummaryContainer>
            <Grid container>
                <Grid item xs={12}>
                    <PaymentTypeSelect paymentType={paymentType} setPaymentType={setPaymentType} />
                </Grid>
                <Grid item xs={12}>
                    <PaymentAccountDetails
                        paymentType={paymentType}
                        firstName={firstName}
                        lastName={lastName}
                        squareLocationId={squareLocationId}
                        addressLine1={addressLine1}
                        addressLine2={addressLine2}
                        city={city}
                        setLastFour={setLastFour}
                        setSubType={setSubType}
                        setToken={setToken}
                        token={token}
                        setVerifiedBuyerToken={setVerifiedBuyerToken}
                    />
                </Grid>
            </Grid>
        </StyledSummaryContainer>
    );
}
