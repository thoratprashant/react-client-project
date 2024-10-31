import React, {Fragment, useCallback, useState} from 'react';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
} from '../../shared/StyledElements';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tab,
    Tabs,
} from '@mui/material';
import PhysicianRenewalRequestTable from './PhysicianRenewalRequestTable';
import Button from '@mui/material/Button';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {useCancelRenewalRequests} from '../../../api/prescriptionApi';

export default function PhysicianRenewalRequest() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [checkedRenewalRequestIds, setCheckedRenewalRequestIds] = useState([]);
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Renewal requests have beeen successfully cancelled.`, {
                    variant: 'success',
                });
                setDialogOpen(false);
                setCheckedRenewalRequestIds([]);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(`There was an error cancelling the renewal requests`, {
                variant: 'error',
            });
        },
    };

    const {mutate: submitCancelRenewalRequests} = useCancelRenewalRequests(submissionOptions);

    const handleSubmitCancel = useCallback(() => {
        submitCancelRenewalRequests({body: checkedRenewalRequestIds});
    }, [submitCancelRenewalRequests, checkedRenewalRequestIds]);

    return (
        <StyledContainer>
            <div>
                <StyledTableActionsContainer>
                    <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                            <Tab label="Pending Requests" />
                            <Tab label="Request History" />
                        </Tabs>
                    </Box>
                    <StyledCreateButton
                        onClick={() => {
                            setDialogOpen(true);
                        }}
                        variant="contained"
                        size="medium"
                        disabled={checkedRenewalRequestIds?.length === 0}
                    >
                        Cancel Requests
                    </StyledCreateButton>
                </StyledTableActionsContainer>
                {activeTab === 0 && (
                    <Fragment>
                        <h3>Pending Requests</h3>
                        <PhysicianRenewalRequestTable
                            includeProcessed={false}
                            checkedRenewalRequestIds={checkedRenewalRequestIds}
                            setCheckedRenewalRequestIds={setCheckedRenewalRequestIds}
                        />
                    </Fragment>
                )}
                {activeTab === 1 && (
                    <Fragment>
                        <h3>Request History</h3>
                        <PhysicianRenewalRequestTable
                            includeProcessed
                            checkedRenewalRequestIds={checkedRenewalRequestIds}
                            setCheckedRenewalRequestIds={setCheckedRenewalRequestIds}
                        />
                    </Fragment>
                )}
            </div>
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setCheckedRenewalRequestIds([]);
                }}
            >
                <DialogTitle>Cancel Renewal Requests</DialogTitle>
                <DialogContent>
                    <DialogContentText>{`Are you sure you want to cancel ${
                        checkedRenewalRequestIds?.length === 1 ? 'this' : 'these'
                    } ${checkedRenewalRequestIds?.length} ${
                        checkedRenewalRequestIds?.length === 1 ? 'request' : 'requests'
                    }`}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialogOpen(false);
                            setCheckedRenewalRequestIds([]);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitCancel} autoFocus>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledContainer>
    );
}
