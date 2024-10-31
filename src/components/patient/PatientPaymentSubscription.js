import React, {forwardRef, useMemo, useState} from 'react';
import {StyledDialogTitle} from '../shared/StyledElements';
import {
    useReadPatient,
    useReadPatientPaymentToken,
    useReadPatientSubscription,
} from '../../api/patientApi';
import {Button, LinearProgress} from '@mui/material';
import PatientPaymentSignUp from './PatientPaymentSignUp';
import styled from '@emotion/styled';
import PatientSubscriptionEdit from './subscription/PatientSubscriptionEdit';
import {useReadOffice} from '../../api/officeApi';
import PatientPaymentEdit from './payment/PatientPaymentEdit';
import {useReadPhysician} from '../../api/physicianApi';
import PatientPaymentSummary from './payment/PatientPaymentSummary';
import PatientSubscriptionSummary from './subscription/PatientSubscriptionSummary';
import PatientSubscriptionCreate from './subscription/PatientSubscriptionCreate';

// Note: scroll-margin-top is for the fixed header which isn't taken into account
const StyledContainer = styled.div`
    margin-top: 10px;
    margin-bottom: 30px;
    scroll-margin-top: 84px;
    padding-bottom: 10px;
    border-bottom: 1px solid black;
`;

const StyledContentContainer = styled.div`
    margin: 5px;
`;

export default forwardRef(function PatientPaymentSubscription(
    {
        primaryPhysicianId,
        patientId,
        firstName,
        lastName,
        isPatientDisabled,
        addressLine1,
        addressLine2,
        city,
        stateCode,
        zip,
        isEdit,
        primaryOfficeId,
        showAddPaymentInfo,
        setShowAddPaymentInfo,
    },
    ref
) {
    const [showEditPayment, setShowEditPayment] = useState(false);
    const [showEditSubscription, setShowEditSubscription] = useState(false);
    const {
        data: subscription,
        isLoading: isSubscriptionLoading,
        isFetched: isSubscriptionFetched,
    } = useReadPatientSubscription(patientId);
    const {
        data: paymentToken,
        isLoading: isPaymentTokenLoading,
        isFetched: isPaymentTokenFetched,
    } = useReadPatientPaymentToken(patientId);
    const {data: patient} = useReadPatient(patientId);
    const {data: office} = useReadOffice(primaryOfficeId);
    const {
        data: physician,
        isLoading: isPhysicianLoading,
        isFetched: isPhysicianFetched,
    } = useReadPhysician(Boolean(primaryPhysicianId), primaryPhysicianId);

    const hasExistingPaymentInfo = useMemo(() => {
        return !isPaymentTokenLoading && isPaymentTokenFetched && Boolean(paymentToken?.id);
    }, [isPaymentTokenLoading, isPaymentTokenFetched, paymentToken]);

    const physicianAllowedToDoRPM = useMemo(() => {
        return !isPhysicianLoading && isPhysicianFetched && !physician.partBProvider;
    }, [isPhysicianLoading, isPhysicianFetched, physician]);

    const hasExistingSubscription = useMemo(() => {
        return !isSubscriptionLoading && isSubscriptionFetched && Boolean(subscription?.id);
    }, [isSubscriptionLoading, isSubscriptionFetched, subscription]);

    const serialNumber = useMemo(() => {
        return patient?.devices?.find(
            (d) => d.deviceType === 'CAREMATIX_WEIGHT_SCALE' && d.disabledDateTime === null
        )?.externalIdentifier;
    }, [patient]);
    const patientDeviceId = useMemo(() => {
        return patient?.devices?.find(
            (d) => d.deviceType === 'CAREMATIX_WEIGHT_SCALE' && d.disabledDateTime === null
        )?.id;
    }, [patient]);

    const renderContentForEdit = () => {
        return (
            <>
                {(isSubscriptionLoading || isPaymentTokenLoading) && <LinearProgress />}

                {/*PAYMENT SECTION*/}
                {!hasExistingPaymentInfo && !showAddPaymentInfo && !showEditSubscription && (
                    <>
                        <h3>{`Patient currently has no Payment Information Saved. Patients without Payment Information cannot be monitored or E-Prescribed to. ${
                            patient?.disabledDateTime !== null
                                ? ' They are also disabled above.'
                                : ''
                        }`}</h3>
                        {patient?.addressLine1 &&
                        patient?.city &&
                        patient?.stateCode &&
                        patient?.zip &&
                        patient?.primaryOfficeId &&
                        patient?.actorId ? (
                            <Button
                                onClick={() => setShowAddPaymentInfo(true)}
                                variant={'contained'}
                                disabled={isPatientDisabled}
                            >
                                Add Payment Info
                            </Button>
                        ) : (
                            <div>Finish updating/saving patient before adding payment info</div>
                        )}
                    </>
                )}
                {hasExistingPaymentInfo && !showEditPayment && !showEditSubscription && (
                    <div>
                        <PatientPaymentSummary
                            lastFour={paymentToken?.lastFour}
                            subType={paymentToken?.subType}
                            createdDateTime={paymentToken?.createdDateTime}
                        />
                        <Button onClick={() => setShowEditPayment(true)} variant={'contained'}>
                            Update Payment
                        </Button>
                    </div>
                )}
                {hasExistingPaymentInfo && showEditPayment && !showEditSubscription && (
                    <PatientPaymentEdit
                        lastFour={paymentToken?.lastFour}
                        subType={paymentToken?.subType}
                        squareLocationId={office?.squareLocationId}
                        firstName={firstName}
                        lastName={lastName}
                        addressLine1={addressLine1}
                        addressLine2={addressLine2}
                        city={city}
                        patientId={patientId}
                        setShowEditPayment={setShowEditPayment}
                    />
                )}

                {/*SUBSCRIPTION SECTION*/}
                {!showAddPaymentInfo &&
                    !showEditSubscription &&
                    physicianAllowedToDoRPM &&
                    hasExistingPaymentInfo && (
                        <div>
                            <PatientSubscriptionSummary
                                fee={subscription?.fee}
                                lastFour={paymentToken?.lastFour}
                                subType={paymentToken?.subType}
                                createdDateTime={subscription?.createdDateTime}
                                existingSerialNumber={serialNumber}
                                existingSignature={subscription?.patientSignature}
                                patientId={patientId}
                                subscriptionId={subscription?.id}
                            />
                            <Button
                                onClick={() => setShowEditSubscription(true)}
                                variant={'contained'}
                            >
                                {`${
                                    subscription?.createdDateTime ? 'Update' : 'Add'
                                } Monitoring Subscription`}
                            </Button>
                        </div>
                    )}
                {!showAddPaymentInfo &&
                    showEditSubscription &&
                    physicianAllowedToDoRPM &&
                    hasExistingSubscription &&
                    hasExistingPaymentInfo && (
                        <PatientSubscriptionEdit
                            createdDateTime={subscription?.createdDateTime}
                            existingSerialNumber={serialNumber}
                            existingSignature={subscription?.patientSignature}
                            existingPatientDeviceId={patientDeviceId}
                            patientId={patientId}
                            subscriptionId={subscription?.id}
                            showEditSubscription={showEditSubscription}
                            setShowEditSubscription={setShowEditSubscription}
                        />
                    )}
                {!showAddPaymentInfo &&
                    showEditSubscription &&
                    physicianAllowedToDoRPM &&
                    hasExistingPaymentInfo &&
                    !hasExistingSubscription && (
                        <PatientSubscriptionCreate
                            primaryPhysicianId={primaryPhysicianId}
                            firstName={firstName}
                            lastName={lastName}
                            patientId={patientId}
                            existingSerialNumber={serialNumber}
                            setShowEditSubscription={setShowEditSubscription}
                        />
                    )}
                {showAddPaymentInfo && (
                    <PatientPaymentSignUp
                        primaryPhysicianId={primaryPhysicianId}
                        squareLocationId={office?.squareLocationId}
                        setShow={setShowAddPaymentInfo}
                        firstName={firstName}
                        lastName={lastName}
                        patientId={patientId}
                        addressLine1={addressLine1}
                        addressLine2={addressLine2}
                        city={city}
                        stateCode={stateCode}
                        zip={zip}
                        isEdit={isEdit}
                        existingSerialNumber={serialNumber}
                    />
                )}
            </>
        );
    };

    return (
        <StyledContainer ref={ref}>
            <StyledDialogTitle key={`payment-info`}>
                Payment and Monitoring Subscription Info
            </StyledDialogTitle>
            <StyledContentContainer>
                {isEdit && renderContentForEdit()}
                {!isEdit && (
                    <div>
                        You must create the patient first before you can collect their payment
                        information
                    </div>
                )}
            </StyledContentContainer>
        </StyledContainer>
    );
});
