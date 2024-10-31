import React, {useCallback, useEffect, useRef} from 'react';
import {Grid, IconButton} from '@mui/material';
import moment from 'moment';
import styled from '@emotion/styled';
import SignatureCanvas from 'react-signature-canvas';
import {StyledSignaturePad} from '../../dispense/DispensePrescription';
import {useSnackbar} from 'notistack';
import {useReadTermsAndConditionsPdfWithSignature} from '../../../api/patientApi';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const StyledBoldLabel = styled.span`
    font-weight: 600;
`;

export default function PatientSubscriptionSummary({
    fee,
    lastFour,
    subType,
    createdDateTime,
    existingSerialNumber,
    existingSignature,
    subscriptionId,
}) {
    const {enqueueSnackbar} = useSnackbar();
    const sigCanvasSummary = useRef();

    useEffect(() => {
        if (existingSignature?.length && sigCanvasSummary?.current) {
            setTimeout(() => {
                sigCanvasSummary.current.fromDataURL(existingSignature);
                sigCanvasSummary.current.off();
            }, 100);
        }
    }, [existingSignature, sigCanvasSummary]);

    const downloadOptions = {
        onSuccess: (data, variables) => {
            const blob = new Blob([data], {type: 'application/pdf'});
            const url = URL.createObjectURL(blob);
            window.open(url);
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error downloading the signed PDF${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: downloadPdf} = useReadTermsAndConditionsPdfWithSignature(
        subscriptionId,
        downloadOptions
    );

    const downloadSignedPDF = useCallback(() => {
        downloadPdf();
    }, [downloadPdf]);

    return (
        <>
            {createdDateTime && (
                <Grid container>
                    <Grid item xs={6}>
                        <StyledBoldLabel>Monthly Fee (including processing fees):</StyledBoldLabel>
                        {` $${((fee + 0.3) / (1 - 0.03)).toFixed(2)}`}
                    </Grid>
                    <Grid item xs={6}>
                        <StyledBoldLabel>Paid by:</StyledBoldLabel>
                        {` ${subType} ending in ${lastFour}`}
                    </Grid>
                    <Grid item xs={6}>
                        <StyledBoldLabel>Subscription started:</StyledBoldLabel>
                        {` ${moment(createdDateTime).format('MM/DD/YYYY')}`}
                    </Grid>
                    <Grid item xs={6}>
                        <StyledBoldLabel>Weight Scale Serial #:</StyledBoldLabel>
                        {` ${existingSerialNumber}`}
                    </Grid>
                    <Grid item xs={12}>
                        <StyledBoldLabel>Subscription Sign-Up Signature:</StyledBoldLabel>
                        <StyledSignaturePad>
                            <SignatureCanvas
                                penColor="black"
                                canvasProps={{
                                    width: 600,
                                    height: 200,
                                }}
                                backgroundColor="white"
                                ref={sigCanvasSummary}
                            />
                        </StyledSignaturePad>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledBoldLabel>Subscription Terms & Conditions Document:</StyledBoldLabel>
                        <IconButton
                            aria-label="download terms and conditions"
                            onClick={downloadSignedPDF}
                        >
                            <PictureAsPdfIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )}
            {!createdDateTime && (
                <Grid container>
                    <Grid item xs={12}>
                        <h3>Patient is currently not signed up for monitoring</h3>
                    </Grid>
                </Grid>
            )}
        </>
    );
}
