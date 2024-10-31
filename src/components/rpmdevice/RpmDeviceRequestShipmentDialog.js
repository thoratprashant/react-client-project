import React, {useCallback} from 'react';
import {Dialog, DialogContent, TextField} from '@mui/material';
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
import {useCreateOfficeDeviceShipment} from '../../api/officeDeviceApi';

export default function RpmDeviceRequestShipmentDialog({
    dialogOpen,
    setDialogOpen,
    officeDeviceId,
    deviceName,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['shipments']}).then(() => {
                enqueueSnackbar(`Device shipment has been successfully requested.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error requesting device shipment${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: requestShipment} = useCreateOfficeDeviceShipment(submissionOptions);

    const validationSchema = yup.object({
        officeDeviceId: yup.number().required('Required'),
        quantity: yup
            .number()
            .integer('Must be an integer')
            .min(1, 'Must be > 0')
            .required('Required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {officeDeviceId, quantity: undefined, deviceName},
        validationSchema,
        onSubmit: (values) => {
            requestShipment({body: values});
        },
    });

    const {values, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        setDialogOpen(false);
    }, [setDialogOpen]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`Request More ${deviceName}`}</StyledDialogTitle>
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
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                Request
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
