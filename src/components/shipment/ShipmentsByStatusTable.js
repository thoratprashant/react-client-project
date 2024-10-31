import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
} from '@mui/material';
import moment from 'moment';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import MedOrdersForShipment from './MedOrdersForShipment';
import {useMarkShipmentsAsDelivered, useReadAllShipments} from '../../api/shipmentApi';
import {ShipmentStatus} from '../../constants/CommonConstants';
import {StyledButton, StyledContainer} from '../shared/StyledElements';
import Button from '@mui/material/Button';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import styled from '@emotion/styled';

const StyledActionsContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin: 10px 5px;
`;

const defaultShipments = [];

export default function ShipmentsByStatusTable({shipmentStatus}) {
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const [selectedShipmentIds, setSelectedShipmentIds] = useState([]);
    const [showMedOrdersTableForId, setShowMedOrdersTableForId] = useState(undefined);
    const [markAsDeliveredDialogOpen, setMarkAsDeliveredDialogOpen] = useState(false);

    const {data: shipments, isLoading} = useReadAllShipments(shipmentStatus);

    const markAsDeliveredOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['shipments']}).then(() => {
                enqueueSnackbar(`The shipments were successfully marked as delivered.`, {
                    variant: 'success',
                });
                setMarkAsDeliveredDialogOpen(false);
                setSelectedShipmentIds([]);
                setShowMedOrdersTableForId(undefined);
            });
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error marking the shipments as delivered${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
            setMarkAsDeliveredDialogOpen(false);
        },
    };

    const {mutate: markAsDelivered} = useMarkShipmentsAsDelivered(markAsDeliveredOptions);

    const toggleCheckbox = useCallback(
        (e, shipmentId) => {
            e.stopPropagation();
            const newSelectedShipments = [...selectedShipmentIds];
            if (selectedShipmentIds.includes(shipmentId)) {
                newSelectedShipments.splice(newSelectedShipments.indexOf(shipmentId), 1);
            } else {
                newSelectedShipments.push(shipmentId);
            }
            setSelectedShipmentIds(newSelectedShipments);
        },
        [selectedShipmentIds, setSelectedShipmentIds]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={selectedShipmentIds.includes(row.id)}
                    onClick={(e) => toggleCheckbox(e, row.id)}
                />
            );
        },
        [selectedShipmentIds, toggleCheckbox]
    );

    const columns = useMemo(() => {
        const checkboxCols =
            shipmentStatus === ShipmentStatus.SHIPPED
                ? [
                      {
                          header: 'Delivered?',
                          accessorKey: 'checked',
                          cell: ({row}) => renderCheckbox(row.original),
                          size: 30,
                      },
                  ]
                : [];
        const cols = [
            ...checkboxCols,
            {
                header: 'Shipped',
                accessorKey: 'shippedDateTime',
                cell: (props) => <div>{moment(props.getValue()).format('MM/DD/YYYY')}</div>,
            },
            {
                accessorKey: 'officeName',
                header: 'Office',
            },
            {
                header: 'Shipped By',
                cell: ({row}) => (
                    <span>{`${row.original.shipmentCreatedByLastName}, ${row.original.shipmentCreatedByFirstName}`}</span>
                ),
            },
            {
                accessorKey: 'trackingNumber',
                header: 'Tracking',
            },
            {
                accessorKey: 'invoiceNumber',
                header: 'Invoice',
            },
            {
                accessorKey: 'shipper',
                header: 'Shipper',
            },
            {
                accessorKey: 'medicationOrdersCount',
                header: '# Meds',
                size: 90,
            },
        ];
        return cols;
    }, [renderCheckbox, shipmentStatus]);

    const table = useReactTable({
        data: shipments || defaultShipments,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const {rows} = table.getRowModel();

    const tableContainerRef = useRef(null);

    const handleRowClick = useCallback((rowData) => {
        setShowMedOrdersTableForId(rowData.id);
    }, []);

    const handleClickMarkAsDelivered = useCallback(() => {
        setMarkAsDeliveredDialogOpen(true);
    }, []);

    const handleMarkAsDelivered = useCallback(() => {
        markAsDelivered({shipmentIds: selectedShipmentIds});
    }, [markAsDelivered, selectedShipmentIds]);

    const handleCloseMarkAsDeliveredDialog = useCallback(() => {
        setMarkAsDeliveredDialogOpen(false);
    }, []);

    return (
        <StyledContainer>
            {shipmentStatus === ShipmentStatus.SHIPPED && (
                <StyledActionsContainer>
                    <StyledButton
                        variant={'contained'}
                        onClick={handleClickMarkAsDelivered}
                        disabled={selectedShipmentIds?.length === 0}
                    >
                        Mark as Delivered
                    </StyledButton>
                </StyledActionsContainer>
            )}
            {isLoading && <LinearProgress />}
            {!isLoading && !shipments?.length && (
                <div>There are no shipments with this status right now</div>
            )}
            {!showMedOrdersTableForId && !isLoading && Boolean(shipments?.length) && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
            {showMedOrdersTableForId && (
                <MedOrdersForShipment
                    shipmentId={showMedOrdersTableForId}
                    setSelectedShipmentIds={setSelectedShipmentIds}
                    setShowMedOrdersTableForId={setShowMedOrdersTableForId}
                    shipmentStatus={shipmentStatus}
                />
            )}
            {markAsDeliveredDialogOpen && (
                <Dialog open={markAsDeliveredDialogOpen} onClose={handleCloseMarkAsDeliveredDialog}>
                    <DialogTitle>{'Mark Shipment as Delivered'}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you wish to mark these shipments as delivered and add them
                            to inventory?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseMarkAsDeliveredDialog}>No</Button>
                        <Button onClick={handleMarkAsDelivered} autoFocus>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </StyledContainer>
    );
}
