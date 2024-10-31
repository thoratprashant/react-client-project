import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {LinearProgress} from '@mui/material';
import {useReadAllOffices} from '../../api/officeApi';
import {Roles} from '../../constants/ActorContstants';
import {useUserContext} from '../../UserContext';

export default function OfficeTable({searchValue, setSelectedOffice, setDialogOpen}) {
    const {actor} = useUserContext();
    const {
        data: offices,
        isLoading: isOfficesLoading,
        isError: isOfficesError,
    } = useReadAllOffices();

    const filtered = useMemo(() => {
        if (!offices || isOfficesLoading || isOfficesError) return [];
        else if (!searchValue || searchValue === '') return offices;
        else {
            return offices.filter((a) => a.name.toLowerCase().includes(searchValue.toLowerCase()));
        }
    }, [searchValue, offices, isOfficesError, isOfficesLoading]);

    const [sorting, setSorting] = useState([]);

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 30,
            },
            {
                accessorKey: 'name',
                header: 'Office Name',
            },
            {
                accessorKey: 'npi',
                header: 'NPI',
            },
            {
                accessorKey: 'nabpId',
                header: 'NABP ID',
            },
            {
                accessorKey: 'phone',
                header: 'Phone #',
            },
            {
                accessorKey: 'addressLine1',
                header: 'Address Line 1',
            },
            {
                accessorKey: 'addressLine2',
                header: 'Address Line 2',
            },
            {
                accessorKey: 'city',
                header: 'City',
            },
            {
                accessorKey: 'stateCode',
                header: 'State',
            },
            {
                accessorKey: 'zip',
                header: 'Zip',
            },
        ];
        return cols;
    }, []);

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
            if (!rowData.addressLine2) selected.addressLine2 = '';
            setSelectedOffice(selected);
            setDialogOpen(true);
        },
        [setDialogOpen, setSelectedOffice, actor.role]
    );

    return (
        <>
            {isOfficesLoading && <LinearProgress />}
            {!isOfficesLoading && !isOfficesError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isOfficesLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
        </>
    );
}
