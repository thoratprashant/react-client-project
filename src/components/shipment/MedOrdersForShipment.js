import React, {useMemo, useRef} from 'react';
import {useReadAllMedicationOrdersForShipmentId} from '../../api/medicationOrderApi';
import {StyledBreadcrumbs, StyledContainer} from '../shared/StyledElements';
import {Breadcrumbs, LinearProgress, Link, Typography} from '@mui/material';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';

export default function MedOrdersForShipment({
    shipmentId,
    setSelectedShipmentIds,
    setShowMedOrdersTableForId,
    shipmentStatus,
}) {
    const {data: medOrders, isLoading} = useReadAllMedicationOrdersForShipmentId(shipmentId);

    const columns = useMemo(() => {
        const cols = [
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
                accessorKey: 'amountOrdered',
                header: 'Amt Ordered',
            },
            {
                accessorKey: 'amountShipped',
                header: 'Amt Shipped',
            },
        ];
        return cols;
    }, []);

    const table = useReactTable({
        data: medOrders || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    return (
        <StyledContainer>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        onClick={() => {
                            setSelectedShipmentIds([]);
                            setShowMedOrdersTableForId(undefined);
                        }}
                    >
                        Shipments
                    </Link>
                    <Typography color="text.primary">
                        {`${
                            shipmentStatus.charAt(0).toUpperCase() +
                            shipmentStatus.slice(1).toLowerCase()
                        } Medications`}
                    </Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            {isLoading && <LinearProgress />}
            {!isLoading && Boolean(medOrders?.length) && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isLoading}
                />
            )}
        </StyledContainer>
    );
}
