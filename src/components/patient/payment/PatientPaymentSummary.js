import React from 'react';
import {Grid} from '@mui/material';
import moment from 'moment';
import styled from '@emotion/styled';

const StyledBoldLabel = styled.span`
    font-weight: 600;
`;
const StyledSummaryContainer = styled.div`
    margin-bottom: 10px;
    margin-top: 10px;
`;

export default function PatientPaymentSummary({
    lastFour: existingLastFour,
    subType: existingSubType,
    createdDateTime,
}) {
    return (
        <StyledSummaryContainer>
            <Grid container>
                <Grid item xs={6}>
                    <StyledBoldLabel>Saved Payment Method:</StyledBoldLabel>
                    {` ${existingSubType} ending in ${existingLastFour}`}
                </Grid>
                <Grid item xs={6}>
                    <StyledBoldLabel>Payment Method Added:</StyledBoldLabel>
                    {` ${moment(createdDateTime).format('MM/DD/YYYY')}`}
                </Grid>
            </Grid>
        </StyledSummaryContainer>
    );
}
