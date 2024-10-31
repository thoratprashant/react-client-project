import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useReadAllMedications} from '../../api/medicationApi';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';

export default function MedicationTable({searchValue, setSelectedMedication, setDialogOpen}) {
    const {actor} = useUserContext();
    const {
        data: medications,
        isLoading: isMedicationsLoading,
        isError: isMedicationsError,
    } = useReadAllMedications();

    const filtered = useMemo(() => {
        if (!medications || isMedicationsLoading || isMedicationsError) return [];
        else if (!searchValue || searchValue === '') return medications;
        else {
            return medications.filter(
                (a) =>
                    a.displayName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    a.ndc.toLowerCase().includes(searchValue.toLowerCase()) ||
                    a.office.name.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
    }, [searchValue, medications, isMedicationsError, isMedicationsLoading]);

    const [sorting, setSorting] = useState([]);

    const renderDisabled = ({disabled}) => {
        return <Checkbox disabled checked={disabled} />;
    };
    const toCurrency = useCallback((value) => {
        const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
        return formatter.format(value);
    }, []);

    const columns = useMemo(() => {
        const cols = [
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
                accessorKey: 'ndc',
                header: 'NDC',
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
            },
            {
                accessorKey: 'unitOfMeasure',
                header: 'UOM',
            },
            {
                accessorKey: 'cogs',
                header: 'COGS',
                cell: (props) => <div>{toCurrency(props.getValue())}</div>,
            },
            {
                header: 'Disabled',
                accessorKey: 'disabledDateTime',
                cell: ({row}) => renderDisabled(row.original),
            },
        ];
        return cols;
    }, [toCurrency]);

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
            if (actor.role !== Roles.ADMINISTRATOR.moniker) {
                return;
            }
            const selected = {...rowData};
            setSelectedMedication(selected);
            setDialogOpen(true);
        },
        [setDialogOpen, setSelectedMedication, actor.role]
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
