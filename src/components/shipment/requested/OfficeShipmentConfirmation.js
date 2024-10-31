import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import * as yup from 'yup';
import {getIn, useFormik} from 'formik';
import {Dialog, DialogContent, MenuItem, TextField} from '@mui/material';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../../shared/StyledElements';
import {useCreateShipmentForMedicationOrders} from '../../../api/medicationOrderApi';
import {shippers} from '../../../constants/CommonConstants';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../../shared/VirtualizedTable';
import styled from '@emotion/styled';
import {renderToStaticMarkup} from 'react-dom/server';

const StyledAddressContainer = styled.div``;

export default function OfficeShipmentConfirmation({
    medOrders,
    setDialogOpen,
    dialogOpen,
    setSelectedMedOrderIds,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const [activeFieldName, setActiveFieldName] = useState('');

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['medicationOrders']}).then(() => {
                enqueueSnackbar(`Your shipment information was successfully saved.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
                setSelectedMedOrderIds([]);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error saving your shipment information${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: createShipment} = useCreateShipmentForMedicationOrders(submissionOptions);

    const validationSchema = yup.object({
        trackingNumber: yup.string().required(),
        invoiceNumber: yup.string().required(),
        shipper: yup.string().oneOf(['FEDEX', 'UPS', 'USPS']).required(),
        medOrderShipments: yup
            .array(
                yup
                    .object({
                        id: yup.number().required('Required'),
                        amountShipped: yup
                            .number()
                            .integer('Must be an integer')
                            .positive('Must be >= 0')
                            .required('Required'),
                    })
                    .required()
            )
            .required(),
    });
    const initialValues = useMemo(() => {
        const medOrderShipments = medOrders.map(({id, amountOrdered}) => ({
            id,
            amountShipped: amountOrdered,
        }));
        return {
            trackingNumber: '',
            invoiceNumber: '',
            shipper: '',
            medOrderShipments,
        };
    }, [medOrders]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            createShipment({body: values});
        },
    });

    const {values, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        setDialogOpen(false);
        setSelectedMedOrderIds([]);
    }, [setDialogOpen, setSelectedMedOrderIds]);

    const onChange = useCallback(
        (e) => {
            handleChange(e);
            setActiveFieldName(e.target.name);
        },
        [setActiveFieldName, handleChange]
    );

    const renderShippedAmountField = useCallback(
        (props) => {
            const {row} = props;
            const fieldName = `medOrderShipments[${row.index}].amountShipped`;

            return (
                <TextField
                    // TODO: this autofocus is a workaround for the field losing focus b/c it seems to be re-rendered and loses the key
                    autoFocus={activeFieldName === fieldName}
                    name={fieldName}
                    id={fieldName}
                    required
                    label="Amt Shipped"
                    fullWidth
                    value={getIn(values, fieldName)}
                    margin={'normal'}
                    onChange={onChange}
                    error={getIn(touched, fieldName) && Boolean(getIn(errors, fieldName))}
                    helperText={getIn(touched, fieldName) && getIn(errors, fieldName)}
                />
            );
        },
        [touched, errors, values, activeFieldName, onChange]
    );

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'ndc',
                header: 'NDC',
            },
            {
                accessorKey: 'medicationDisplayName',
                header: 'Medication',
            },
            {
                accessorKey: 'quantity',
                header: 'Qty',
                size: 40,
            },
            {
                accessorKey: 'unitOfMeasure',
                header: 'UOM',
                size: 40,
            },
            {
                accessorKey: 'amountOrdered',
                header: 'Amt Ordered',
            },
            {
                header: 'Amt Shipped',
                cell: (props) => renderShippedAmountField(props),
            },
        ];
        return cols;
    }, [renderShippedAmountField]);

    const table = useReactTable({
        data: medOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    const renderAddress = useCallback(() => {
        if (!medOrders || !medOrders[0]) return <></>;
        return (
            <div>
                <div>{medOrders[0]?.officeName}</div>
                <div>{medOrders[0]?.officeAddressLine1}</div>
                {medOrders[0]?.officeAddressLine2 && <div>{medOrders[0].officeAddressLine2}</div>}
                <div>{`${medOrders[0]?.officeCity}, ${medOrders[0]?.officeState} ${medOrders[0]?.officeZip}`}</div>
            </div>
        );
    }, [medOrders]);

    const print = useCallback(() => {
        const wind = window.open(
            'about:blank',
            '',
            'toolbar=yes,\n' +
                '                                    scrollbars=yes,\n' +
                '                                    resizable=yes,\n' +
                '                                    width=400,\n' +
                '                                    height=400'
        );
        wind.document.write(renderToStaticMarkup(renderAddress()));
        wind.document.close();
    }, [renderAddress]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`Create Shipment`}</StyledDialogTitle>
                <DialogContent>
                    <StyledAddressContainer>
                        {renderAddress()}
                        <StyledButton variant={'contained'} onClick={print}>
                            Print Shipping Label
                        </StyledButton>
                    </StyledAddressContainer>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="trackingNumber"
                            id="trackingNumber"
                            label="Tracking Number"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.trackingNumber}
                            onChange={handleChange}
                            error={touched.trackingNumber && Boolean(errors.trackingNumber)}
                            helperText={touched.trackingNumber && errors.trackingNumber}
                        />
                        <TextField
                            select
                            name="shipper"
                            id="shipper"
                            label="Shipped With"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.shipper}
                            onChange={handleChange}
                            error={touched.shipper && Boolean(errors.shipper)}
                            helperText={touched.shipper && errors.shipper}
                        >
                            {shippers.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            name="invoiceNumber"
                            id="invoiceNumber"
                            label="Invoice Number"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.invoiceNumber}
                            onChange={handleChange}
                            error={touched.invoiceNumber && Boolean(errors.invoiceNumber)}
                            helperText={touched.invoiceNumber && errors.invoiceNumber}
                        />
                        <VirtualizedTable
                            tableContainerRef={tableContainerRef}
                            rows={rows}
                            table={table}
                            dataIsLoading={false}
                        />
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                {`Create Shipment`}
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
