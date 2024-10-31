import React, {useMemo, useRef, useState} from 'react';
import {useReadRenewalRequestsForPatient} from '../../../api/prescriptionApi';
import {useReadPatientForActor} from '../../../api/patientApi';
import {useUserContext} from '../../../UserContext';
import moment from 'moment/moment';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import {LinearProgress} from '@mui/material';
import VirtualizedTable from '../../shared/VirtualizedTable';

export default function PatientRenewalRequestReminderTable() {
    const {actor} = useUserContext();
    const {data: patient, isLoading: patientLoading} = useReadPatientForActor(actor.id, true);
    const {data, isLoading} = useReadRenewalRequestsForPatient(patient?.id, true);

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'id',
                header: 'Renewal Id',
                size: 30,
            },
            {
                header: 'Drug',
                accessorKey: 'medication.displayName',
            },
            {
                header: 'Drug Last Dispensed',
                accessorKey: 'prescription.dispensedDateTime',
                cell: (props) => {
                    const {row} = props;
                    const {original} = row;
                    const val = original?.prescription?.dispensedDateTime;

                    return (
                        <div>
                            {!val
                                ? ''
                                : moment.utc(val).tz(actor.timezone).format('MM/DD/YYYY HH:mm')}
                        </div>
                    );
                },
            },
            {
                header: 'Renewal Suggested',
                accessorKey: 'createdDateTime',
                cell: (props) => (
                    <div>
                        {moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY HH:mm')}
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

    const [sorting, setSorting] = useState([]);

    const table = useReactTable({
        data: data || [],
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
            {(isLoading || patientLoading) && <LinearProgress />}
            {data?.length === 0 && (
                <div>
                    You have no pending renewal request suggestions. Check your Renewal Request
                    History for status information of previous renewal requests/suggestions.
                </div>
            )}
            {!isLoading && !patientLoading && data?.length > 0 && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isLoading}
                    onRowClick={() => {}}
                />
            )}
        </>
    );
}
