import React, {forwardRef, useCallback, useMemo} from 'react';
import {
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    LinearProgress,
} from '@mui/material';
import styled from '@emotion/styled';
import {useReadTermsAndConditionsPDF} from '../../../api/termsAndConditionsApi';
import {StyledSignatureContainer, StyledSignaturePad} from '../../dispense/DispensePrescription';
import SignatureCanvas from 'react-signature-canvas';
import {StyledCreateButton, StyledTableActionsContainer} from '../../shared/StyledElements';
import {PDFDocument} from 'pdf-lib';
import moment from 'moment/moment';
import {useSaveTermsAndConditionsPdfWithSignature} from '../../../api/patientApi';
import {useSnackbar} from 'notistack';

const StyledTermsAndConditions = styled.div`
    height: 500px;
    overflow-y: scroll;
`;

export default forwardRef(function PaymentTermsAndConditions(
    {
        termsAndConditionsAccepted,
        setTermsAndConditionsAccepted,
        setSignature,
        signature,
        patientId,
        setTermsAndConditionsPdfUrl,
        firstName,
        lastName,
    },
    sigCanvas
) {
    const {enqueueSnackbar} = useSnackbar();
    const {data: termsAndConditions, isLoading: isTermsAndConditionsLoading} =
        useReadTermsAndConditionsPDF('PATIENT_SUBSCRIPTION_SIGN_UP');

    const {
        data: termsAndConditionsSignaturePage,
        isLoading: isTermsAndConditionsSignaturePageLoading,
    } = useReadTermsAndConditionsPDF('PATIENT_SUBSCRIPTION_SIGN_UP_SIGNATURE_PAGE');

    const termsAndConditionsPDFUrl = useMemo(() => {
        if (termsAndConditions) {
            const blob = new Blob([termsAndConditions], {type: 'application/pdf'});
            return URL.createObjectURL(blob);
        }
    }, [termsAndConditions]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            setTermsAndConditionsPdfUrl(data);
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error saving your signature ${data?.message && ': ' + data.message}`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: submitPdf, isLoading: pdfIsLoading} = useSaveTermsAndConditionsPdfWithSignature(
        patientId,
        submissionOptions
    );

    const savePdfWithSignature = useCallback(
        async (signatureImage) => {
            const termsAndConditionsBuffer = await new Response(termsAndConditions).arrayBuffer();
            const signatureBuffer = await new Response(
                termsAndConditionsSignaturePage
            ).arrayBuffer();
            const pdfDoc = await PDFDocument.load(termsAndConditionsBuffer);
            const signatureDoc = await PDFDocument.load(signatureBuffer);
            const signature = await signatureDoc.embedPng(signatureImage);

            const form = signatureDoc.getForm();

            const patientNameField = form.getTextField('patientName');
            patientNameField.setText(`${firstName} ${lastName}`);
            patientNameField.enableReadOnly();
            const dateField = form.getTextField('date');
            dateField.setText(moment().format('MM/DD/YYYY').toString());
            dateField.enableReadOnly();
            const signatureField = form.getTextField('signature');
            signatureField.setImage(signature);
            signatureField.enableReadOnly();
            const signatureDocSaved = await signatureDoc.save();
            const sigDocSavedPdf = await PDFDocument.load(signatureDocSaved);
            const [signaturePage] = await pdfDoc.copyPages(sigDocSavedPdf, [0]);
            pdfDoc.addPage(signaturePage);
            const pdfBytes = await pdfDoc.save();
            const file = new Blob([pdfBytes], {type: 'application/pdf'});

            const formData = new FormData();
            formData.append('file', file);

            submitPdf(formData);
            //Build a URL from the file
            // const fileURL = URL.createObjectURL(file);
            //Open the URL on new Window
            // const pdfWindow = window.open(fileURL);
        },
        [termsAndConditions, termsAndConditionsSignaturePage, submitPdf, firstName, lastName]
    );

    return (
        <>
            {isTermsAndConditionsLoading && <LinearProgress />}
            {!isTermsAndConditionsLoading && (
                <StyledTermsAndConditions>
                    <object
                        data={termsAndConditionsPDFUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        aria-label={'Terms and Conditions PDF Text'}
                    />
                    <div>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={termsAndConditionsAccepted}
                                        onChange={() =>
                                            setTermsAndConditionsAccepted(
                                                !termsAndConditionsAccepted
                                            )
                                        }
                                    />
                                }
                                label="Patient Accepts Terms and Conditions"
                            />
                        </FormGroup>
                        <h3>
                            Please have the patient sign below. They should accept their signature
                            when they are finished.
                        </h3>
                        <StyledSignatureContainer>
                            <StyledSignaturePad>
                                <SignatureCanvas
                                    penColor="black"
                                    canvasProps={{
                                        width: 600,
                                        height: 200,
                                    }}
                                    backgroundColor="white"
                                    ref={sigCanvas}
                                />
                            </StyledSignaturePad>
                            <StyledTableActionsContainer>
                                <StyledCreateButton
                                    onClick={() => {
                                        sigCanvas.current.clear();
                                    }}
                                    variant="contained"
                                    size="medium"
                                    disabled={Boolean(signature)}
                                >
                                    Clear
                                </StyledCreateButton>
                                <StyledCreateButton
                                    onClick={() => {
                                        sigCanvas.current.off();
                                        setSignature(
                                            sigCanvas.current
                                                .getTrimmedCanvas()
                                                .toDataURL('image/png')
                                        );
                                        savePdfWithSignature(
                                            sigCanvas.current
                                                .getTrimmedCanvas()
                                                .toDataURL('image/png')
                                        );
                                    }}
                                    variant="contained"
                                    size="medium"
                                    disabled={
                                        Boolean(signature) ||
                                        isTermsAndConditionsSignaturePageLoading ||
                                        pdfIsLoading
                                    }
                                >
                                    Accept
                                </StyledCreateButton>
                                {pdfIsLoading && <CircularProgress />}
                            </StyledTableActionsContainer>
                        </StyledSignatureContainer>
                    </div>
                </StyledTermsAndConditions>
            )}
        </>
    );
});
