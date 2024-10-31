import React from 'react';
import {Ach, CreditCard, PaymentForm} from 'react-square-web-payments-sdk';
import {useSnackbar} from 'notistack';

export default function PaymentAccountDetails({
    squareLocationId,
    addressLine1,
    addressLine2,
    lastName,
    firstName,
    city,
    token,
    setToken,
    setLastFour,
    setSubType,
    setVerifiedBuyerToken,
    paymentType,
    paymentAcceptedOnSuccess,
}) {
    const {enqueueSnackbar} = useSnackbar();
    return (
        <PaymentForm
            applicationId={process.env.REACT_APP_SQUARE_APPLICATION_ID}
            locationId={squareLocationId}
            createVerificationDetails={() => {
                const addressLines = [addressLine1];
                if (addressLine2) addressLines.push(addressLine2);
                return {
                    amount: '0.01',
                    billingContact: {
                        addressLines,
                        familyName: lastName,
                        givenName: firstName,
                        city,
                    },
                    intent: 'STORE',
                };
            }}
            cardTokenizeResponseReceived={({status, token, details}, verifiedBuyer) => {
                if (status === 'OK') {
                    if (details.method === 'Card') {
                        setToken(token);
                        setLastFour(details.card.last4);
                        setSubType(details.method);
                        setVerifiedBuyerToken(verifiedBuyer.token);
                        paymentAcceptedOnSuccess && paymentAcceptedOnSuccess();
                    } else if (details.method === 'ACH') {
                        setToken(token);
                        setLastFour(details.bankAccount.accountNumberSuffix);
                        setSubType(
                            `${details.bankAccount.bankName} - ${details.bankAccount.accountType}`
                        );
                    }
                } else {
                    setToken('');
                    setVerifiedBuyerToken('');
                    setLastFour('');
                    setSubType('');
                    enqueueSnackbar(
                        `There was an error getting the payment token. Please try again or another form of payment.`,
                        {
                            variant: 'error',
                        }
                    );
                }
            }}
        >
            {paymentType === 'SQUARE_CREDIT_CARD' && (
                <>
                    {token === '' && (
                        <CreditCard includeInputLabels>
                            {token === '' ? 'Add Credit Card' : 'Edit Credit Card'}
                        </CreditCard>
                    )}
                    {token !== '' &&
                        !paymentAcceptedOnSuccess &&
                        'Credit Card has been accepted. Click Finalize below to save to account.'}
                </>
            )}
            {paymentType === 'SQUARE_ACH' && (
                <Ach
                    accountHolderName={`${firstName} ${lastName}`}
                    callbacks={{
                        bankIncomeInsightsCompleted(event) {
                            console.log({event});
                        },
                    }}
                >
                    Add Bank Account (ACH)
                </Ach>
            )}
        </PaymentForm>
    );
}
