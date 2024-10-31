import React, {useCallback, useMemo, useRef, useState} from 'react';
import styled from '@emotion/styled';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import {useUserContext} from '../../../UserContext';
import {Roles} from '../../../constants/ActorContstants';
import VirtualizedTable from '../../shared/VirtualizedTable';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import moment from 'moment';
import OfficeShipmentConfirmation from './OfficeShipmentConfirmation';
import {useCancelMedicationOrders} from '../../../api/medicationOrderApi';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';

const StyledTitle = styled.div`
    color: ${({theme}) => theme.palette.primary.main};
    font-size: 18px;
    padding-top: 8px;
    padding-bottom: 8px;
`;
const StyledMedOrdersContainer = styled.div``;
const StyledShipButton = styled(Button)`
    background-color: ${({theme}) => theme.palette.primary.light};
    font-weight: 600;
    margin-left: 50px;
`;
const StyledHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 15px;
`;
const StyledContainer = styled.div`
    border-bottom: 1px solid divider;
    transform: ${(props) => (props.hovered ? 'scale(1.02);' : '')};
    transition: ${(props) => (props.hovered ? 'all .3s ease-in-out' : '')};
`;

export default function OfficeRequestedShipment({officeName, medOrders}) {
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const [selectedMedOrderIds, setSelectedMedOrderIds] = useState([]);
    const [showShipmentConfirmationTable, setShowShipmentConfirmationTable] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const cancelOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['medicationOrders']}).then(() => {
                enqueueSnackbar(`Your shipment request was successfully cancelled.`, {
                    variant: 'success',
                });
                setCancelDialogOpen(false);
                setSelectedMedOrderIds([]);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error cancelling your shipment request${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
            setCancelDialogOpen(false);
        },
    };

    const {mutate: cancelMedOrders} = useCancelMedicationOrders(cancelOptions);

    const disabled = useMemo(
        () => actor.role !== Roles.ADMINISTRATOR.moniker && actor.role !== Roles.WHOLESALER.moniker,
        [actor.role]
    );

    const disabledShip = useMemo(
        () => disabled || selectedMedOrderIds?.length === 0,
        [disabled, selectedMedOrderIds]
    );

    const toggleCheckbox = useCallback(
        (e, medicationId) => {
            e.stopPropagation();
            const newSelectedMeds = [...selectedMedOrderIds];
            if (selectedMedOrderIds.includes(medicationId)) {
                newSelectedMeds.splice(newSelectedMeds.indexOf(medicationId), 1);
            } else {
                newSelectedMeds.push(medicationId);
            }
            setSelectedMedOrderIds(newSelectedMeds);
        },
        [selectedMedOrderIds, setSelectedMedOrderIds]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={selectedMedOrderIds.includes(row.id)}
                    onClick={(e) => toggleCheckbox(e, row.id)}
                />
            );
        },
        [selectedMedOrderIds, toggleCheckbox]
    );

    const columns = useMemo(() => {
        const cols = [
            {
                header: 'Ship?',
                accessorKey: 'checked',
                cell: ({row}) => renderCheckbox(row.original),
                size: 30,
            },
            {
                accessorKey: 'ndc',
                header: 'NDC',
            },
            {
                accessorKey: 'medicationDisplayName',
                header: 'Medication',
            },
            {
                accessorKey: 'quantity',
                header: 'Qty',
                size: 40,
            },
            {
                accessorKey: 'unitOfMeasure',
                header: 'UOM',
                size: 40,
            },
            {
                header: 'Requested',
                accessorKey: 'createdDateTime',
                cell: (props) => <div>{moment(props.getValue()).format('MM/DD/YYYY')}</div>,
            },
            {
                header: 'Requested By',
                cell: ({row}) => (
                    <span>{`${row.original.createdByLastName}, ${row.original.createdByFirstName}`}</span>
                ),
            },
            {
                accessorKey: 'amountOrdered',
                header: 'Amount Ordered',
            },
        ];
        return cols;
    }, [renderCheckbox]);

    const table = useReactTable({
        data: medOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    const handleShip = useCallback(() => {
        setShowShipmentConfirmationTable(true);
    }, []);

    const handleClickCancel = useCallback(() => {
        setCancelDialogOpen(true);
    }, []);

    const handleCancel = useCallback(() => {
        cancelMedOrders({medOrderIds: selectedMedOrderIds});
    }, [cancelMedOrders, selectedMedOrderIds]);

    const handleCloseCancelDialog = useCallback(() => {
        setCancelDialogOpen(false);
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedMedOrderIds(medOrders.map(({id}) => id));
    }, [medOrders]);

    return (
        <StyledContainer
            hovered={hovered}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <StyledHeaderContainer>
                <StyledTitle>{officeName}</StyledTitle>
                <div>
                    <StyledShipButton
                        onClick={handleSelectAll}
                        variant="contained"
                        size="small"
                        disabled={disabled}
                    >
                        {`Select All`}
                    </StyledShipButton>
                    <StyledShipButton
                        onClick={handleClickCancel}
                        variant="contained"
                        size="small"
                        disabled={
                            actor.role !== Roles.ADMINISTRATOR.moniker &&
                            actor.role !== Roles.PHYSICIAN.moniker &&
                            actor.role !== Roles.OFFICE_ADMINISTRATOR.moniker
                        }
                    >
                        {`Cancel`}
                    </StyledShipButton>
                    <StyledShipButton
                        onClick={handleShip}
                        variant="contained"
                        size="small"
                        disabled={disabledShip}
                    >
                        {`Ship`}
                    </StyledShipButton>
                </div>
            </StyledHeaderContainer>
            {!showShipmentConfirmationTable && (
                <StyledMedOrdersContainer>
                    <VirtualizedTable
                        tableContainerRef={tableContainerRef}
                        rows={rows}
                        table={table}
                        dataIsLoading={false}
                    />
                </StyledMedOrdersContainer>
            )}
            {showShipmentConfirmationTable && (
                <OfficeShipmentConfirmation
                    medOrders={medOrders.filter((mo) => selectedMedOrderIds.includes(mo.id))}
                    dialogOpen={showShipmentConfirmationTable}
                    setDialogOpen={setShowShipmentConfirmationTable}
                    setSelectedMedOrderIds={setSelectedMedOrderIds}
                />
            )}
            {cancelDialogOpen && (
                <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog}>
                    <DialogTitle>{'Cancel Shipment Request'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you wish to cancel these medication shipment requests?
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
        </StyledContainer>
    );
}
