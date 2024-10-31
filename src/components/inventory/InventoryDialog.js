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
import {useEditInventory} from '../../api/medicationApi';

export default function MedicationDialog({dialogOpen, setDialogOpen, medication}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['medications']}).then(() => {
                enqueueSnackbar(`Inventory has been successfully updated.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error editing the inventory${data?.message && ': ' + data.message}`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: editMedication} = useEditInventory(submissionOptions);

    const validationSchema = yup.object({
        id: yup.number().required('Required'),
        officeId: yup.number().required('Required'),
        inventoryOnHand: yup
            .number()
            .integer('Must be an integer')
            .min(0, 'Must be >= 0')
            .required('Required'),
        inventoryMinimum: yup
            .number()
            .integer('Must be an integer')
            .positive('Must be > 0')
            .required('Required'),
        inventoryMaximum: yup
            .number()
            .integer('Must be an integer')
            .positive('Must be > 0')
            .required('Required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: medication,
        validationSchema,
        onSubmit: (values) => {
            editMedication({body: values});
        },
    });

    const {values, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        setDialogOpen(false);
    }, [setDialogOpen]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`Edit Medication`}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="displayName"
                            id="displayName"
                            label="Medication Name"
                            fullWidth
                            required
                            disabled
                            margin={'normal'}
                            value={values.displayName}
                            onChange={handleChange}
                            error={touched.displayName && Boolean(errors.displayName)}
                            helperText={touched.displayName && errors.displayName}
                        />
                        <TextField
                            name="inventoryOnHand"
                            id="inventoryOnHand"
                            label="On Hand"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.inventoryOnHand}
                            onChange={handleChange}
                            error={touched.inventoryOnHand && Boolean(errors.inventoryOnHand)}
                            helperText={touched.inventoryOnHand && errors.inventoryOnHand}
                        />
                        <TextField
                            name="inventoryMinimum"
                            id="inventoryMinimum"
                            label="Minimum"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.inventoryMinimum}
                            onChange={handleChange}
                            error={touched.inventoryMinimum && Boolean(errors.inventoryMinimum)}
                            helperText={touched.inventoryMinimum && errors.inventoryMinimum}
                        />
                        <TextField
                            name="inventoryMaximum"
                            id="inventoryMaximum"
                            label="Maximum"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.inventoryMaximum}
                            onChange={handleChange}
                            error={touched.inventoryMaximum && Boolean(errors.inventoryMaximum)}
                            helperText={touched.inventoryMaximum && errors.inventoryMaximum}
                        />
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                {`Edit Inventory`}
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
