import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useSearchParams} from 'react-router-dom';
import {useCreatePatient, useEditPatient, useReadAllPatients} from '../../api/patientApi';
import {useQueryClient} from '@tanstack/react-query';
import {useReadAllPhysicians} from '../../api/physicianApi';
import {useSnackbar} from 'notistack';
import * as yup from 'yup';
import moment from 'moment';
import {useFormik} from 'formik';
import {
    Breadcrumbs,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    LinearProgress,
    Link,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import {
    StyledBreadcrumbs,
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
} from '../shared/StyledElements';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
import {states} from '../../constants/CommonConstants';
import PatientPaymentSubscription from './PatientPaymentSubscription';
import {useReadOfficesForPhysician} from '../../api/officeApi';
import Button from '@mui/material/Button';

export default function Patient() {
    const paymentRef = useRef();
    const [showAddPaymentInfo, setShowAddPaymentInfo] = useState(false);
    const {patientId} = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const {
        data: patients,
        isLoading: isPatientsLoading,
        isError: isPatientsError,
    } = useReadAllPatients();

    const patient = useMemo(() => {
        if (patientId === 'new') {
            return {};
        } else if (patients && !isPatientsLoading && !isPatientsError) {
            // eslint-disable-next-line eqeqeq
            return patients.find((p) => p.id == patientId);
        }
        return {};
    }, [patients, isPatientsLoading, isPatientsError, patientId]);

    const queryClient = useQueryClient();
    const {data: physicians, isLoading: isPhysiciansLoading} = useReadAllPhysicians();
    // const {data: devices, isLoading: isDevicesLoading} = useReadAllPatientDevices();
    const {enqueueSnackbar} = useSnackbar();
    const isEdit = Boolean(patient?.id);
    const [subDialogOpen, setSubDialogOpen] = useState(false);

    const initialValues = useMemo(
        () => ({
            firstName: '',
            lastName: '',
            dob: null,
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            stateCode: '',
            zip: '',
            disabled: false,
            primaryPhysicianId: '',
            email: '',
            deviceExternalIdMap: {},
            primaryOfficeId: '',
            heightInches: '',
        }),
        []
    );

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['patients']}).then(() => {
                enqueueSnackbar(
                    `Patient has been successfully ${isEdit ? 'updated' : 'created'}.`,
                    {
                        variant: 'success',
                    }
                );
                if (data?.hasActivePaymentInfo) {
                    navigate('/patients');
                } else if (!isEdit) {
                    navigate(`/patients/${data.id}?noPaymentDialog=true`);
                } else {
                    setSubDialogOpen(true);
                }
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error ${isEdit ? 'updating' : 'creating'} the Patient${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: submitPatient} = useCreatePatient(submissionOptions);
    const {mutate: editPatient} = useEditPatient(submissionOptions);

    const validationSchema = yup.object({
        primaryPhysicianId: yup.number().required('Required'),
        firstName: yup.string().required('Required'),
        lastName: yup.string().required('Required'),
        dob: yup.date().required('Required'),
        phone: yup
            .string()
            .length(10, 'Phone must be exactly 10 numeric digits')
            .required('Required'),
        addressLine1: yup.string().required('Required'),
        addressLine2: yup.string().nullable(),
        city: yup.string().required('Required'),
        stateCode: yup.string().length(2).required('Required'),
        zip: yup.string().required('Required'),
        disabled: yup.boolean().required('Required'),
        email: yup.string().email('Enter a valid email').required('Required'),
        primaryOfficeId: yup.number().required('Required'),
        heightInches: yup
            .number()
            .typeError('Must be a number')
            .moreThan(9.999, 'A minimum height of 10 inches is required')
            .nullable(true),
    });

    const formattedPatient = useMemo(() => {
        if (!patient) return patient;
        const formatted = {...patient};
        formatted.dob = moment(patient.dob).format('MM/DD/YYYY');
        return formatted;
    }, [patient]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: patient && patient.id ? formattedPatient : initialValues,
        validationSchema,
        onSubmit: (values) => {
            if (isEdit) {
                editPatient({body: values});
            } else {
                submitPatient({body: values});
            }
        },
    });

    const {values, errors, touched, handleSubmit, handleChange, resetForm, setFieldValue} = formik;

    const {data: offices, isLoading: isOfficesLoading} = useReadOfficesForPhysician(
        values.primaryPhysicianId
    );

    const cancelForm = useCallback(() => {
        resetForm(initialValues);
        navigate('/patients');
    }, [initialValues, resetForm, navigate]);

    const createOrEditPatient = useMemo(() => {
        return `${isEdit ? 'Edit' : 'Create New'} Patient`;
    }, [isEdit]);

    useEffect(() => {
        if (offices && !isOfficesLoading && values.primaryOfficeId) {
            if (!offices.map((o) => o.id).includes(values.primaryOfficeId)) {
                setFieldValue('primaryOfficeId', '');
            }
        }
    }, [isOfficesLoading, offices, values.primaryOfficeId, setFieldValue]);

    useEffect(() => {
        const noPayDialog = searchParams.get('noPaymentDialog');
        if (searchParams && noPayDialog && patients && !isPatientsLoading) {
            if (noPayDialog === 'true') setSubDialogOpen(true);
            setSearchParams({});
        }
    }, [searchParams, setSearchParams, patients, isPatientsLoading]);

    const handleScroll = useCallback(() => {
        setSubDialogOpen(false);
        setSearchParams({});
        setTimeout(() => {
            paymentRef.current.scrollIntoView();
        }, 0);
    }, [paymentRef, setSearchParams]);

    return (
        <div>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link href="/patients">Patients</Link>
                    <Typography color="text.primary">
                        {isEdit ? 'Update Patient' : 'Create Patient'}
                    </Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            <StyledDialogContainer>
                <StyledDialogTitle>{createOrEditPatient}</StyledDialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            name="firstName"
                            id="firstName"
                            label="First Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.firstName}
                            onChange={handleChange}
                            error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                            helperText={touched.firstName && errors.firstName}
                        />
                        <TextField
                            name="lastName"
                            id="lastName"
                            label="Last Name"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.lastName}
                            onChange={handleChange}
                            error={touched.lastName && Boolean(errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                        />
                        <TextField
                            type={'email'}
                            name="email"
                            id="email"
                            label="Email"
                            disabled={isEdit && Boolean(patient.externalPatientId)}
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.email}
                            onChange={handleChange}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                        />
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DesktopDatePicker
                                label="Date of Birth"
                                inputFormat="MM/DD/YYYY"
                                value={values.dob}
                                onChange={(newVal) => {
                                    if (newVal === null) setFieldValue('dob', newVal);
                                    else {
                                        setFieldValue('dob', newVal.format('MM/DD/yyyy'));
                                    }
                                }}
                                error={touched.dob && Boolean(errors.dob)}
                                helperText={touched.dob && errors.dob}
                                renderInput={(params) => (
                                    <TextField {...params} margin={'normal'} required fullWidth />
                                )}
                            />
                        </LocalizationProvider>
                        <TextField
                            type="number"
                            name="phone"
                            id="phone"
                            label="Phone #"
                            fullWidth
                            required
                            margin={'normal'}
                            value={values.phone}
                            onChange={(e) => {
                                e.target.value = Number(e.target.value.substring(0, 10));
                                handleChange(e);
                            }}
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
                        {isPhysiciansLoading && <LinearProgress />}
                        {!isPhysiciansLoading && (
                            <TextField
                                required
                                fullWidth
                                label={'Primary Physician'}
                                id="primary-physician-select"
                                name={'primaryPhysicianId'}
                                value={values.primaryPhysicianId}
                                onChange={handleChange}
                                error={touched.primaryPhysicianId && errors.primaryPhysicianId}
                                margin={'normal'}
                                helperText={touched.primaryPhysicianId && errors.primaryPhysicianId}
                                select
                                disabled={!physicians || physicians.length === 0}
                            >
                                {physicians?.map(({id, lastName, firstName}, i) => (
                                    <MenuItem key={`physician-option-${i}`} value={id}>
                                        {`${lastName}, ${firstName}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {!isOfficesLoading && Boolean(offices) && (
                            <TextField
                                required
                                fullWidth
                                label={'Primary Office'}
                                id="primary-office-select"
                                name={'primaryOfficeId'}
                                value={values.primaryOfficeId}
                                onChange={handleChange}
                                error={touched.primaryOfficeId && errors.primaryOfficeId}
                                margin={'normal'}
                                helperText={touched.primaryOfficeId && errors.primaryOfficeId}
                                select
                                disabled={
                                    !physicians ||
                                    !values.primaryPhysicianId ||
                                    isOfficesLoading ||
                                    !offices
                                }
                            >
                                {offices?.map(({id, name}, i) => (
                                    <MenuItem key={`office-option-${i}`} value={id}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        <TextField
                            name="heightInches"
                            id="heightInches"
                            label="Patients Height (Inches)"
                            fullWidth
                            margin={'normal'}
                            value={values.heightInches}
                            onChange={handleChange}
                            error={touched.heightInches && Boolean(errors.heightInches)}
                            helperText={touched.heightInches && errors.heightInches}
                        />
                        <FormGroup>
                            <FormControlLabel
                                label={'Patient Disabled'}
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
                        <PatientPaymentSubscription
                            ref={paymentRef}
                            primaryOfficeId={values.primaryOfficeId}
                            primaryPhysicianId={values.primaryPhysicianId}
                            patientId={values.id}
                            firstName={values.firstName}
                            lastName={values.lastName}
                            isPatientDisabled={values.disabled}
                            addressLine1={values.addressLine1}
                            addressLine2={values.addressLine2}
                            city={values.city}
                            stateCode={values.stateCode}
                            zip={values.zip}
                            isEdit={isEdit}
                            showAddPaymentInfo={showAddPaymentInfo}
                            setShowAddPaymentInfo={setShowAddPaymentInfo}
                        />
                        {/*{isDevicesLoading && <LinearProgress />}*/}
                        {/*{!isDevicesLoading &&*/}
                        {/*    devices.map(*/}
                        {/*        ({*/}
                        {/*            deviceType,*/}
                        {/*            deviceTypeDescription,*/}
                        {/*            deviceIdentifierType,*/}
                        {/*            deviceIdentifierTypeDescription,*/}
                        {/*        }) => (*/}
                        {/*            <Fragment key={`device-${deviceType}`}>*/}
                        {/*                <StyledDialogTitle key={`device-${deviceType}-title`}>*/}
                        {/*                    {deviceTypeDescription}*/}
                        {/*                </StyledDialogTitle>*/}
                        {/*                <TextField*/}
                        {/*                    key={`device-${deviceType}-externalId`}*/}
                        {/*                    name={`deviceExternalIdMap.${deviceType}.externalIdentifier`}*/}
                        {/*                    id={`deviceExternalIdMap.${deviceType}.externalIdentifier`}*/}
                        {/*                    label={deviceIdentifierTypeDescription}*/}
                        {/*                    fullWidth*/}
                        {/*                    margin={'normal'}*/}
                        {/*                    value={*/}
                        {/*                        values.deviceExternalIdMap[deviceType]*/}
                        {/*                            ?.externalIdentifier || ''*/}
                        {/*                    }*/}
                        {/*                    onChange={handleChange}*/}
                        {/*                    error={*/}
                        {/*                        touched?.deviceExternalIdMap &&*/}
                        {/*                        touched?.deviceExternalIdMap[deviceType]*/}
                        {/*                            ?.externalIdentifier &&*/}
                        {/*                        Boolean(errors?.deviceExternalIdMap) &&*/}
                        {/*                        Boolean(*/}
                        {/*                            errors?.deviceExternalIdMap[deviceType]*/}
                        {/*                                ?.externalIdentifier*/}
                        {/*                        )*/}
                        {/*                    }*/}
                        {/*                    helperText={*/}
                        {/*                        touched?.deviceExternalIdMap &&*/}
                        {/*                        touched?.deviceExternalIdMap[deviceType]*/}
                        {/*                            ?.externalIdentifier &&*/}
                        {/*                        Boolean(errors?.deviceExternalIdMap) &&*/}
                        {/*                        Boolean(*/}
                        {/*                            errors?.deviceExternalIdMap[deviceType]*/}
                        {/*                                ?.externalIdentifier*/}
                        {/*                        )*/}
                        {/*                    }*/}
                        {/*                />*/}
                        {/*                <FormGroup key={`device-${deviceType}-disabled`}>*/}
                        {/*                    <FormControlLabel*/}
                        {/*                        label={`${deviceTypeDescription} Disabled`}*/}
                        {/*                        control={*/}
                        {/*                            <Checkbox*/}
                        {/*                                id={`deviceExternalIdMap.${deviceType}.disabled`}*/}
                        {/*                                name={`deviceExternalIdMap.${deviceType}.disabled`}*/}
                        {/*                                checked={*/}
                        {/*                                    values.deviceExternalIdMap[deviceType]*/}
                        {/*                                        ?.disabled || false*/}
                        {/*                                }*/}
                        {/*                                onChange={handleChange}*/}
                        {/*                                defaultValue={false}*/}
                        {/*                                disabled={!isEdit}*/}
                        {/*                            />*/}
                        {/*                        }*/}
                        {/*                    />*/}
                        {/*                </FormGroup>*/}
                        {/*            </Fragment>*/}
                        {/*        )*/}
                        {/*    )}*/}
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton
                                variant={'contained'}
                                type="submit"
                                disabled={showAddPaymentInfo}
                            >
                                Save
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                </DialogContent>
            </StyledDialogContainer>
            {subDialogOpen && (
                <Dialog
                    open={subDialogOpen}
                    onClose={() => navigate('/patients')}
                    aria-labelledby="alert-no-payment-subscription-title"
                    aria-describedby="alert-no-payment-subscription-description"
                >
                    <DialogTitle id="alert-no-payment-subscription-title">
                        Missing Payment Info
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-no-payment-subscription-description">
                            This patient is missing payment information. Would you like to add that
                            now?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => navigate('/patients')} variant={'contained'}>
                            No
                        </Button>
                        <Button onClick={handleScroll} autoFocus variant={'contained'}>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
}
