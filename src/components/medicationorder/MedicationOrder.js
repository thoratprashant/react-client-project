import React, {useCallback, useMemo, useState} from 'react';
import {
    StyledBreadcrumbs,
    StyledButton,
    StyledContainer,
    StyledDialogActions,
    StyledDialogTitle,
} from '../shared/StyledElements';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {useReadAllMedications} from '../../api/medicationApi';
import {useCreateMedicationOrders} from '../../api/medicationOrderApi';
import {useFormik} from 'formik';
import {Breadcrumbs, DialogContent, LinearProgress, Link, Typography} from '@mui/material';
import {useNavigate} from 'react-router';
import OfficeMedicationOrderTable from './OfficeMedicationOrderTable';

export default function MedicationOrder({
    setShipmentMedicationIds,
    shipmentMedicationIds,
    setShow,
}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const navigate = useNavigate();
    const [activeAmountOrderedName, setActiveAmountOrderedName] = useState('');

    const {data: medications, isLoading: isMedicationsLoading} = useReadAllMedications(false);

    const officeRequestedMedsMap = useMemo(() => {
        const officeToMedsMap = {};
        medications
            .filter((m) => shipmentMedicationIds.includes(m.id))
            .forEach((m) => {
                const {
                    ndc,
                    displayName,
                    quantity,
                    unitOfMeasure,
                    id,
                    inventoryOnHand,
                    inventoryMinimum,
                    inventoryMaximum,
                    office,
                    officeId,
                } = m;
                const med = {
                    medicationId: id,
                    inventoryOnHand,
                    inventoryMinimum,
                    inventoryMaximum,
                    amountOrdered: '',
                    officeName: office.name,
                    ndc,
                    displayName,
                    quantity,
                    unitOfMeasure,
                };
                if (officeToMedsMap[officeId]) {
                    officeToMedsMap[officeId].push(med);
                } else {
                    officeToMedsMap[officeId] = [med];
                }
            });
        return officeToMedsMap;
    }, [medications, shipmentMedicationIds]);

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['medications']}).then(() => {
                enqueueSnackbar(`Shipment has been successfully created.`, {
                    variant: 'success',
                });
                navigate('/medications');
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error creating the shipment${data?.message && ': ' + data.message}`,
                {
                    variant: 'error',
                }
            );
        },
    };

    const {mutate: createMedicationOrders} = useCreateMedicationOrders(submissionOptions);

    const validateForm = (values) => {
        const validationErrors = {};
        let valid = true;
        Object.entries(values).forEach(([officeId, meds], index) => {
            validationErrors[officeId] = [];
            meds.forEach((med, i) => {
                validationErrors[officeId].push({});
                const {amountOrdered} = med;
                if (!amountOrdered || amountOrdered === '') {
                    validationErrors[officeId][i].amountOrdered = 'Required';
                    valid = false;
                } else if (
                    isNaN(parseInt(amountOrdered)) ||
                    amountOrdered % 1 !== 0 ||
                    amountOrdered.endsWith('.')
                ) {
                    validationErrors[officeId][i].amountOrdered = 'Must be an integer';
                    valid = false;
                } else if (amountOrdered <= 0) {
                    validationErrors[officeId][i].amountOrdered = 'Must be >= 0';
                    valid = false;
                }
            });
        });

        return valid ? {} : validationErrors;
    };

    const formik = useFormik({
        initialValues: officeRequestedMedsMap,
        validateOnBlur: false,
        validateOnChange: false,
        validateOnMount: false,
        validate: validateForm,
        onSubmit: (values) => {
            const allValsAsArray = [];
            Object.entries(values).forEach(([officeId, valArray]) => {
                const valArrayWithOffice = valArray.map((v) => ({...v, officeId}));
                allValsAsArray.push(...valArrayWithOffice);
            });
            createMedicationOrders({body: allValsAsArray});
            setActiveAmountOrderedName('');
        },
    });

    const {handleSubmit} = formik;

    const cancelForm = useCallback(() => {
        setShipmentMedicationIds([]);
        setShow(false);
        setActiveAmountOrderedName('');
    }, [setShipmentMedicationIds, setShow]);

    return (
        <StyledContainer>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        onClick={() => {
                            setShow(false);
                            setShipmentMedicationIds([]);
                        }}
                    >
                        Inventory Levels
                    </Link>
                    <Typography color="text.primary">{'Request Medication Shipment'}</Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            <StyledDialogTitle>{`Request Medication Shipment`}</StyledDialogTitle>
            <DialogContent>
                {isMedicationsLoading && <LinearProgress />}
                {!isMedicationsLoading && (
                    <form onSubmit={handleSubmit}>
                        {Object.entries(officeRequestedMedsMap).map(([officeId, meds]) => {
                            return (
                                <OfficeMedicationOrderTable
                                    officeId={officeId}
                                    formik={formik}
                                    requestedMeds={meds}
                                    key={`shipment_table_${officeId}`}
                                    activeAmountOrderedName={activeAmountOrderedName}
                                    setActiveAmountOrderedName={setActiveAmountOrderedName}
                                />
                            );
                        })}
                        <StyledDialogActions>
                            <StyledButton variant={'contained'} onClick={cancelForm}>
                                Cancel
                            </StyledButton>
                            <StyledButton variant={'contained'} type="submit">
                                Create Shipment
                            </StyledButton>
                        </StyledDialogActions>
                    </form>
                )}
            </DialogContent>
        </StyledContainer>
    );
}
