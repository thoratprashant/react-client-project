import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {LinearProgress, Tooltip} from '@mui/material';
import {useNavigate} from 'react-router';
import {useReadAllPrescriptions} from '../../api/prescriptionApi';
import {useUserContext} from '../../UserContext';
import moment from 'moment';
import 'moment-timezone';
import ErrorIcon from '@mui/icons-material/Error';
import {calculateIfRowIsReady} from './prescriptionUtil';

export default function EPrescriptionsTable({
    searchValue,
    prescriptionStatus,
    source,
    disableOnClick = false,
}) {
    const navigate = useNavigate();
    const {actor} = useUserContext();

    const {
        data: prescriptions,
        isLoading: isPrescriptionsLoading,
        isError: isPrescriptionsError,
    } = useReadAllPrescriptions(prescriptionStatus);

    const filtered = useMemo(() => {
        if (!prescriptions || isPrescriptionsLoading || isPrescriptionsError) return [];
        else if (!searchValue || searchValue === '') return prescriptions;
        else {
            return prescriptions.filter(
                (p) =>
                    p?.physicianFirstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.physicianLastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.medication?.displayName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.office?.addressLine1?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.office?.addressLine2?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.office?.city?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.office?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.office?.zip?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.addressLine1?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.addressLine2?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.city?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.zip?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.firstName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.patient?.lastName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    p?.lastName?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
    }, [searchValue, prescriptions, isPrescriptionsError, isPrescriptionsLoading]);

    const [sorting, setSorting] = useState([]);

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'id',
                header: 'RxId',
                size: 30,
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
                header: 'Drug',
                accessorKey: 'medication.displayName',
            },
            {
                header: 'Quantity',
                accessorKey: 'quantity',
                size: 80,
            },
            {
                accessorKey: 'refillsAuthorized',
                header: 'Refills',
                size: 80,
            },
            {
                header: 'Rx Written',
                accessorKey: 'createdDateTime',
                cell: (props) => (
                    <div>
                        {moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY')}
                    </div>
                ),
            },
            {
                header: 'Rx Written By',
                cell: ({row}) => (
                    <span>{`${row.original.physicianLastName}, ${row.original.physicianFirstName}`}</span>
                ),
            },
            {
                accessorKey: 'office.name',
                header: 'Pharmacy',
            },
        ];

        if (source === 'Dispense.Dispensed' || source === 'Renewal.PatientRenewalRequest') {
            cols.push({
                header: 'Dispensed',
                accessorKey: 'dispensedDateTime',
                cell: (props) => (
                    <div>
                        {props.getValue()
                            ? moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY')
                            : ''}
                    </div>
                ),
            });
        } else if (source === 'Dispense.Pending') {
            cols.push({
                header: 'Alerts',
                cell: ({row}) => {
                    if (source === 'E-Prescribe.Cancelled' || source === 'E-Prescribe.New')
                        return null;
                    const {patientReady, paymentInfoReady} = calculateIfRowIsReady(row);
                    let title = `${patientReady ? '' : 'Patient missing required info'}`;
                    if (!patientReady && !paymentInfoReady) title = title + '; ';
                    if (!paymentInfoReady) title = title + 'Patient missing payment info';
                    if (title.length) {
                        title = title + '; Click row to add missing information';
                        return (
                            <Tooltip title={title}>
                                <ErrorIcon color={'error'} />
                            </Tooltip>
                        );
                    }
                },
            });
        }
        return cols;
    }, [actor.timezone, source]);

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
            if (disableOnClick) return () => {};
            if (source === 'E-Prescribe.Cancelled' || source === 'E-Prescribe.New') {
                navigate(`/erx/${rowData.id}`);
            } else {
                const {patientReady, paymentInfoReady} = calculateIfRowIsReady({
                    original: rowData,
                });

                if (patientReady && paymentInfoReady) {
                    navigate(`/dispense/${rowData.id}`);
                } else {
                    navigate(`/patients/${rowData.patient.id}`);
                }
            }
        },
        [navigate, source, disableOnClick]
    );

    return (
        <>
            {isPrescriptionsLoading && <LinearProgress />}
            {!isPrescriptionsLoading && !isPrescriptionsError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isPrescriptionsLoading}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
        </>
    );
}
