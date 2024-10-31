import React, {useCallback, useMemo} from 'react';
import {
    Checkbox,
    Dialog,
    DialogContent,
    FormControlLabel,
    FormGroup,
    MenuItem,
    TextField,
} from '@mui/material';
import * as yup from 'yup';
import {useFormik} from 'formik';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {units_of_measure} from '../../constants/CommonConstants';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../shared/StyledElements';
import {useCreateMedication, useEditMedication} from '../../api/medicationApi';
import {useReadAllOffices} from '../../api/officeApi';
import {Roles} from '../../constants/ActorContstants';
import {useUserContext} from '../../UserContext';

export default function MedicationDialog({
    dialogOpen,
    setDialogOpen,
    medication,
    setSelectedMedication,
}) {
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {data: offices, isLoading: isOfficesLoading} = useReadAllOffices();
    const {enqueueSnackbar} = useSnackbar();
    const isEdit = Boolean(medication?.id);

    const initialValues = useMemo(
        () => ({
            displayName: '',
            ndc: '',
            cogs: '',
            quantity: '',
            unitOfMeasure: '',
            disabled: false,
            officeId: medication?.office?.id ?? '',
        }),
        [medication]
    );

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['medications']}).then(() => {
                enqueueSnackbar(
                    `Medication has been successfully ${isEdit ? 'updated' : 'created'}.`,
                    {
                        variant: 'success',
                    }
                );
                setDialogOpen(false);
                setSelectedMedication(initialValues);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error ${isEdit ? 'editing' : 'creating'} the medication${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitMedication} = useCreateMedication(submissionOptions);
    const {mutate: editMedication} = useEditMedication(submissionOptions);

    const validationSchema = yup.object({
        displayName: yup.string().required('Required'),
        ndc: yup.string().required('Required'),
        cogs: yup.number().required('Required'),
        quantity: yup.number().required('Required'),
        unitOfMeasure: yup.string().required('Required'),
        disabled: yup.bool(),
        officeId: yup.number().required('Required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: medication && medication.id ? medication : initialValues,
        validationSchema,
        onSubmit: (values) => {
            if (isEdit) {
                editMedication({body: values});
            } else {
                submitMedication({body: values});
            }
        },
    });

    const {values, resetForm, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        resetForm(initialValues);
        setDialogOpen(false);
        setSelectedMedication(initialValues);
    }, [initialValues, setDialogOpen, resetForm, setSelectedMedication]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`${
                    isEdit ? 'Edit' : 'Create New'
                } Medication`}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="displayName"
                            id="displayName"
                            label="Medication Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.displayName}
                            onChange={handleChange}
                            error={touched.displayName && Boolean(errors.displayName)}
                            helperText={touched.displayName && errors.displayName}
                        />
                        <TextField
                            name="ndc"
                            id="ndc"
                            label="NDC"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.ndc}
                            onChange={handleChange}
                            error={touched.ndc && Boolean(errors.ndc)}
                            helperText={touched.ndc && errors.ndc}
                        />
                        <TextField
                            name="cogs"
                            id="cogs"
                            label="COGS"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.cogs}
                            onChange={handleChange}
                            error={touched.cogs && Boolean(errors.cogs)}
                            helperText={touched.cogs && errors.cogs}
                        />
                        <TextField
                            select
                            name="unitOfMeasure"
                            id="unitOfMeasure"
                            label="Unit of Measure"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.unitOfMeasure}
                            onChange={handleChange}
                            error={touched.unitOfMeasure && Boolean(errors.unitOfMeasure)}
                            helperText={touched.unitOfMeasure && errors.unitOfMeasure}
                        >
                            {units_of_measure.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
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
                        {!isOfficesLoading && (
                            <TextField
                                fullWidth
                                label={'Office'}
                                id="office-select"
                                name={'officeId'}
                                value={values.officeId}
                                onChange={handleChange}
                                error={errors.officeId}
                                margin={'normal'}
                                helperText={touched.officeId && errors.officeId}
                                select
                                disabled={!offices || offices.length <= 1}
                                required
                            >
                                {offices?.map(({id, name}, i) => (
                                    <MenuItem key={`office-option-${i}`} value={id}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        <FormGroup>
                            <FormControlLabel
                                label={'Medication Disabled'}
                                control={
                                    <Checkbox
                                        id="disabled-checkbox"
                                        name={'disabled'}
                                        checked={values.disabled}
                                        onChange={handleChange}
                                        defaultValue={false}
                                        disabled={!isEdit}
                                    />
                                }
                            />
                        </FormGroup>
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton
                                variant={'contained'}
                                type="submit"
                                disabled={actor.role !== Roles.ADMINISTRATOR.moniker}
                            >
                                {`${isEdit ? 'Edit' : 'Create'} Medication`}
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
