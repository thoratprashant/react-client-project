import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useReadAllPatients} from '../../api/patientApi';
import {useNavigate} from 'react-router';

export default function PatientTable({searchValue}) {
    const navigate = useNavigate();
    const {
        data: patients,
        isLoading: isPatientsLoading,
        isError: isPatientsError,
    } = useReadAllPatients();

    const filtered = useMemo(() => {
        if (!patients || isPatientsLoading || isPatientsError) return [];
        else if (!searchValue || searchValue === '') return patients;
        else {
            return patients.filter(
                (p) =>
                    p?.dob?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.phone?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.addressLine1?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.addressLine2?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.city?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.stateCode?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.zip?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.lastName?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
    }, [searchValue, patients, isPatientsError, isPatientsLoading]);

    const [sorting, setSorting] = useState([]);

    const renderDisabled = ({disabled}) => {
        return <Checkbox disabled checked={disabled} />;
    };

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 30,
            },
            {
                accessorKey: 'firstName',
                header: 'First Name',
            },
            {
                accessorKey: 'lastName',
                header: 'Last Name',
            },
            {
                accessorKey: 'dob',
                header: 'DOB',
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
            {
                header: 'Disabled',
                accessorKey: 'disabledDateTime',
                cell: ({row}) => renderDisabled(row.original),
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
            const selected = {...rowData};
            navigate(`/patients/${selected.id}`);
        },
        [navigate]
    );

    return (
        <>
            {isPatientsLoading && <LinearProgress />}
            {!isPatientsLoading && !isPatientsError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isPatientsLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
        </>
    );
}
