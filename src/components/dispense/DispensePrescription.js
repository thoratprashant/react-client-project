import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {useDispensePrescription, useReadPrescription} from '../../api/prescriptionApi';
import {
    Breadcrumbs,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    LinearProgress,
    Link,
    Radio,
    RadioGroup,
    StepLabel,
    TextField,
    Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import {calculateIfRowIsReady} from '../eprescribe/prescriptionUtil';
import {
    StyledBreadcrumbs,
    StyledButton,
    StyledCreateButton,
    StyledDialogContainer,
    StyledDialogTitle,
    StyledTableActionsContainer,
} from '../shared/StyledElements';
import SignatureCanvas from 'react-signature-canvas';
import styled from '@emotion/styled';
import PrescriptionLabel from './PrescriptionLabel';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import DispenseTerms from './DispenseTerms';
import PrescriptionDisplay from '../eprescribe/PrescriptionDisplay';
import {PrescriptionStatus} from '../../constants/CommonConstants';
import moment from 'moment';
import {useUserContext} from '../../UserContext';
import ReactToPrint from 'react-to-print';

export const StyledSignaturePad = styled.div`
    background-color: grey;
    padding: 10px;
    width: 620px;
    height: 220px;
    margin-bottom: 5px;
`;
export const StyledSignatureContainer = styled.div`
    width: 620px;
`;
const StyledStepper = styled(Stepper)`
    margin-top: 5px;
`;
const StyledStepContentContainer = styled.div`
    margin-top: 10px;
    margin-left: 10px;

    &.noDisplay {
        display: none;
    }

    @media print {
        break-inside: avoid;
    }
`;
const StyledContainer = styled.div`
    min-width: 650px;
    width: 90%;
`;
const StyledFlexContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-right: 10px;
`;

const STEPS = [
    'E-Prescription',
    'Print Rx Label',
    'E-Rx / Drug Fee',
    'Patient Review',
    'Rx Review / Patient Counseling',
    'T&C / Signature',
];

export default function DispensePrescription() {
    const {prescriptionId} = useParams();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();
    const [notAllowedDialogOpen, setNotAllowedDialogOpen] = useState(false);
    const [notAllowedText, setNotAllowedText] = useState(undefined);
    const [additionalCounselingRequired, setAdditionalCounselingRequired] = useState('');
    const [signature, setSignature] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [printing, setPrinting] = useState(false);
    const [oneTimeChargeAmount, setOneTimeChargeAmount] = useState('');
    const [oneTimeChargeAmountError, setOneTimeChargeAmountError] = useState('');
    const sigCanvas = useRef();
    const {actor} = useUserContext();
    const printRef = useRef();

    const {
        data: prescription,
        isLoading: isPrescriptionLoading,
        isFetched: isPrescriptionFetched,
    } = useReadPrescription(prescriptionId);

    const readOnly = useMemo(() => {
        if (!prescription) return true;
        return prescription?.status !== PrescriptionStatus.CREATED;
    }, [prescription]);

    const isConfirmDisabled = useMemo(() => {
        if (activeStep === 0) return false;
        else if (activeStep === 1) return false;
        else if (activeStep === 2) {
            return Boolean(oneTimeChargeAmountError) || !Boolean(oneTimeChargeAmount);
        } else if (activeStep === 3) return false;
        else if (activeStep === 4) {
            return (
                additionalCounselingRequired !== 'false' && additionalCounselingRequired !== false
            );
        } else if (activeStep === 5) {
            return !Boolean(signature) || readOnly;
        }
    }, [
        activeStep,
        additionalCounselingRequired,
        signature,
        readOnly,
        oneTimeChargeAmountError,
        oneTimeChargeAmount,
    ]);

    useEffect(() => {
        if (readOnly && prescription) {
            setAdditionalCounselingRequired(prescription.additionalCounselingRequired);
            setSignature(prescription.patientSignature);
            setOneTimeChargeAmount(prescription.oneTimeFee);
        }
    }, [readOnly, prescription]);

    useEffect(() => {
        if (readOnly && signature?.length) {
            setTimeout(() => {
                sigCanvas.current.fromDataURL(signature);
                sigCanvas.current.off();
            }, 100);
        }
    }, [readOnly, signature, sigCanvas]);

    useEffect(() => {
        if (!isPrescriptionLoading && isPrescriptionFetched && prescription) {
            const {patientReady, paymentInfoReady} = calculateIfRowIsReady({
                original: prescription,
            });
            if (!patientReady || !paymentInfoReady) {
                setNotAllowedDialogOpen(true);
                let text = `${patientReady ? '' : 'Patient missing required info'}`;
                if (!patientReady && !paymentInfoReady) text = text + '; ';
                if (!paymentInfoReady) text = text + 'Patient missing payment info';
                if (text.length) {
                    text =
                        text +
                        "; You will be forwarded to the Patient's page to edit their information";
                }
                setNotAllowedText(text);
            }
        }
    }, [isPrescriptionLoading, isPrescriptionFetched, prescription]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['prescriptions']}).then(() => {
                enqueueSnackbar(`Success.`, {
                    variant: 'success',
                });
                navigate('/dispense/allSet');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(`There was an error${data?.message && ': ' + data.message}`, {
                variant: 'error',
            });
        },
    };

    const {mutate: dispenseRx} = useDispensePrescription(submissionOptions);

    const handleNavigateToEditPatient = useCallback(() => {
        navigate(`/patients/${prescription?.patient?.id}`);
    }, [prescription, navigate]);

    const handleNext = useCallback(() => {
        if (activeStep === 5 && !readOnly) {
            dispenseRx({
                prescriptionId,
                body: {
                    prescriptionId,
                    signature,
                    additionalCounselingRequired,
                    oneTimeFee: oneTimeChargeAmount,
                },
            });
        } else if (activeStep === 5 && readOnly) {
            return;
        } else {
            setActiveStep(activeStep + 1);
        }
    }, [
        readOnly,
        activeStep,
        additionalCounselingRequired,
        signature,
        prescriptionId,
        dispenseRx,
        oneTimeChargeAmount,
    ]);

    const setUpPrinting = useCallback(() => {
        setPrinting(true);
        return Promise.resolve();
    }, []);

    if (isPrescriptionLoading) return <LinearProgress />;

    return (
        <StyledContainer>
            <StyledFlexContainer>
                <StyledBreadcrumbs>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link href="/dispense">Dispense</Link>
                        <Typography color="text.primary">Dispense Prescription</Typography>
                    </Breadcrumbs>
                </StyledBreadcrumbs>
                {readOnly && (
                    <ReactToPrint
                        trigger={() => <StyledButton variant={'contained'}>Print All</StyledButton>}
                        content={() => printRef.current}
                        onBeforeGetContent={setUpPrinting}
                        onAfterPrint={() => setPrinting(false)}
                    />
                )}
            </StyledFlexContainer>
            {!readOnly && notAllowedDialogOpen && (
                <Dialog open={notAllowedDialogOpen} onClose={handleNavigateToEditPatient}>
                    <DialogTitle>Dispensing Not Allowed</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{notAllowedText}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleNavigateToEditPatient} autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            {!notAllowedDialogOpen && (
                <StyledDialogContainer ref={printRef}>
                    <StyledDialogTitle>{`Dispense Prescription Id: ${prescriptionId} Status: ${
                        prescription?.status || ''
                    }${
                        prescription?.status === PrescriptionStatus.DISPENSED
                            ? ' (' +
                              moment
                                  .utc(prescription.dispensedDateTime)
                                  .tz(actor.timezone)
                                  .format('MM/DD/YYYY') +
                              ')'
                            : ''
                    }`}</StyledDialogTitle>
                    <StyledStepper activeStep={activeStep}>
                        {STEPS.map((label, index) => {
                            return (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </StyledStepper>
                    {(activeStep === 0 || printing) && (
                        <StyledStepContentContainer>
                            <PrescriptionDisplay prescriptionId={prescriptionId} />
                        </StyledStepContentContainer>
                    )}
                    {(activeStep === 1 || printing) && (
                        <StyledStepContentContainer>
                            <PrescriptionLabel
                                prescriptionId={prescriptionId}
                                showPrint={!readOnly}
                            />
                        </StyledStepContentContainer>
                    )}
                    {(activeStep === 2 || printing) && (
                        <StyledStepContentContainer>
                            <TextField
                                type={'number'}
                                onWheel={(e) => e.target.blur()}
                                name="eRxDrugFee"
                                id="eRxDrugFee"
                                label={`${prescription.medication.displayName} Flat Fee ($)`}
                                fullWidth
                                required
                                margin={'normal'}
                                value={oneTimeChargeAmount}
                                disabled={readOnly}
                                onChange={(e) => {
                                    const floatVal = parseFloat(e.target.value);
                                    if (
                                        !Boolean(e.target.value) ||
                                        e.target.value === '' ||
                                        floatVal === 'NaN' ||
                                        floatVal <= 0
                                    ) {
                                        setOneTimeChargeAmountError('Must be >= 0');
                                    } else setOneTimeChargeAmountError('');
                                    setOneTimeChargeAmount(e.target.value);
                                }}
                                error={Boolean(oneTimeChargeAmountError)}
                                helperText={oneTimeChargeAmountError}
                            />
                            <div>Please enter the amount to charge the patient above.</div>
                        </StyledStepContentContainer>
                    )}
                    {(activeStep === 3 || printing) && (
                        <StyledStepContentContainer>
                            <div>Make sure the patient is completing steps 4 - 6.</div>
                            <div>Let them take over the mouse or tablet.</div>
                            <div>
                                {`By clicking cofirm, you agree that you are ${prescription.patient.lastName}, ${prescription.patient.firstName}`}
                            </div>
                        </StyledStepContentContainer>
                    )}
                    {(activeStep === 4 || printing) && (
                        <StyledStepContentContainer>
                            <div>Please review the following Prescription for accuracy</div>
                            <PrescriptionLabel prescriptionId={prescriptionId} />
                            <FormControl required disabled={readOnly}>
                                <FormLabel id="additional-counseling-label">
                                    Do you require additional counseling for this medication?
                                </FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="additional-counseling-label"
                                    name="radio-buttons-group"
                                    value={additionalCounselingRequired}
                                    onChange={(e) =>
                                        setAdditionalCounselingRequired(e.target.value)
                                    }
                                >
                                    <FormControlLabel
                                        value={true}
                                        control={<Radio />}
                                        label="Yes"
                                    />
                                    <FormControlLabel
                                        value={false}
                                        control={<Radio />}
                                        label="No"
                                    />
                                </RadioGroup>
                            </FormControl>
                            {(additionalCounselingRequired === 'true' ||
                                additionalCounselingRequired === true) && (
                                <>
                                    <div>
                                        You have indicated that you require additional counseling.
                                    </div>
                                    <div>Please let the staff know.</div>
                                    <div>
                                        Once you have received the additional counseling, select
                                        "No" above to be able to proceed.
                                    </div>
                                </>
                            )}
                        </StyledStepContentContainer>
                    )}
                    <StyledStepContentContainer
                        className={activeStep === 5 || printing ? '' : 'noDisplay'}
                    >
                        <DispenseTerms />
                        <h3>{`Amount to be charged today (includes fees): $${(
                            oneTimeChargeAmount * 1.029 +
                            0.3
                        ).toFixed(2)}`}</h3>
                        <h3>Please sign below. Accept your signature when you are finished.</h3>
                        <StyledSignatureContainer>
                            <StyledSignaturePad>
                                <SignatureCanvas
                                    penColor="blue"
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
                                    disabled={Boolean(signature) || readOnly}
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
                                    }}
                                    variant="contained"
                                    size="medium"
                                    disabled={Boolean(signature) || readOnly}
                                >
                                    Accept
                                </StyledCreateButton>
                            </StyledTableActionsContainer>
                        </StyledSignatureContainer>
                    </StyledStepContentContainer>
                    {/*)}*/}
                    <DialogActions>
                        <Button
                            color="inherit"
                            onClick={() => navigate(`/dispense/allSet`)}
                            sx={{mr: 1}}
                            disabled={activeStep === STEPS.length - 1}
                            variant={'contained'}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => setActiveStep(activeStep - 1)}
                            disabled={activeStep === 0}
                            variant={'contained'}
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={isConfirmDisabled}
                            variant={'contained'}
                        >
                            {activeStep === STEPS.length - 1 ? 'Finalize' : 'Confirm'}
                        </Button>
                    </DialogActions>
                </StyledDialogContainer>
            )}
        </StyledContainer>
    );
}
