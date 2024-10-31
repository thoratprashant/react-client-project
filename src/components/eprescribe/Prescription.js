import React, {useCallback, useState} from 'react';
import {
    Breadcrumbs,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Link,
    Typography,
} from '@mui/material';
import {
    StyledBreadcrumbs,
    StyledCreateButton,
    StyledFullWidthPageContainer,
} from '../shared/StyledElements';
import styled from '@emotion/styled';
import {useNavigate, useParams} from 'react-router';
import {useCancelPrescription, useReadPrescription} from '../../api/prescriptionApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import Button from '@mui/material/Button';
import {PrescriptionStatus} from '../../constants/CommonConstants';
import PrescriptionDisplay from './PrescriptionDisplay';

const StyledPrescriptionContainer = styled.div`
    margin: 10px;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;
const StyledActionButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
`;

export default function Prescription() {
    const {prescriptionId} = useParams();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const {data: prescription} = useReadPrescription(prescriptionId);

    const cancelOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Your Prescription was successfully cancelled.`, {
                    variant: 'success',
                });
                navigate('/erx');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error cancelling your Prescription${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: cancelRx} = useCancelPrescription(cancelOptions);

    const handleClickCancel = useCallback(() => {
        setCancelDialogOpen(true);
    }, []);

    const handleCancel = useCallback(() => {
        cancelRx({prescriptionId});
    }, [cancelRx, prescriptionId]);

    const handleCloseCancelDialog = useCallback(() => {
        setCancelDialogOpen(false);
    }, []);

    return (
        <StyledFullWidthPageContainer>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link href="/erx">E-Prescribe</Link>
                    <Typography color="text.primary">Prescription</Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            <StyledActionButtonContainer>
                <StyledCreateButton
                    onClick={() => {
                        handleClickCancel();
                    }}
                    variant="contained"
                    size="medium"
                    disabled={!prescription || prescription?.status !== PrescriptionStatus.CREATED}
                >
                    Cancel Prescription
                </StyledCreateButton>
            </StyledActionButtonContainer>
            <StyledPrescriptionContainer>
                <PrescriptionDisplay prescriptionId={prescriptionId} />
            </StyledPrescriptionContainer>
            {cancelDialogOpen && (
                <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog}>
                    <DialogTitle>{'Cancel Prescription'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you wish to cancel this Prescription?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCancelDialog}>No</Button>
                        <Button onClick={handleCancel} autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </StyledFullWidthPageContainer>
    );
}
