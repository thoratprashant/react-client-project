import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router';
import {useReadPatient} from '../../api/patientApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import * as yup from 'yup';
import moment from 'moment';
import {useFormik} from 'formik';
import {useReadAllOffices} from '../../api/officeApi';
import {
    StyledBreadcrumbs,
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
    StyledFullWidthPageContainer,
} from '../shared/StyledElements';
import {
    Breadcrumbs,
    DialogContent,
    Grid,
    LinearProgress,
    Link,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
import {useCreatePrescription} from '../../api/prescriptionApi';
import {useReadMedicationsForOffice} from '../../api/medicationApi';
import {DAWCodes} from '../../constants/CommonConstants';
import {useUserContext} from '../../UserContext';
import styled from '@emotion/styled';

export const StyledSubsectionTitle = styled.h3`
    background-color: ${({theme}) => theme.palette.secondary.main};
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 5px;
    margin-top: 0px;
    margin-bottom: 0px;
    font-weight: 500;
`;
const StyledTextField = styled(TextField)`
    padding-left: 5px;
`;

export default function PrescriptionCreate() {
    const {actor} = useUserContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const location = useLocation();

    const {patientId, isNewPatient, source, medicationId, renewalRequestId} = location.state;

    const [hasDefaultQuantityPrescribed, setHasDefaultQuantityPrescribed] = useState(false);
    const [hasDefaultDaysSupply, setHasDefaultDaysSupply] = useState(false);
    const [hasDefaultRefillsAuthorized, setHasDefaultRefillsAuthorized] = useState(false);
    const [hasDefaultSig, setHasDefaultSig] = useState(false);
    const [doseIsRequired, setDoseIsRequired] = useState(false);

    const {data: existingPatient, isLoading: isExistingPatientLoading} = useReadPatient(
        isNewPatient ? null : patientId
    );
    // For dropdown options
    const {data: offices, isLoading: isOfficesLoading} = useReadAllOffices();

    const initialValues = useMemo(() => {
        const init = {
            officeId: '',
            medicationId: '',
            quantity: '',
            sig: '',
            refillsAuthorized: '',
            dawCode: '',
            dose: '',
            daysSupply: '',
        };
        if (!isOfficesLoading && offices?.length === 1) {
            init.officeId = offices[0].id;
        }
        if (isNewPatient) {
            init.patientId = null;
            init.patientFirstName = '';
            init.patientLastName = '';
            init.patientDob = '';
        } else {
            init.patientId = patientId;
            if (renewalRequestId) {
                init.renewalRequestId = renewalRequestId;
            }
            if (!isExistingPatientLoading) {
                init.patientFirstName = existingPatient?.firstName;
                init.patientLastName = existingPatient?.lastName;
                init.patientDob = existingPatient?.dob
                    ? moment(existingPatient.dob, 'YYYY-MM-DD')
                    : '';
            }
        }
        return init;
    }, [
        isNewPatient,
        existingPatient,
        isExistingPatientLoading,
        offices,
        isOfficesLoading,
        patientId,
        renewalRequestId,
    ]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Prescription has been successfully created.`, {
                    variant: 'success',
                });
                renewalRequestId ? navigate('/erx/renewalRequests') : navigate('/erx');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error creating the prescription${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitPrescription} = useCreatePrescription(submissionOptions);

    const validationSchema = yup.object({
        officeId: yup.number().required('Required'),
        patientFirstName: yup.string().required('Required'),
        patientLastName: yup.string().required('Required'),
        patientDob: yup.date().required('Required'),
        patientId: yup.lazy((value) =>
            isNewPatient ? yup.string().nullable() : yup.number().required('Required')
        ),
        renewalRequestId: yup.number(),
        medicationId: yup.number().required('Required'),
        sig: yup.string().required('Required'),
        refillsAuthorized: yup
            .number()
            .integer('Must be an integer')
            .moreThan(-1, 'Must be >= 0')
            .required('Required'),
        dawCode: yup.number().required('Required'),
        quantity: yup
            .number()
            .integer('Must be an integer')
            .moreThan(0, 'Must be > 0')
            .required('Required'),
        daysSupply: yup
            .number()
            .integer('Must be an integer')
            .moreThan(0, 'Must be > 0')
            .required('Required'),
        dose: yup.lazy((value) =>
            doseIsRequired ? yup.string().required('Required') : yup.string().nullable()
        ),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            const formatted = {...values};
            formatted.patientDob = values.patientDob.format('MM/DD/YYYY');
            submitPrescription({body: formatted});
        },
    });

    const {values, errors, touched, handleSubmit, handleChange, setFieldValue} = formik;

    const {data: meds, isLoading: isMedsLoading} = useReadMedicationsForOffice({
        officeId: values.officeId,
        includeDisabled: false,
    });

    const cancelForm = useCallback(() => {
        navigate('/erx');
    }, [navigate]);

    const handleOfficeChange = useCallback(
        (e) => {
            setFieldValue('medicationId', '');
            setFieldValue('dawCode', '');
            setFieldValue('quantity', '');
            setFieldValue('refillsAuthorized', '');
            setFieldValue('sig', '');
            setFieldValue('daysSupply', '');
            setFieldValue('dose', '');
            setHasDefaultQuantityPrescribed(false);
            setHasDefaultRefillsAuthorized(false);
            setHasDefaultSig(false);
            setHasDefaultDaysSupply(false);
            setDoseIsRequired(false);
            handleChange(e);
        },
        [handleChange, setFieldValue]
    );

    const handleMedChange = useCallback(
        (e) => {
            setFieldValue('medicationId', e.target.value);
            setFieldValue('dawCode', '');
            setFieldValue('dose', '');
            const selectedMed = meds.find((m) => m.id === e.target.value);
            setDoseIsRequired(selectedMed.requiresDoseOnPrescription);

            if (
                selectedMed.defaultQuantityPrescribed ||
                typeof selectedMed.defaultQuantityPrescribed === 'number'
            ) {
                setHasDefaultQuantityPrescribed(true);
                setFieldValue('quantity', selectedMed.defaultQuantityPrescribed);
            } else {
                setHasDefaultQuantityPrescribed(false);
                setFieldValue('quantity', '');
            }

            if (
                selectedMed.defaultRefillsAuthorized ||
                typeof selectedMed.defaultRefillsAuthorized === 'number'
            ) {
                setHasDefaultRefillsAuthorized(true);
                setFieldValue('refillsAuthorized', selectedMed.defaultRefillsAuthorized);
            } else {
                setHasDefaultRefillsAuthorized(false);
                setFieldValue('refillsAuthorized', '');
            }

            if (
                selectedMed.defaultDaysSupply ||
                typeof selectedMed.defaultDaysSupply === 'number'
            ) {
                setHasDefaultDaysSupply(true);
                setFieldValue('daysSupply', selectedMed.defaultDaysSupply);
            } else {
                setHasDefaultDaysSupply(false);
                setFieldValue('daysSupply', '');
            }

            if (selectedMed.defaultSig) {
                setHasDefaultSig(true);
                setFieldValue('sig', selectedMed.defaultSig);
            } else {
                setHasDefaultSig(false);
                setFieldValue('sig', '');
            }
        },
        [meds, setFieldValue]
    );

    useEffect(() => {
        if (medicationId && handleMedChange && meds?.length && !isMedsLoading) {
            handleMedChange({target: {value: medicationId}});
        }
    }, [medicationId, handleMedChange, meds, isMedsLoading]);

    return (
        <StyledFullWidthPageContainer>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    {source !== 'RenewalRequest' ? (
                        <Link href="/erx">E-Prescribe</Link>
                    ) : (
                        <Link href="/erx/renewalRequests">Renewal Requests</Link>
                    )}
                    <Typography color="text.primary">Create Prescription</Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            <StyledDialogContainer>
                <StyledDialogTitle>Create Prescription</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Prescribing Physician</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={6}>
                                <StyledTextField
                                    autoFocus
                                    label="First Name"
                                    fullWidth
                                    value={actor.firstName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <StyledTextField
                                    autoFocus
                                    label="Last Name"
                                    fullWidth
                                    value={actor.lastName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Patient</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={4}>
                                <StyledTextField
                                    autoFocus
                                    name="patientFirstName"
                                    id="patientFirstName"
                                    label="First Name"
                                    fullWidth
                                    required
                                    value={values?.patientFirstName || ''}
                                    onChange={handleChange}
                                    error={
                                        Boolean(touched.patientFirstName) &&
                                        Boolean(errors.patientFirstName)
                                    }
                                    helperText={touched.patientFirstName && errors.patientFirstName}
                                    disabled={!isNewPatient}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <StyledTextField
                                    name="patientLastName"
                                    id="patientLastName"
                                    label="Last Name"
                                    fullWidth
                                    required
                                    value={values?.patientLastName || ''}
                                    onChange={handleChange}
                                    error={
                                        touched.patientLastName && Boolean(errors.patientLastName)
                                    }
                                    helperText={touched.patientLastName && errors.patientLastName}
                                    disabled={!isNewPatient}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DesktopDatePicker
                                        label="DOB (MM/DD/YYYY)"
                                        inputFormat="MM/DD/YYYY"
                                        value={values?.patientDob || ''}
                                        onChange={(val) => {
                                            setFieldValue('patientDob', val);
                                        }}
                                        disabled={!isNewPatient}
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                required
                                                fullWidth
                                                error={
                                                    Boolean(touched.patientDob) &&
                                                    Boolean(errors.patientDob)
                                                }
                                                helperText={touched.patientDob && errors.patientDob}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Dispensing Pharmacy</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={12}>
                                {!isOfficesLoading && (
                                    <StyledTextField
                                        required
                                        fullWidth
                                        label={'Dispensing Pharmacy'}
                                        id="pharmacy-select"
                                        name={'officeId'}
                                        value={values.officeId}
                                        onChange={(e) => handleOfficeChange(e)}
                                        error={touched.officeId && errors.officeId}
                                        helperText={touched.officeId && errors.officeId}
                                        select
                                        disabled={isOfficesLoading || !offices}
                                        defaultValue={offices?.length === 1 ? offices[0].id : ''}
                                    >
                                        {offices?.map(({id, name}, i) => (
                                            <MenuItem key={`office-option-${i}`} value={id}>
                                                {name}
                                            </MenuItem>
                                        ))}
                                    </StyledTextField>
                                )}
                                {isOfficesLoading && <LinearProgress />}
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Medication</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    required
                                    fullWidth
                                    label={'Medication'}
                                    id="medication-select"
                                    name={'medicationId'}
                                    value={values.medicationId}
                                    onChange={handleMedChange}
                                    error={touched.medicationId && errors.medicationId}
                                    helperText={touched.medicationId && errors.medicationId}
                                    select
                                    disabled={isMedsLoading || !meds}
                                >
                                    {(meds || [])
                                        .sort(({displayName: a}, {displayName: b}) =>
                                            a.localeCompare(b)
                                        )
                                        .map(({id, displayName, inventoryOnHand}, i) => (
                                            <MenuItem
                                                key={`med-option-${i}`}
                                                value={id}
                                                disabled={inventoryOnHand === 0}
                                            >
                                                {`${displayName}${
                                                    inventoryOnHand === 0 ? ' (no inventory)' : ''
                                                }`}
                                            </MenuItem>
                                        ))}
                                </StyledTextField>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    name="sig"
                                    id="sig"
                                    label="Directions"
                                    fullWidth
                                    required
                                    value={values.sig}
                                    onChange={handleChange}
                                    error={touched.sig && Boolean(errors.sig)}
                                    helperText={touched.sig && errors.sig}
                                    disabled={hasDefaultSig || !values?.medicationId}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <StyledTextField
                                    name="quantity"
                                    id="quantity"
                                    label="Quantity"
                                    fullWidth
                                    required
                                    value={values.quantity}
                                    onChange={handleChange}
                                    error={touched.quantity && Boolean(errors.quantity)}
                                    helperText={touched.quantity && errors.quantity}
                                    onWheel={(e) => e.target.blur()}
                                    disabled={hasDefaultQuantityPrescribed || !values?.medicationId}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <StyledTextField
                                    type="number"
                                    name="refillsAuthorized"
                                    id="refillsAuthorized"
                                    label="Refills Authorized"
                                    fullWidth
                                    required
                                    value={values.refillsAuthorized}
                                    onChange={handleChange}
                                    error={
                                        touched.refillsAuthorized &&
                                        Boolean(errors.refillsAuthorized)
                                    }
                                    helperText={
                                        touched.refillsAuthorized && errors.refillsAuthorized
                                    }
                                    onWheel={(e) => e.target.blur()}
                                    disabled={hasDefaultRefillsAuthorized || !values?.medicationId}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <StyledTextField
                                    type="number"
                                    name="daysSupply"
                                    id="daysSupply"
                                    label="Days Supply"
                                    fullWidth
                                    required
                                    value={values.daysSupply}
                                    onChange={handleChange}
                                    error={touched.daysSupply && Boolean(errors.daysSupply)}
                                    helperText={touched.daysSupply && errors.daysSupply}
                                    onWheel={(e) => e.target.blur()}
                                    disabled={hasDefaultDaysSupply || !values?.medicationId}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <StyledTextField
                                    select
                                    name="dawCode"
                                    id="dawCode"
                                    label="DAW Code"
                                    fullWidth
                                    required
                                    value={values.dawCode}
                                    onChange={handleChange}
                                    error={touched.dawCode && Boolean(errors.dawCode)}
                                    helperText={touched.dawCode && errors.dawCode}
                                >
                                    {DAWCodes.map(({code, description}) => (
                                        <MenuItem key={code} value={code}>
                                            {description}
                                        </MenuItem>
                                    ))}
                                </StyledTextField>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    name="dose"
                                    id="dose"
                                    label="Doses"
                                    fullWidth
                                    required={doseIsRequired}
                                    value={values.dose}
                                    onChange={handleChange}
                                    error={touched.dose && Boolean(errors.dose)}
                                    helperText={touched.dose && errors.dose}
                                    onWheel={(e) => e.target.blur()}
                                    disabled={!values?.medicationId}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledDialogActions>
                                    <StyledButton variant={'contained'} onClick={cancelForm}>
                                        Cancel
                                    </StyledButton>
                                    <StyledButton variant={'contained'} type="submit">
                                        Submit
                                    </StyledButton>
                                </StyledDialogActions>
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
        </StyledFullWidthPageContainer>
    );
}
