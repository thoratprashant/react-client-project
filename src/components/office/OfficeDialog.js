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
import {useCreateOffice, useEditOffice} from '../../api/officeApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {states} from '../../constants/CommonConstants';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../shared/StyledElements';

export default function OfficeDialog({dialogOpen, setDialogOpen, office, setSelectedOffice}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const isEdit = office?.id;

    const initialValues = useMemo(
        () => ({
            name: '',
            npi: '',
            nabpId: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            stateCode: '',
            zip: '',
            hasWegovy: true,
        }),
        []
    );

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['offices']}).then(() => {
                enqueueSnackbar(`Office has been successfully ${isEdit ? 'updated' : 'created'}.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
                setSelectedOffice(initialValues);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error ${isEdit ? 'editing' : 'creating'} the office${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitOffice} = useCreateOffice(submissionOptions);
    const {mutate: editOffice} = useEditOffice(submissionOptions);

    const validationSchema = yup.object({
        name: yup.string().required('Required'),
        npi: yup.string().required('Required'),
        nabpId: yup.string().required('Required'),
        phone: yup
            .string()
            .length(10, 'Phone must be exactly 10 numeric digits')
            .required('Required'),
        addressLine1: yup.string().required('Required'),
        addressLine2: yup.string(),
        city: yup.string().required('Required'),
        stateCode: yup.string().length(2).required('Required'),
        zip: yup.string().required('Required'),
        hasWegovy: yup.boolean().required('Required'),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: office && office.id ? office : initialValues,
        validationSchema,
        onSubmit: (values) => {
            if (isEdit) {
                editOffice({body: values});
            } else {
                submitOffice({body: values});
            }
        },
    });

    const {values, resetForm, errors, touched, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        resetForm(initialValues);
        setDialogOpen(false);
        setSelectedOffice(initialValues);
    }, [initialValues, setDialogOpen, resetForm, setSelectedOffice]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            <StyledDialogContainer>
                <StyledDialogTitle>{`${isEdit ? 'Edit' : 'Create New'} Office`}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="name"
                            id="name"
                            label="Office Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.name}
                            onChange={handleChange}
                            error={touched.name && Boolean(errors.name)}
                            helperText={touched.name && errors.name}
                        />
                        <TextField
                            name="npi"
                            id="npi"
                            label="NPI"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.npi}
                            onChange={handleChange}
                            error={touched.npi && Boolean(errors.npi)}
                            helperText={touched.npi && errors.npi}
                        />
                        <TextField
                            name="nabpId"
                            id="nabpId"
                            label="NABP ID"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.nabpId}
                            onChange={handleChange}
                            error={touched.nabpId && Boolean(errors.nabpId)}
                            helperText={touched.nabpId && errors.nabpId}
                        />
                        <TextField
                            type="number"
                            name="phone"
                            id="phone"
                            label="Phone #"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.phone}
                            onChange={handleChange}
                            error={touched.phone && Boolean(errors.phone)}
                            helperText={touched.phone && errors.phone}
                            onWheel={(e) => e.target.blur()}
                        />
                        <TextField
                            name="addressLine1"
                            id="addressLine1"
                            label="Address Line 1"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.addressLine1}
                            onChange={handleChange}
                            error={touched.addressLine1 && Boolean(errors.addressLine1)}
                            helperText={touched.addressLine1 && errors.addressLine1}
                        />
                        <TextField
                            name="addressLine2"
                            id="addressLine2"
                            label="Address Line 2"
                            fullWidth
                            margin={'normal'}
                            value={values.addressLine2}
                            onChange={handleChange}
                            error={touched.addressLine2 && Boolean(errors.addressLine2)}
                            helperText={touched.addressLine2 && errors.addressLine2}
                        />
                        <TextField
                            name="city"
                            id="city"
                            label="City"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.city}
                            onChange={handleChange}
                            error={touched.city && Boolean(errors.city)}
                            helperText={touched.city && errors.city}
                        />
                        <TextField
                            select
                            name="stateCode"
                            id="stateCode"
                            label="State Code"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.stateCode}
                            onChange={handleChange}
                            error={touched.stateCode && Boolean(errors.stateCode)}
                            helperText={touched.stateCode && errors.stateCode}
                        >
                            {states.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            name="zip"
                            id="zip"
                            label="Zip"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.zip}
                            onChange={handleChange}
                            error={touched.zip && Boolean(errors.zip)}
                            helperText={touched.zip && errors.zip}
                        />
                        <FormGroup>
                            <FormControlLabel
                                label={'Dispensing Wegovy'}
                                control={
                                    <Checkbox
                                        id="wegovy-checkbox"
                                        name={'hasWegovy'}
                                        checked={values.hasWegovy}
                                        onChange={handleChange}
                                        defaultValue={true}
                                        disabled
                                    />
                                }
                            />
                        </FormGroup>
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                {`${isEdit ? 'Edit' : 'Create'} Office`}
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </Dialog>
    );
}
