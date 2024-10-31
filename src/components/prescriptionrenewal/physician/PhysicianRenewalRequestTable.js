import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useReadRenewalRequests} from '../../../api/prescriptionApi';
import {useUserContext} from '../../../UserContext';
import moment from 'moment/moment';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import {Checkbox, LinearProgress} from '@mui/material';
import VirtualizedTable from '../../shared/VirtualizedTable';
import {useNavigate} from 'react-router';
import {Roles} from '../../../constants/ActorContstants';

export default function PhysicianRenewalRequestTable({
    includeProcessed,
    checkedRenewalRequestIds,
    setCheckedRenewalRequestIds,
}) {
    const {actor} = useUserContext();
    const navigate = useNavigate();
    const {data, isLoading} = useReadRenewalRequests(includeProcessed);

    const toggleCheckbox = useCallback(
        (e, renewalRequestId) => {
            e.stopPropagation();
            const newCheckedRenewalRequestIds = [...checkedRenewalRequestIds];
            if (checkedRenewalRequestIds.includes(renewalRequestId)) {
                newCheckedRenewalRequestIds.splice(
                    newCheckedRenewalRequestIds.indexOf(renewalRequestId),
                    1
                );
            } else {
                newCheckedRenewalRequestIds.push(renewalRequestId);
            }
            setCheckedRenewalRequestIds(newCheckedRenewalRequestIds);
        },
        [checkedRenewalRequestIds, setCheckedRenewalRequestIds]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={checkedRenewalRequestIds.includes(row.id)}
                    onClick={(e) => toggleCheckbox(e, row.id)}
                />
            );
        },
        [checkedRenewalRequestIds, toggleCheckbox]
    );

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
                header: 'Patient Name',
                cell: ({row}) => (
                    <span>{`${row.original.patient.lastName}, ${row.original.patient.firstName}`}</span>
                ),
            },
            {
                header: 'Patient DOB',
                accessorKey: 'patient.dob',
                cell: (props) => <div>{moment(props.getValue()).format('MM/DD/YYYY')}</div>,
                size: 90,
            },
            {
                accessorKey: 'office.name',
                header: 'Pharmacy',
            },
        ];

        if (includeProcessed) {
            cols.push({
                header: 'Dispensed',
                accessorKey: 'newPrescription',
                cell: (props) => {
                    console.log({val: props.getValue()});
                    if (!props || !props.getValue()) {
                        return <div />;
                    }
                    return (
                        <div>
                            {!props?.getValue()?.dispensedDateTime
                                ? ''
                                : moment
                                      .utc(props?.getValue()?.dispensedDateTime)
                                      .tz(actor.timezone)
                                      .format('MM/DD/YYYY HH:mm')}
                        </div>
                    );
                },
            });
            cols.push({
                accessorKey: 'reviewed',
                header: 'Reviewed by Physician',
            });
            cols.push({
                accessorKey: 'approved',
                header: 'Approved',
            });
        } else {
            cols.push({
                header: 'Last Dispensed',
                accessorKey: 'prescription.dispensedDateTime',
                cell: (props) => {
                    return (
                        <div>
                            {!props.getValue()
                                ? ''
                                : moment
                                      .utc(props.getValue())
                                      .tz(actor.timezone)
                                      .format('MM/DD/YYYY HH:mm')}
                        </div>
                    );
                },
            });
        }

        if (!includeProcessed) {
            cols.unshift({
                header: '',
                accessorKey: 'checked',
                cell: ({row}) => renderCheckbox(row.original),
                size: 30,
            });
        }

        return cols;
    }, [actor.timezone, includeProcessed, renderCheckbox]);

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

    const handleNavigate = useCallback(
        (rowData) => {
            if (actor.role === Roles.PHYSICIAN.moniker) {
                navigate('/erx/new', {
                    state: {
                        patientId: rowData.patient.id,
                        isNewPatient: false,
                        source: 'RenewalRequest',
                        medicationId: rowData.medication.id,
                        renewalRequestId: rowData.id,
                    },
                });
            }
        },
        [actor, navigate]
    );
    return (
        <>
            {isLoading && <LinearProgress />}
            {data?.length === 0 && <div>You have no pending renewal requests</div>}
            {!isLoading && data?.length > 0 && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isLoading}
                    onRowClick={handleNavigate}
                />
            )}
        </>
    );
}
