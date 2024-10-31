import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useFindOfficeDevices} from '../../api/officeDeviceApi';

export default function OfficeDeviceTable({selectedDevice, setSelectedDevice}) {
    const {
        data: devices,
        isLoading: isDevicesLoading,
        isError: isDevicesError,
    } = useFindOfficeDevices(true);

    const [sorting, setSorting] = useState([]);

    const toggleCheckbox = useCallback(
        (e, device) => {
            if (selectedDevice?.id) {
                setSelectedDevice(null);
            } else {
                setSelectedDevice(device);
            }
        },
        [setSelectedDevice, selectedDevice]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={selectedDevice?.id === row.id}
                    onClick={(e) => toggleCheckbox(e, row)}
                    disabled={Boolean(selectedDevice?.id) && selectedDevice?.id !== row.id}
                />
            );
        },
        [toggleCheckbox, selectedDevice]
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
                accessorKey: 'deviceName',
                header: 'Device Name',
            },
            {
                accessorKey: 'officeName',
                header: 'Office Name',
            },
        ];
        return cols;
    }, [renderCheckbox]);

    const table = useReactTable({
        data: devices || [],
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

    return (
        <>
            {isDevicesLoading && <LinearProgress />}
            {!isDevicesLoading && !isDevicesError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isDevicesLoading}
                />
            )}
        </>
    );
}
