export const calculateIfRowIsReady = (row) => {
    const {patient, patientPaymentToken} = row.original;
    const {phone, addressLine1, city, disabledDateTime, stateCode, zip, actorId} = patient || {};
    const patientReady = Boolean(
        phone && addressLine1 && city && !disabledDateTime && stateCode && zip && actorId
    );
    const paymentInfoReady = Boolean(patientPaymentToken && patientPaymentToken?.id);
    return {patientReady, paymentInfoReady};
};
