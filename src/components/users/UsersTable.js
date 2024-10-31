import React, {useMemo, useRef, useState} from 'react';
import {useReadAllAdminActors} from '../../api/actorApi';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useReadAllPhysicians} from '../../api/physicianApi';
import moment from 'moment';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';

export default function UsersTable({searchValue, isPhysician, setSelectedUser, setDialogOpen}) {
    const {actor} = useUserContext();
    const {
        data: actors,
        isLoading: isActorLoading,
        isError: isActorError,
    } = useReadAllAdminActors(!isPhysician);
    const {
        data: physicians,
        isLoading: isPhysiciansLoading,
        isError: isPhysiciansError,
    } = useReadAllPhysicians(isPhysician);

    const filtered = useMemo(() => {
        if (!isPhysician) {
            if (!actors || isActorLoading || isActorError) return [];
            else if (!searchValue || searchValue === '') return actors;
            else {
                return actors.filter(
                    (a) =>
                        a.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        a.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        a.email.toLowerCase().includes(searchValue.toLowerCase())
                );
            }
        } else {
            if (!physicians || isPhysiciansLoading || isPhysiciansError) return [];
            else if (!searchValue || searchValue === '') return physicians;
            else {
                return physicians.filter(
                    (a) =>
                        a.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        a.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
                        a.email.toLowerCase().includes(searchValue.toLowerCase()) ||
                        a.npi.toLowerCase().includes(searchValue.toLowerCase())
                );
            }
        }
    }, [
        searchValue,
        actors,
        isActorError,
        isActorLoading,
        isPhysician,
        isPhysiciansError,
        isPhysiciansLoading,
        physicians,
    ]);

    const [sorting, setSorting] = useState([]);

    const renderDisabled = ({disabledDateTime}) => {
        return <Checkbox disabled checked={Boolean(disabledDateTime)} />;
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
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'role',
                header: 'Role',
            },
            // {
            //     accessorKey: 'primaryOffice.name',
            //     header: 'Office',
            // },
            {
                header: 'Disabled',
                accessorKey: 'disabledDateTime',
                cell: ({row}) => renderDisabled(row.original),
            },
        ];
        if (isPhysician) {
            cols.push({accessorKey: 'npi', header: 'NPI'});
            cols.push({accessorKey: 'dob', header: 'DOB'});
        }
        return cols;
    }, [isPhysician]);

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

    const setFormattedUser = (user) => {
        const selected = {...user};
        selected.dob = moment(user.dob).format('MM/DD/YYYY');
        selected.disabled = Boolean(user.disabledDateTime);
        if (isPhysician) {
            selected.physicianFee = user.physicianFee ?? 99.0;
            selected.physicianFeeId = user.physicianFeeId ?? undefined;
        }
        setSelectedUser(selected);
    };

    return (
        <>
            {(!isPhysician && isActorLoading) ||
                (isPhysician && isPhysiciansLoading && <LinearProgress />)}
            {((!isPhysician && !isActorLoading && !isActorError) ||
                (isPhysician && !isPhysiciansLoading && !isPhysiciansError)) && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isActorLoading}
                    onRowClick={(rowData) => {
                        if (actor.role !== Roles.ADMINISTRATOR.moniker) {
                            return;
                        } else {
                            setFormattedUser(rowData);
                            setDialogOpen(true);
                        }
                    }}
                />
            )}
        </>
    );
}
