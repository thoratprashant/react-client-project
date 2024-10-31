import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import moment from 'moment';
import {useSnackbar} from 'notistack';
import {useQueryClient} from '@tanstack/react-query';
import {
    useCancelPatientSubscription,
    useUpdateSerialNumberForPatientDevice,
} from '../../../api/patientApi';
import {useNavigate} from 'react-router';
import PatientSubscriptionSerialNumberEdit from './PatientSubscriptionSerialNumberEdit';

export default function PatientSubscriptionEdit({
    createdDateTime,
    existingSerialNumber,
    existingSignature,
    patientId,
    subscriptionId,
    existingPatientDeviceId,
    showEditSubscription,
    setShowEditSubscription,
}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const sigCanvasSummary = useRef();
    const [serialNumber, setSerialNumber] = useState(existingSerialNumber || '');
    const [wantsToRemove, setWantsToRemove] = useState(false);
    const [removalText, setRemovalText] = useState('');

    useEffect(() => {
        if (existingSignature?.length && sigCanvasSummary?.current) {
            setTimeout(() => {
                sigCanvasSummary.current.fromDataURL(existingSignature);
                sigCanvasSummary.current.off();
            }, 100);
        }
    }, [existingSignature, sigCanvasSummary]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ['subscriptions']}),
                queryClient.invalidateQueries({queryKey: ['patients']}),
            ]).then(() => {
                enqueueSnackbar(`Monitoring info has been successfully saved for this patient.`, {
                    variant: 'success',
                });
                setShowEditSubscription(false);
                navigate(0);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error saving the monitoring information for this patient${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: submitSerialNumberUpdate} =
        useUpdateSerialNumberForPatientDevice(submissionOptions);

    const handleUpdateSerialNumber = useCallback(() => {
        const submission = {
            patientId,
            deviceType: 'CAREMATIX_WEIGHT_SCALE',
            deviceExternalIdentifier: serialNumber,
            patientDeviceId: existingPatientDeviceId,
        };

        submitSerialNumberUpdate({body: submission});
    }, [patientId, serialNumber, submitSerialNumberUpdate, existingPatientDeviceId]);

    const {mutate: cancelSubscription} = useCancelPatientSubscription(submissionOptions);

    const handleCancelSubscription = useCallback(() => {
        const submission = {
            patientId,
            patientSubscriptionId: subscriptionId,
        };

        cancelSubscription({body: submission});
    }, [patientId, cancelSubscription, subscriptionId]);

    const monthsActive = useMemo(() => {
        return moment().diff(moment(createdDateTime), 'months', false);
    }, [createdDateTime]);

    return (
        <Dialog
            open={showEditSubscription}
            onClose={() => setShowEditSubscription(false)}
            aria-labelledby="alert-edit-patient-monitoring-title"
            aria-describedby="alert-edit-patient-monitoring-description"
            fullScreen
        >
            <DialogTitle id="alert-edit-patient-monitoring-title">
                Edit Patient Monitoring
            </DialogTitle>
            <DialogContent>
                {!wantsToRemove && (
                    <PatientSubscriptionSerialNumberEdit
                        serialNumber={serialNumber}
                        setSerialNumber={setSerialNumber}
                    />
                )}
                {existingPatientDeviceId && subscriptionId && (
                    <div>
                        <div>{`This patient started their subscription on ${moment(
                            createdDateTime
                        ).format(
                            'MM/DD/YYYY'
                        )}. It has been ${monthsActive} months since they signed up for RPM. They signed up for a 12 month subscription. They ${
                            monthsActive >= 12 ? 'are' : 'are NOT'
                        } eligible to be removed from RPM`}</div>
                        <div>
                            {!wantsToRemove && (
                                <Button
                                    onClick={() => setWantsToRemove(true)}
                                    variant={'contained'}
                                >
                                    {`Remove from RPM${monthsActive < 12 ? ' Anyway' : ''}`}
                                </Button>
                            )}
                            {wantsToRemove && (
                                <>
                                    <div>Type 'Remove from RPM' below to be allowed to remove</div>
                                    <TextField
                                        onWheel={(e) => e.target.blur()}
                                        name="rpmRemove"
                                        id="rpmRemove"
                                        label={`Type: Remove from RPM`}
                                        fullWidth
                                        required
                                        margin={'normal'}
                                        value={removalText}
                                        onChange={(e) => setRemovalText(e.target.value)}
                                    />
                                    {removalText === 'Remove from RPM' && (
                                        <Button
                                            onClick={handleCancelSubscription}
                                            variant={'contained'}
                                        >
                                            Submit Removal from RPM
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setShowEditSubscription(false);
                        setRemovalText('');
                        setWantsToRemove(false);
                    }}
                    variant={'contained'}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleUpdateSerialNumber}
                    variant={'contained'}
                    disabled={!serialNumber || wantsToRemove}
                >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    );
}
