import React, {useCallback, useMemo, useRef, useState} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {Checkbox, LinearProgress} from '@mui/material';
import {useFindDeviceShipments} from '../../api/officeDeviceApi';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';
import moment from 'moment/moment';

export default function DeviceShipmentTable({
    selectedShipment,
    setSelectedShipment,
    shipmentStatus,
}) {
    const {actor} = useUserContext();
    const {
        data: shipments,
        isLoading: isShipmentsLoading,
        isError: isShipmentsError,
    } = useFindDeviceShipments(true);

    const filtered = useMemo(() => {
        return shipments?.filter((s) => s.shipmentStatus === shipmentStatus) || [];
    }, [shipments, shipmentStatus]);

    const [sorting, setSorting] = useState([]);

    const toggleCheckbox = useCallback(
        (e, device) => {
            if (selectedShipment?.id) {
                setSelectedShipment(undefined);
            } else {
                setSelectedShipment(device);
            }
        },
        [setSelectedShipment, selectedShipment]
    );

    const renderCheckbox = useCallback(
        (row) => {
            return (
                <Checkbox
                    checked={selectedShipment?.id === row.id}
                    onClick={(e) => toggleCheckbox(e, row)}
                    disabled={Boolean(selectedShipment?.id) && selectedShipment?.id !== row.id}
                />
            );
        },
        [toggleCheckbox, selectedShipment]
    );

    const columns = useMemo(() => {
        const cols = [
            {
                header: actor.role === Roles.ADMINISTRATOR.moniker ? '' : 'Cancel?',
                accessorKey: 'checked',
                cell: ({row}) => renderCheckbox(row.original),
                size: 30,
            },
            {
                accessorKey: 'deviceName',
                header: 'Device Name',
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
            },
            {
                header: 'Requested By',
                cell: ({row}) => (
                    <span>{`${row.original.shipmentCreatedByLastName}, ${row.original.shipmentCreatedByFirstName}`}</span>
                ),
            },
            {
                accessorKey: 'officeName',
                header: 'Office Name',
            },
        ];
        if (shipmentStatus === 'SHIPPED' || shipmentStatus === 'DELIVERED') {
            cols.push({
                header: 'Shipped',
                accessorKey: 'shippedDateTime',
                cell: (props) => <div>{moment(props.getValue()).format('MM/DD/YYYY')}</div>,
            });
            cols.push({
                accessorKey: 'trackingNumber',
                header: 'Tracking #',
            });
            cols.push({
                accessorKey: 'invoiceNumber',
                header: 'Invoice #',
            });
            cols.push({
                accessorKey: 'shipper',
                header: 'Shipper',
            });
        }
        return cols;
    }, [renderCheckbox, actor, shipmentStatus]);

    const table = useReactTable({
        data: filtered || [],
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
            {isShipmentsLoading && <LinearProgress />}
            {!isShipmentsLoading && !isShipmentsError && (
                <VirtualizedTable
                    tableContainerRef={tableContainerRef}
                    rows={rows}
                    table={table}
                    dataIsLoading={isShipmentsLoading}
                />
            )}
        </>
    );
}
