import React, {useCallback, useMemo} from 'react';
import {
    StyledButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
    StyledTextField,
} from '../../shared/StyledElements';
import {Dialog, DialogContent, Grid, LinearProgress} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
import {useUserContext} from '../../../UserContext';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import * as yup from 'yup';
import {useFormik} from 'formik';
import {StyledSubsectionTitle} from '../../eprescribe/PrescriptionCreate';
import {
    useReadMostRecentPrescriptionForPatient,
    useSubmitRenewalRequest,
} from '../../../api/prescriptionApi';
import {useReadPatientForActor} from '../../../api/patientApi';
import {Roles} from '../../../constants/ActorContstants';

export default function PatientRenewalRequestModal({setDialogOpen, dialogOpen}) {
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Prescription renewal has been successfully requested.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(`There was an error requesting the Prescription Renewal`, {
                variant: 'error',
            });
        },
    };

    const {data: patient, isLoading: patientLoading} = useReadPatientForActor(
        actor.id,
        actor.role === Roles.PATIENT.moniker
    );
    const {data: mostRecentRx, isLoading: mostRecentRxLoading} =
        useReadMostRecentPrescriptionForPatient(patient?.id);

    const {mutate: submitRenewalRequest} = useSubmitRenewalRequest(submissionOptions);

    const validationSchema = yup.object({
        comments: yup.string(),
    });

    const initialValues = useMemo(() => {
        if (patient?.id && mostRecentRx) {
            const {primaryPhysician, lastName, firstName, dob, id: patientId} = patient;
            const {
                office,
                physicianLastName,
                physicianFirstName,
                medication,
                id: prescriptionId,
                sig,
                quantity,
                refillsAuthorized,
            } = mostRecentRx;
            const {displayName: medicationName} = medication;
            return {
                comments: '',
                primaryPhysician,
                firstName,
                lastName,
                dob,
                patientId,
                officeName: office.name,
                physicianLastName,
                physicianFirstName,
                medicationName,
                sig,
                quantity,
                refillsAuthorized,
                prescriptionId,
            };
        } else {
            return {comments: ''};
        }
    }, [patient, mostRecentRx]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: (values) => {
            submitRenewalRequest({
                body: {
                    lastPrescriptionId: values.prescriptionId,
                    comments: values.comments,
                },
            });
        },
    });
    const {values, resetForm, handleSubmit, handleChange} = formik;

    const cancelForm = useCallback(() => {
        resetForm(initialValues);
        setDialogOpen(false);
    }, [initialValues, setDialogOpen, resetForm]);

    return (
        <Dialog open={dialogOpen} onClose={cancelForm} maxWidth="md" fullWidth>
            {(patientLoading || mostRecentRxLoading) && <LinearProgress />}
            {!patientLoading && !mostRecentRxLoading && values.patientId && (
                <StyledDialogContainer>
                    <StyledDialogTitle>Request Prescription Renewal</StyledDialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Prescribing Physician</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={6}>
                                <StyledTextField
                                    label="First Name"
                                    fullWidth
                                    value={values.physicianFirstName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <StyledTextField
                                    label="Last Name"
                                    fullWidth
                                    value={values.physicianLastName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Patient</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={4}>
                                <StyledTextField
                                    label="First Name"
                                    fullWidth
                                    value={values.firstName || ''}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <StyledTextField
                                    label="Last Name"
                                    fullWidth
                                    value={values.lastName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <DesktopDatePicker
                                        label="DOB (MM/DD/YYYY)"
                                        inputFormat="MM/DD/YYYY"
                                        value={values?.dob}
                                        disabled
                                        onChange={() => {}}
                                        renderInput={(params) => (
                                            <StyledTextField {...params} fullWidth />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Dispensing Pharmacy</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Office Name"
                                    fullWidth
                                    value={values.officeName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledSubsectionTitle>Last Prescription</StyledSubsectionTitle>
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Medication"
                                    fullWidth
                                    value={values.medicationName}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Directions"
                                    fullWidth
                                    value={values.sig}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Quantity"
                                    fullWidth
                                    value={values.quantity}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    label="Refills Authorized"
                                    fullWidth
                                    value={values.refillsAuthorized}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledTextField
                                    autoFocus
                                    name="comments"
                                    id="comments"
                                    label="Comments"
                                    fullWidth
                                    margin={'normal'}
                                    value={values.comments}
                                    onChange={handleChange}
                                    multiline
                                />
                            </Grid>
                            <StyledDialogActions>
                                <StyledButton variant={'contained'} onClick={cancelForm}>
                                    Cancel
                                </StyledButton>
                                <StyledButton variant={'contained'} type="submit">
                                    Request Rx Renewal
                                </StyledButton>
                            </StyledDialogActions>
                        </form>
                    </DialogContent>
                </StyledDialogContainer>
            )}
        </Dialog>
    );
}
