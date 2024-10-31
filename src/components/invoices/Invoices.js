import React from 'react';
import {useReadAllInvoices} from '../../api/invoicesApi';
import styled from '@emotion/styled';
import {Card, CardContent, CardHeader, Grid} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import moment from 'moment';
import {useUserContext} from '../../UserContext';

const StyledInvoiceContainer = styled.div``;
const StyledGridContainer = styled(Grid)`
    width: 100%;
`;
const StyledCardHeader = styled(CardHeader)`
    '& .muicardheader-title': {
        font-weight: 800;
    }
`;

export default function Invoices() {
    const {actor} = useUserContext();
    const {data: invoices, isFetched} = useReadAllInvoices();

    const columns = [
        {field: 'orderId', headerName: 'ID', flex: 1},
        {
            field: 'fullName',
            headerName: 'Patient Name',
            valueGetter: (params) =>
                `${params.row.patientFirstName || ''} ${params.row.patientLastName || ''}`,
            flex: 1,
        },
        {
            field: 'computedAmountMoney',
            headerName: 'Amount $',
            valueGetter: (params) => params.row.computedAmountMoney / 100,
            flex: 1,
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            description: 'Only PAID status rows are included in the invoice totals above',
        },
        {
            field: 'officeName',
            headerName: 'Office',
            flex: 1,
        },
        {
            field: 'createdAt',
            headerName: 'Invoice Date',
            valueGetter: (params) =>
                moment.utc(params.row.createdAt).tz(actor.timezone).format('MM/DD/YYYY HH:mm'),
            flex: 1,
        },
    ];
    return (
        <StyledInvoiceContainer>
            <StyledGridContainer container spacing={2}>
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <StyledCardHeader
                            title={'Daily Invoices'}
                            titleTypographyProps={{variant: 'h4'}}
                        />
                        <CardContent>
                            <div>{`Today: $${invoices?.todayTotalPaid / 100}`}</div>
                            <div>
                                <br />
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <StyledCardHeader
                            title={'Weekly Invoices'}
                            titleTypographyProps={{variant: 'h4'}}
                        />
                        <CardContent>
                            <div>{`This Week (to date): $${
                                invoices?.thisWeekTotalPaid / 100
                            }`}</div>
                            <div>{`Last Week: $${invoices?.lastWeekTotalPaid / 100}`}</div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card variant="outlined">
                        <StyledCardHeader
                            title={'Monthly Invoices'}
                            titleTypographyProps={{variant: 'h4'}}
                        />
                        <CardContent>
                            <div>{`This Month (to date): $${
                                invoices?.currentMonthTotalPaid / 100
                            }`}</div>
                            <div>{`Last Month: $${invoices?.lastMonthTotalPaid / 100}`}</div>
                        </CardContent>
                    </Card>
                </Grid>
                {isFetched && invoices?.invoices && (
                    <Grid item xs={12}>
                        <DataGrid
                            rows={invoices?.invoices}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            initialState={{
                                sorting: {
                                    sortModel: [{field: 'createdAt', sort: 'desc'}],
                                },
                            }}
                        />
                    </Grid>
                )}
            </StyledGridContainer>
        </StyledInvoiceContainer>
    );
}
