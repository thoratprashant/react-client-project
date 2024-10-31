import React, {useCallback} from 'react';
import {Dialog, DialogContent, MenuItem, TextField} from '@mui/material';
import * as yup from 'yup';
import {useFormik} from 'formik';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../shared/StyledElements';
import {useUpdateOfficeDeviceShipment} from '../../api/officeDeviceApi';
import {shippers} from '../../constants/CommonConstants';

export default function ShippedDialog({
    dialogOpen,
    setDialogOpen,
    selectedShipment,
    setSelectedShipment,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['shipments']}).then(() => {
                enqueueSnackbar(`Device shipment has been successfully marked as shipped.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
                setSelectedShipment(undefined);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error updating device shipment${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: updateShipment} = useUpdateOfficeDeviceShipment(submissionOptions);

    const validationSchema = yup.object({
        trackingNumber: yup.string().required(),
        invoiceNumber: yup.string().required(),
        shipper: yup.string().oneOf(['FEDEX', 'UPS', 'USPS']).required(),
        shipmentStatus: yup.string().required(),
        quantity: yup
            .number()
            .integer('Must be an integer')
            .min(1, 'Must be > 0')
            .required('Required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {...selectedShipment, shipmentStatus: 'SHIPPED'},
        validationSchema,
        onSubmit: (values) => {
            updateShipment({body: values});
        },
    });

    const {values, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        setDialogOpen(false);
    }, [setDialogOpen]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`Ship ${selectedShipment.deviceName}`}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            name="deviceName"
                            id="deviceName"
                            label="Device Name"
                            fullWidth
                            required
                            disabled
                            margin={'normal'}
                            value={values.deviceName}
                            error={touched.deviceName && Boolean(errors.deviceName)}
                            helperText={touched.deviceName && errors.deviceName}
                        />
                        <TextField
                            autoFocus
                            name="quantity"
                            id="quantity"
                            label="Quantity"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.quantity}
                            onChange={handleChange}
                            error={touched.quantity && Boolean(errors.quantity)}
                            helperText={touched.quantity && errors.quantity}
                        />
                        <TextField
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
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                Mark as Shipped
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
