import React, {useRef} from 'react';
import styled from '@emotion/styled';
import {useReadPrescription} from '../../api/prescriptionApi';
import moment from 'moment';
import {LinearProgress} from '@mui/material';
import {StyledButton} from '../shared/StyledElements';
import ReactToPrint from 'react-to-print';

const StyledRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
`;
const StyledTitle = styled.div`
    font-weight: 600;
    padding-left: 5px;
    font-size: 12px;
`;
const StyledValue = styled.div`
    font-weight: 400;
    padding-left: 5px;
    font-size: 11px;
`;
const StyledContainer = styled.div`
    border: 0.5px solid black;
    margin: 10px;
    padding-right: 10px;
    width: fit-content;

    @media print {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden;
        @page {
            height: 60mm;
            size: landscape;
        }
    }
`;

export default function PrescriptionLabel({prescriptionId, showPrint = false}) {
    const {data: prescription, isLoading: isPrescriptionLoading} =
        useReadPrescription(prescriptionId);

    const componentRef = useRef();

    if (isPrescriptionLoading) return <LinearProgress />;
    return (
        <div>
            {showPrint && (
                <ReactToPrint
                    trigger={() => <StyledButton variant={'contained'}>Print</StyledButton>}
                    content={() => componentRef.current}
                />
            )}
            <StyledContainer ref={componentRef}>
                <StyledRow>
                    <StyledTitle>{prescription.office.name}</StyledTitle>
                    <StyledValue>{`NPI ${prescription.office.npi}`}</StyledValue>
                    <StyledValue>{`${prescription.office.addressLine1} ${
                        prescription.office.addressLine2 || ''
                    } ${prescription.office.city}, ${prescription.office.stateCode} ${
                        prescription.office.zip
                    }`}</StyledValue>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>{prescription.medication.displayName}</StyledTitle>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>{prescription.sig}</StyledTitle>
                </StyledRow>
                {prescription?.dose && (
                    <StyledRow>
                        <StyledTitle>{prescription.dose}</StyledTitle>
                    </StyledRow>
                )}
                <StyledRow>
                    <StyledTitle>Rx #</StyledTitle>
                    <StyledValue>{prescriptionId}</StyledValue>
                    <StyledTitle>Refill #</StyledTitle>
                    <StyledValue>{`0 of ${prescription.refillsAuthorized}`}</StyledValue>
                    <StyledTitle>Qty</StyledTitle>
                    <StyledValue>{prescription.quantity}</StyledValue>
                    <StyledTitle>Days Supply</StyledTitle>
                    <StyledValue>{prescription.daysSupply}</StyledValue>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Date Filled</StyledTitle>
                    <StyledValue>{moment().format('MM/DD/YYYY')}</StyledValue>
                    <StyledTitle>Expiry Date</StyledTitle>
                    <StyledValue>
                        {prescription.medication.defaultExpiryText
                            ? prescription.medication.defaultExpiryText
                            : moment().add(1, 'y').format('MM/DD/YYYY')}
                    </StyledValue>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>{`${prescription.patient.lastName}, ${prescription.patient.firstName}`}</StyledTitle>
                    <StyledValue>{`${prescription.patient.addressLine1} ${
                        prescription.patient.addressLine2 || ''
                    } ${prescription.patient.city}, ${prescription.patient.stateCode} ${
                        prescription.patient.zip
                    }`}</StyledValue>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Patient Id</StyledTitle>
                    <StyledValue>{prescription.patient.id}</StyledValue>
                    <StyledTitle>DOB</StyledTitle>
                    <StyledValue>
                        {moment(prescription.patient.dob).format('MM/DD/YYYY')}
                    </StyledValue>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Prescriber</StyledTitle>
                    <StyledValue>{`${prescription.physicianLastName}, ${prescription.physicianFirstName}`}</StyledValue>
                    <StyledTitle>Phone</StyledTitle>
                    <StyledValue>{`${prescription.office.phone}`}</StyledValue>
                </StyledRow>
            </StyledContainer>
        </div>
    );
}
