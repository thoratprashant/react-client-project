import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {
    StyledButton,
    StyledContainer,
    StyledCreateButton,
    StyledDialogActions,
    StyledDialogContainer,
    StyledDialogTitle,
    StyledTableActionsContainer,
} from '../../shared/StyledElements';
import EPrescriptionsTable from '../../eprescribe/EPrescriptionsTable';
import PatientRenewalRequestModal from './PatientRenewalRequestModal';
import {
    Box,
    Dialog,
    DialogContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
} from '@mui/material';
import PatientRenewalRequestTable from './PatientRenewalRequestTable';
import PatientRenewalRequestReminderTable from './PatientRenewalRequestReminderTable';
import {useReadPatientForActor} from '../../../api/patientApi';
import {
    useReadRenewalRequestsForPatient,
    useRespondToRenewalSuggestion,
} from '../../../api/prescriptionApi';
import {useUserContext} from '../../../UserContext';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';

export default function PatientRenewalRequest() {
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmValue, setConfirmValue] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const {data: patient} = useReadPatientForActor(actor.id, true);
    const {data, isLoading} = useReadRenewalRequestsForPatient(patient?.id, true);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Prescription renewal has been successfully requested.`, {
                    variant: 'success',
                });
                setConfirmDialogOpen(false);
                setConfirmValue('');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(`There was an error requesting the Prescription Renewal`, {
                variant: 'error',
            });
        },
    };
    const {mutate: respondToRenewalSuggestion} = useRespondToRenewalSuggestion(submissionOptions);

    const showConfirmButton = useMemo(() => {
        return activeTab === 0 && !isLoading && data && data?.length;
    }, [activeTab, data, isLoading]);

    const handleConfirm = useCallback(() => {
        respondToRenewalSuggestion({body: {confirm: confirmValue}, renewalRequestId: data[0]?.id});
    }, [respondToRenewalSuggestion, confirmValue, data]);

    return (
        <StyledContainer>
            <div>
                <StyledTableActionsContainer>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Renewal Request Reminder" />
                            <Tab label="Prescription History" />
                            <Tab label="Renewal Request History" />
                        </Tabs>
                    </Box>
                    {!Boolean(showConfirmButton) && (
                        <StyledCreateButton
                            onClick={() => {
                                setRequestDialogOpen(true);
                            }}
                            variant="contained"
                            size="medium"
                        >
                            Request Rx Renewal
                        </StyledCreateButton>
                    )}
                    {Boolean(showConfirmButton) && (
                        <StyledCreateButton
                            onClick={() => {
                                setConfirmDialogOpen(true);
                            }}
                            variant="contained"
                            size="medium"
                        >
                            Respond to Renewal Suggestion
                        </StyledCreateButton>
                    )}
                </StyledTableActionsContainer>
                {activeTab === 0 && (
                    <Fragment>
                        <h3>Renewal Request Reminder</h3>
                        <PatientRenewalRequestReminderTable />
                    </Fragment>
                )}
                {activeTab === 1 && (
                    <Fragment>
                        <h3>Prescription History</h3>
                        <EPrescriptionsTable
                            searchValue={null}
                            prescriptionStatus={null}
                            source={'Renewal.PatientRenewalRequest'}
                            disableOnClick
                        />
                    </Fragment>
                )}
                {activeTab === 2 && (
                    <Fragment>
                        <h3>Renewal Request History</h3>
                        <PatientRenewalRequestTable />
                    </Fragment>
                )}
            </div>
            <PatientRenewalRequestModal
                setDialogOpen={setRequestDialogOpen}
                dialogOpen={requestDialogOpen}
            />
            <Dialog
                open={confirmDialogOpen}
                onClose={() => {
                    setConfirmDialogOpen(false);
                    setConfirmValue('');
                }}
                maxWidth="md"
                fullWidth
            >
                <StyledDialogContainer>
                    <StyledDialogTitle>Renewal Suggestion Response</StyledDialogTitle>
                    <DialogContent>
                        <FormControl required>
                            <FormLabel id="renewal-suggestion-label">
                                Would you like this Renewal?
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="renewal-suggestion-label"
                                name="radio-buttons-group"
                                value={confirmValue}
                                onChange={(e) => setConfirmValue(e.target.value)}
                            >
                                <FormControlLabel value={true} control={<Radio />} label="Yes" />
                                <FormControlLabel value={false} control={<Radio />} label="No" />
                            </RadioGroup>
                        </FormControl>
                    </DialogContent>
                    <StyledDialogActions>
                        <StyledButton
                            variant={'contained'}
                            onClick={() => {
                                setConfirmDialogOpen(false);
                                setConfirmValue('');
                            }}
                        >
                            Cancel
                        </StyledButton>
                        <StyledButton
                            variant={'contained'}
                            onClick={handleConfirm}
                            disabled={confirmValue === ''}
                        >
                            Save
                        </StyledButton>
                    </StyledDialogActions>
                </StyledDialogContainer>
            </Dialog>
        </StyledContainer>
    );
}
