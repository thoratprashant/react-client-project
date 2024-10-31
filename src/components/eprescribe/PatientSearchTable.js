import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Alert, Checkbox, Snackbar} from '@mui/material';
import {useNavigate} from 'react-router';

export default function PatientSearchTable({patients}) {
    const navigate = useNavigate();
    const [sorting, setSorting] = useState([]);
    const [disabledWarningOpen, setDisabledWarningOpen] = useState(false);

    const renderDisabled = ({disabledDateTime}) => {
        return <Checkbox disabled checked={disabledDateTime !== null} />;
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
        data: patients,
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

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setDisabledWarningOpen(false);
    };

    const handleRowClick = useCallback(
        (rowData) => {
            if (rowData.disabledDateTime !== null) {
                setDisabledWarningOpen(true);
            } else {
                navigate('/erx/new', {
                    state: {
                        patientId: rowData.id,
                        isNewPatient: false,
                        officeId: rowData.primaryOfficeId,
                    },
                });
            }
        },
        [navigate]
    );

    return (
        <>
            {!patients ||
                (patients.length === 0 && (
                    <div>
                        Your search returned no results. If this is a new patient, click
                        'Prescription for New Patient' button above
                    </div>
                ))}
            {patients?.length > 0 && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={false}
                    onRowClick={(rowData) => handleRowClick(rowData)}
                />
            )}
            <Snackbar
                open={disabledWarningOpen}
                autoHideDuration={10000}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleClose}
                    severity="warning"
                    sx={{width: '100%'}}
                    variant="filled"
                >
                    The patient you have selected is disabled. You must re-enable them before
                    continuing.
                </Alert>
            </Snackbar>
        </>
    );
}
