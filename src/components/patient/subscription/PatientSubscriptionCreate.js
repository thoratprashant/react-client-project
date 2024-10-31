import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {useFindActivePhysicianFee, useReadPhysician} from '../../../api/physicianApi';
import styled from '@emotion/styled';
import {DialogActions} from '@mui/material';
import Button from '@mui/material/Button';
import PaymentTermsAndConditions from '../payment/PaymentTermsAndConditions';
import PatientSubscriptionSignUp from '../subscription/PatientSubscriptionSignUp';
import {useCreatePatientSubscriptionWhenExistingPaymentInfo} from '../../../api/patientApi';
import {useSnackbar} from 'notistack';
import {SubscriptionTypes} from '../../../constants/CommonConstants';
import {useQueryClient} from '@tanstack/react-query';

const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    margin-bottom: 10px;
`;
const StyledStepContentContainer = styled.div`
    margin-top: 10px;
`;

const STEPS = ['Monitoring & Fee ($)', 'Terms & Conditions'];

export default function PatientSubscriptionCreate({
    primaryPhysicianId,
    firstName,
    lastName,
    patientId,
    existingSerialNumber,
    setShowEditSubscription,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const {data: physician} = useReadPhysician(Boolean(primaryPhysicianId), primaryPhysicianId);

    const [activeStep, setActiveStep] = useState(0);
    const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] = useState(false);
    const [hasRpm, setHasRpm] = useState(true);
    const [signature, setSignature] = useState('');
    const [serialNumber, setSerialNumber] = useState(existingSerialNumber || '');
    const [termsAndConditionsPdfUrl, setTermsAndConditionsPdfUrl] = useState('');
    const sigCanvas = useRef();

    const {data: physicianFee} = useFindActivePhysicianFee(
        Boolean(primaryPhysicianId),
        primaryPhysicianId
    );

    useEffect(() => {
        if (physician?.partBProvider) {
            setHasRpm(false);
        }
    }, [physician]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['subscriptions']}).then(() => {
                enqueueSnackbar(`Monitoring has been successfully saved for this patient.`, {
                    variant: 'success',
                });
                setShowEditSubscription(false);
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

    const {mutate: submitPatientSubscription} =
        useCreatePatientSubscriptionWhenExistingPaymentInfo(submissionOptions);

    const handleSaveSubscription = useCallback(() => {
        const submission = {
            patientId,
            subscriptionType: SubscriptionTypes.WEGOVY_WEIGHT_LOSS_RPM.moniker,
            hasRpm,
            patientSignature: signature,
            deviceType: 'CAREMATIX_WEIGHT_SCALE',
            deviceExternalIdentifier: serialNumber,
            termsAndConditionsPdf: termsAndConditionsPdfUrl,
            fee: physicianFee.fee,
            physicianFeeId: physicianFee.id,
        };

        submitPatientSubscription({body: submission});
    }, [
        patientId,
        submitPatientSubscription,
        hasRpm,
        signature,
        serialNumber,
        termsAndConditionsPdfUrl,
        physicianFee,
    ]);

    const handleBack = useCallback(() => {
        setShowEditSubscription(false);
    }, [setShowEditSubscription]);

    const handleNext = useCallback(() => {
        if (activeStep === STEPS.length - 1) {
            if (!hasRpm) {
                setShowEditSubscription(false);
            } else {
                handleSaveSubscription();
            }
        } else {
            setActiveStep(activeStep + 1);
        }
    }, [activeStep, setShowEditSubscription, handleSaveSubscription, hasRpm]);

    const isCompleteDisabled = useMemo(() => {
        if (activeStep === 0) {
            if (!hasRpm) return false;
            else return !Boolean(serialNumber);
        } else if (activeStep === 1) {
            return hasRpm
                ? !termsAndConditionsAccepted || !Boolean(signature) || !termsAndConditionsPdfUrl
                : false;
        } else {
            return true;
        }
    }, [
        activeStep,
        termsAndConditionsAccepted,
        hasRpm,
        signature,
        serialNumber,
        termsAndConditionsPdfUrl,
    ]);

    return (
        <StyledContainer>
            <Stepper activeStep={activeStep}>
                {STEPS.map((label, index) => {
                    return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === 0 && (
                <StyledStepContentContainer>
                    {!physician?.partBProvider && (
                        <PatientSubscriptionSignUp
                            primaryPhysicianId={primaryPhysicianId}
                            hasRpm={hasRpm}
                            setHasRpm={setHasRpm}
                            serialNumber={serialNumber}
                            setSerialNumber={setSerialNumber}
                        />
                    )}
                    {physician?.partBProvider && (
                        <div>{`This patient's doctor is a Medicare Part B provider. RPM services are not allowed for patients of Part B Providers`}</div>
                    )}
                </StyledStepContentContainer>
            )}
            {activeStep === 1 && (
                <StyledStepContentContainer>
                    {hasRpm && (
                        <PaymentTermsAndConditions
                            termsAndConditionsAccepted={termsAndConditionsAccepted}
                            setTermsAndConditionsAccepted={setTermsAndConditionsAccepted}
                            setSignature={setSignature}
                            signature={signature}
                            ref={sigCanvas}
                            patientId={patientId}
                            setTermsAndConditionsPdfUrl={setTermsAndConditionsPdfUrl}
                            firstName={firstName}
                            lastName={lastName}
                        />
                    )}
                    {!hasRpm && (
                        <div>
                            You have selected that the patient does not want RPM. If this is
                            correct, no Terms & Conditions required and you may continue. If this is
                            incorrect, select cancel.
                        </div>
                    )}
                </StyledStepContentContainer>
            )}
            <DialogActions>
                <Button color="inherit" onClick={handleBack} sx={{mr: 1}}>
                    Cancel
                </Button>
                <Button onClick={handleNext} disabled={isCompleteDisabled}>
                    {activeStep === STEPS.length - 1 ? 'Finalize' : 'Confirm'}
                </Button>
            </DialogActions>
        </StyledContainer>
    );
}
