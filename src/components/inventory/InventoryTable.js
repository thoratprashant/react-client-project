import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useReadAllMedications} from '../../api/medicationApi';

export default function InventoryTable({
    searchValue,
    setSelectedMedication,
    setDialogOpen,
    shipmentMedicationIds,
    setShipmentMedicationIds,
}) {
    const {
        data: medications,
        isLoading: isMedicationsLoading,
        isError: isMedicationsError,
    } = useReadAllMedications(false);

    const filtered = useMemo(() => {
        if (!medications || isMedicationsLoading || isMedicationsError) return [];
        else if (!searchValue || searchValue === '') return medications;
        else {
            return medications.filter(
                (a) =>
                    a.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    a.ndc.toLowerCase().includes(searchValue.toLowerCase()) ||
                    a?.office?.name?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
    }, [searchValue, medications, isMedicationsError, isMedicationsLoading]);

    const [sorting, setSorting] = useState([]);

    const toggleCheckbox = useCallback(
        (e, medicationId) => {
            e.stopPropagation();
            const newShipmentMedicationIds = [...shipmentMedicationIds];
            if (shipmentMedicationIds.includes(medicationId)) {
                newShipmentMedicationIds.splice(newShipmentMedicationIds.indexOf(medicationId), 1);
            } else {
                newShipmentMedicationIds.push(medicationId);
            }
            setShipmentMedicationIds(newShipmentMedicationIds);
        },
        [shipmentMedicationIds, setShipmentMedicationIds]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={shipmentMedicationIds.includes(row.id)}
                    onClick={(e) => toggleCheckbox(e, row.id)}
                />
            );
        },
        [shipmentMedicationIds, toggleCheckbox]
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
                accessorKey: 'id',
                header: 'ID',
                size: 30,
            },
            {
                accessorKey: 'office.name',
                header: 'Office Name',
            },
            {
                accessorKey: 'displayName',
                header: 'Medication',
            },
            {
                accessorKey: 'inventoryOnHand',
                header: 'On Hand',
            },
            {
                accessorKey: 'inventoryMinimum',
                header: 'Min',
            },
            {
                accessorKey: 'inventoryMaximum',
                header: 'Max',
            },
        ];
        return cols;
    }, [renderCheckbox]);

    const table = useReactTable({
        data: filtered,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // debugTable: true,
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    const handleRowClick = useCallback(
        (rowData) => {
            const selected = {...rowData};
            setSelectedMedication(selected);
            setDialogOpen(true);
        },
        [setDialogOpen, setSelectedMedication]
    );

    return (
        <>
            {isMedicationsLoading && <LinearProgress />}
            {!isMedicationsLoading && !isMedicationsError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isMedicationsLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
        </>
    );
}
