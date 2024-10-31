import React from 'react';
import {useReadPrescription} from '../../api/prescriptionApi';
import styled from '@emotion/styled';
import {Grid, LinearProgress} from '@mui/material';
import moment from 'moment';
import 'moment-timezone';
import {useUserContext} from '../../UserContext';
import {PrescriptionStatus} from '../../constants/CommonConstants';

const StyledPrescriptionHeader = styled.div`
    border: 1px solid grey;
    font-weight: 700;
    background-color: ${({theme}) => theme.palette.secondary.main};
    font-size: 20px;
    padding-left: 5px;
`;
const StyledTitle = styled.div`
    font-weight: 700;
`;
const StyledIndentedTitle = styled.div`
    font-weight: 700;
    margin-left: 10px;
`;
const StyledValue = styled.div``;

export default function PrescriptionDisplay({prescriptionId}) {
    const {actor} = useUserContext();
    const {data: prescription, isLoading: isPrescriptionLoading} =
        useReadPrescription(prescriptionId);

    if (isPrescriptionLoading) {
        return <LinearProgress />;
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <StyledPrescriptionHeader>{`E-Prescription${
                    prescription.status === PrescriptionStatus.CANCELLED ? ' (CANCELLED)' : ''
                }`}</StyledPrescriptionHeader>
            </Grid>

            {/*Pharmacy Row 1*/}
            <Grid item xs={2}>
                <StyledTitle>Pharmacy:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.office?.name}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Dispensing Pharmacist:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{`${prescription?.physicianLastName}, ${prescription?.physicianFirstName}`}</StyledValue>
            </Grid>

            {/*Patient Row 1*/}
            <Grid item xs={2}>
                <StyledTitle>Patient:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{`${prescription?.patient?.lastName}, ${prescription?.patient?.firstName}`}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>DOB:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{moment(prescription?.patient?.dob).format('MM/DD/YYYY')}</StyledValue>
            </Grid>
            {/*Patient Row 2*/}
            <Grid item xs={2} />
            <Grid item xs={4}>
                <StyledValue>{prescription?.patient?.addressLine1}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Phone:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.patient?.phone}</StyledValue>
            </Grid>
            {/*Patient Row 3*/}
            {prescription?.patient?.addressLine2 && (
                <>
                    <Grid item xs={2} />
                    <Grid item xs={10}>
                        <StyledValue>{prescription?.patient?.addressLine2}</StyledValue>
                    </Grid>
                </>
            )}
            {/*Patient Row 4*/}
            <Grid item xs={2} />
            <Grid item xs={4}>
                <StyledValue>{`${prescription?.patient?.city}, ${prescription?.patient?.stateCode} ${prescription?.patient?.zip}`}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Patient Id:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.patient?.id}</StyledValue>
            </Grid>

            {/*Prescriber Row 1*/}
            <Grid item xs={2}>
                <StyledTitle>Prescriber:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{`${prescription?.physicianLastName}, ${prescription?.physicianFirstName}`}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Phone:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.office?.phone}</StyledValue>
            </Grid>
            {/*Prescriber Row 2*/}
            <Grid item xs={2} />
            <Grid item xs={4}>
                <StyledValue>{prescription?.office?.addressLine1}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Prescriber Id:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.physician?.id}</StyledValue>
            </Grid>
            {/*Prescriber Row 3*/}
            {prescription?.office?.addressLine2 && (
                <>
                    <Grid item xs={2} />
                    <Grid item xs={10}>
                        <StyledValue>{prescription?.office?.addressLine2}</StyledValue>
                    </Grid>
                </>
            )}
            {/*Prescriber Row 4*/}
            <Grid item xs={2} />
            <Grid item xs={10}>
                <StyledValue>{`${prescription?.office?.city}, ${prescription?.office?.stateCode} ${prescription?.office?.zip}`}</StyledValue>
            </Grid>

            {/*Med Row 1*/}
            <Grid item xs={2}>
                <StyledTitle>Medication:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.medication?.displayName}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Rx Written:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>
                    {moment
                        .utc(prescription?.createdDateTime)
                        .tz(actor.timezone)
                        .format('MM/DD/YYYY')}
                </StyledValue>
            </Grid>

            {/*Med Row 2*/}
            <Grid item xs={2}>
                <StyledIndentedTitle>Quantity:</StyledIndentedTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.quantity}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Refills:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.refillsAuthorized}</StyledValue>
            </Grid>

            {/*Med Row 3*/}
            <Grid item xs={2}>
                <StyledIndentedTitle>DAW Code:</StyledIndentedTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.dawCode}</StyledValue>
            </Grid>
            <Grid item xs={2}>
                <StyledTitle>Days Supply:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.daysSupply}</StyledValue>
            </Grid>

            {/*Med Row 4*/}
            <Grid item xs={2}>
                <StyledIndentedTitle>Directions:</StyledIndentedTitle>
            </Grid>
            <Grid item xs={10}>
                <StyledValue>{prescription?.sig}</StyledValue>
            </Grid>

            {/*Med Row 5*/}
            {prescription?.dose && (
                <>
                    <Grid item xs={2}>
                        <StyledIndentedTitle>Doses:</StyledIndentedTitle>
                    </Grid>
                    <Grid item xs={10}>
                        <StyledValue>{prescription?.dose}</StyledValue>
                    </Grid>
                </>
            )}

            {/*Other Row 1*/}
            <Grid item xs={2}>
                <StyledTitle>Prescription Id:</StyledTitle>
            </Grid>
            <Grid item xs={4}>
                <StyledValue>{prescription?.id}</StyledValue>
            </Grid>
            <Grid item xs={6} />
        </Grid>
    );
}
