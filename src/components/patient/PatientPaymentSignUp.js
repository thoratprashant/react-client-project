import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import {useFindActivePhysicianFee, useReadPhysician} from '../../api/physicianApi';
import styled from '@emotion/styled';
import {DialogActions} from '@mui/material';
import Button from '@mui/material/Button';
import {useSnackbar} from 'notistack';
import {useCreatePatientSubscription} from '../../api/patientApi';
import {useQueryClient} from '@tanstack/react-query';
import {SubscriptionTypes} from '../../constants/CommonConstants';
import PaymentTypeSelect from './payment/PaymentTypeSelect';
import PaymentTermsAndConditions from './payment/PaymentTermsAndConditions';
import PaymentAccountDetails from './payment/PaymentAccountDetails';
import PatientSubscriptionSignUp from './subscription/PatientSubscriptionSignUp';

const StyledContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    margin-bottom: 10px;
`;
const StyledStepContentContainer = styled.div`
    margin-top: 10px;
`;

const STEPS = ['Monitoring & Fee ($)', 'Payment Type', 'Terms & Conditions', 'Payment Info'];

export default function PatientPaymentSignUp({
    primaryPhysicianId,
    squareLocationId,
    setShow,
    firstName,
    lastName,
    patientId,
    addressLine1,
    addressLine2,
    city,
    stateCode,
    zip,
    isEdit,
    existingSerialNumber,
}) {
    const queryClient = useQueryClient();
    const {data: physicianFee} = useFindActivePhysicianFee(
        Boolean(primaryPhysicianId),
        primaryPhysicianId
    );
    const {data: physician} = useReadPhysician(Boolean(primaryPhysicianId), primaryPhysicianId);

    const [activeStep, setActiveStep] = useState(0);
    const [paymentType, setPaymentType] = useState('');
    const [termsAndConditionsAccepted, setTermsAndConditionsAccepted] = useState(false);
    const [token, setToken] = useState('');
    const [verifiedBuyerToken, setVerifiedBuyerToken] = useState('');
    const [lastFour, setLastFour] = useState('');
    const [subType, setSubType] = useState('');
    const [hasRpm, setHasRpm] = useState(true);
    const [signature, setSignature] = useState('');
    const [serialNumber, setSerialNumber] = useState(existingSerialNumber || '');
    const [termsAndConditionsPdfUrl, setTermsAndConditionsPdfUrl] = useState('');
    const sigCanvas = useRef();

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (physician?.partBProvider) {
            setHasRpm(false);
        }
    }, [physician]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['subscriptions']}).then(() => {
                enqueueSnackbar(`${paymentType} has been successfully saved for this patient.`, {
                    variant: 'success',
                });
            });
            queryClient.invalidateQueries({queryKey: ['patients']});
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error saving the ${paymentType} information for this patient${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: submitPatientSubscription} = useCreatePatientSubscription(submissionOptions);

    const handleBack = useCallback(() => {
        setShow(false);
    }, [setShow]);

    const handleSavePaymentInfo = useCallback(() => {
        const submission = {
            patientId,
            fee: physicianFee.fee,
            physicianFeeId: physicianFee.id,
            feeToken: token,
            feeTokenType: paymentType,
            subType,
            lastFour,
            verifiedBuyerToken,
            subscriptionType: SubscriptionTypes.WEGOVY_WEIGHT_LOSS_RPM.moniker,
            hasRpm,
            patientSignature: signature,
            deviceType: 'CAREMATIX_WEIGHT_SCALE',
            deviceExternalIdentifier: serialNumber,
            termsAndConditionsPdf: termsAndConditionsPdfUrl,
        };

        submitPatientSubscription({body: submission});
    }, [
        lastFour,
        patientId,
        paymentType,
        physicianFee,
        subType,
        submitPatientSubscription,
        token,
        verifiedBuyerToken,
        hasRpm,
        signature,
        serialNumber,
        termsAndConditionsPdfUrl,
    ]);

    // const steps = useMemo(() => {
    //     const stepsArray = [];
    //     if (physician?.isPartBProvider) stepsArray.push('Monitoring & Fee ($)');
    //     return [...stepsArray, 'Payment Type', 'Terms & Conditions', 'Payment Info'];
    // }, [physician]);

    const handleNext = useCallback(() => {
        if (activeStep === STEPS.length - 1) {
            handleSavePaymentInfo();
            setShow(false);
        } else {
            setActiveStep(activeStep + 1);
        }
    }, [activeStep, setShow, handleSavePaymentInfo]);

    const isCompleteDisabled = useMemo(() => {
        if (activeStep === 0) {
            if (!hasRpm) return false;
            else return !Boolean(serialNumber);
        } else if (activeStep === 1) {
            return paymentType === '';
        } else if (activeStep === 2) {
            return hasRpm
                ? !termsAndConditionsAccepted || !Boolean(signature) || !termsAndConditionsPdfUrl
                : false;
        } else if (activeStep === 3) {
            return token === '' || lastFour === '' || subType === '';
        } else {
            return true;
        }
    }, [
        activeStep,
        termsAndConditionsAccepted,
        paymentType,
        token,
        lastFour,
        subType,
        hasRpm,
        signature,
        serialNumber,
        termsAndConditionsPdfUrl,
    ]);

    useEffect(() => {
        if ((token, lastFour, subType, verifiedBuyerToken)) {
            handleNext();
        }
    }, [token, lastFour, subType, verifiedBuyerToken, handleNext]);

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
                    <PaymentTypeSelect paymentType={paymentType} setPaymentType={setPaymentType} />
                </StyledStepContentContainer>
            )}
            {activeStep === 2 && (
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
            {activeStep === 3 && (
                <StyledStepContentContainer>
                    <PaymentAccountDetails
                        squareLocationId={squareLocationId}
                        addressLine1={addressLine1}
                        addressLine2={addressLine2}
                        lastName={lastName}
                        firstName={firstName}
                        city={city}
                        token={token}
                        setToken={setToken}
                        setLastFour={setLastFour}
                        setSubType={setSubType}
                        setVerifiedBuyerToken={setVerifiedBuyerToken}
                        paymentType={paymentType}
                        // paymentAcceptedOnSuccess={handleNext}
                    />
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
