import React, {useMemo, useRef, useState} from 'react';
import {useReadRenewalRequestsForPatient} from '../../../api/prescriptionApi';
import {useReadPatientForActor} from '../../../api/patientApi';
import {useUserContext} from '../../../UserContext';
import moment from 'moment/moment';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import {LinearProgress} from '@mui/material';
import VirtualizedTable from '../../shared/VirtualizedTable';

export default function PatientRenewalRequestTable() {
    const {actor} = useUserContext();
    const {data: patient, isLoading: patientLoading} = useReadPatientForActor(actor.id, true);
    const {data, isLoading} = useReadRenewalRequestsForPatient(patient?.id);

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
                header: 'Renewal Requested',
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
            {
                accessorKey: 'reviewed',
                header: 'Reviewed by Physician',
            },
            {
                accessorKey: 'approved',
                header: 'Approved by Physician',
            },
            {
                header: 'Dispensed',
                accessorKey: 'newPrescription.dispensedDateTime',
                cell: ({row}) => {
                    return (
                        <div>
                            {!row?.original?.newPrescription?.dispensedDateTime
                                ? ''
                                : moment
                                      .utc(row?.original?.newPrescription?.dispensedDateTime)
                                      .tz(actor.timezone)
                                      .format('MM/DD/YYYY HH:mm')}
                        </div>
                    );
                },
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
            {data?.length === 0 && <div>You have no previous renewal requests</div>}
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
