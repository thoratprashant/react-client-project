import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {useUserContext} from '../../../UserContext';
import {useReadPrescriptionsForPatient} from '../../../api/prescriptionApi';
import moment from 'moment/moment';
import {LinearProgress} from '@mui/material';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../../shared/VirtualizedTable';

export default function PrescriptionHistory({patientId}) {
    const navigate = useNavigate();
    const {actor} = useUserContext();

    const {
        data: prescriptions,
        isLoading: isPrescriptionsLoading,
        isError: isPrescriptionsError,
    } = useReadPrescriptionsForPatient(patientId);

    const [sorting, setSorting] = useState([]);

    const columns = useMemo(() => {
        const cols = [
            {
                header: 'Drug',
                accessorKey: 'medication.displayName',
            },
            {
                header: 'Qty',
                accessorKey: 'quantity',
                size: 50,
            },
            {
                accessorKey: 'refillsAuthorized',
                header: 'Refills',
                size: 50,
            },
            {
                header: 'Written',
                size: 80,
                accessorKey: 'createdDateTime',
                cell: (props) => (
                    <div>
                        {moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY')}
                    </div>
                ),
            },
            {
                header: 'Written By',
                cell: ({row}) => (
                    <span>{`${row.original.physicianLastName}, ${row.original.physicianFirstName}`}</span>
                ),
            },
            {
                header: 'Dispensed',
                size: 80,
                accessorKey: 'dispensedDateTime',
                cell: (props) => (
                    <div>
                        {props.getValue()
                            ? moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY')
                            : ''}
                    </div>
                ),
            },
            {
                header: 'Cancelled',
                size: 80,
                accessorKey: 'removedDateTime',
                cell: (props) => (
                    <div>
                        {props.getValue()
                            ? moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY')
                            : ''}
                    </div>
                ),
            },
            {
                accessorKey: 'office.name',
                header: 'Pharmacy',
            },
        ];

        return cols;
    }, [actor.timezone]);

    const table = useReactTable({
        data: prescriptions || [],
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
            if (rowData?.dispensedDateTime) {
                navigate(`/dispense/${rowData.id}`);
            } else {
                navigate(`/erx/${rowData.id}`);
            }
        },
        [navigate]
    );

    return (
        <>
            {(!prescriptions || isPrescriptionsLoading) && <LinearProgress />}
            {!isPrescriptionsLoading && !isPrescriptionsError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isPrescriptionsLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                    darkHeader
                />
            )}
        </>
    );
}
