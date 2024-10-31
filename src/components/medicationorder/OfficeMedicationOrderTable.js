import React, {Fragment, useCallback, useMemo, useRef} from 'react';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import VirtualizedTable from '../shared/VirtualizedTable';
import {TextField} from '@mui/material';
import {getIn} from 'formik';
import styled from '@emotion/styled';

const StyledTitle = styled.div`
    color: ${({theme}) => theme.palette.primary.main};
    font-size: 18px;
    padding-top: 8px;
    padding-bottom: 8px;
`;

export default function OfficeMedicationOrderTable({
    officeId,
    formik,
    requestedMeds,
    activeAmountOrderedName,
    setActiveAmountOrderedName,
}) {
    const {handleChange} = formik;

    const onChange = useCallback(
        (e) => {
            handleChange(e);
            setActiveAmountOrderedName(e.target.name);
        },
        [handleChange, setActiveAmountOrderedName]
    );
    const calcFieldName = useCallback((index) => `${officeId}[${index}].amountOrdered`, [officeId]);

    const renderOrderAmountField = useCallback(
        (props) => {
            const {row} = props;
            const fieldName = calcFieldName(row.index);

            return (
                <TextField
                    // TODO: this autofocus is a workaround for the field losing focus b/c it seems to be re-rendered and loses the key
                    autoFocus={activeAmountOrderedName === fieldName}
                    name={fieldName}
                    id={fieldName}
                    label="Amount*"
                    fullWidth
                    value={getIn(formik.values, fieldName)}
                    margin={'normal'}
                    onChange={(e) => onChange(e)}
                    error={
                        getIn(formik.touched, fieldName) && Boolean(getIn(formik.errors, fieldName))
                    }
                    helperText={getIn(formik.touched, fieldName) && getIn(formik.errors, fieldName)}
                />
            );
        },
        [
            formik.touched,
            formik.errors,
            formik.values,
            calcFieldName,
            activeAmountOrderedName,
            onChange,
        ]
    );

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'ndc',
                header: 'NDC',
            },
            {
                accessorKey: 'displayName',
                header: 'Medication',
            },
            {
                accessorKey: 'quantity',
                header: 'Qty',
            },
            {
                accessorKey: 'unitOfMeasure',
                header: 'UOM',
            },
            {
                accessorKey: 'inventoryOnHand',
                header: 'On Hand',
            },
            {
                accessorKey: 'inventoryMinimum',
                header: 'Min',
            },
            {
                accessorKey: 'inventoryMaximum',
                header: 'Max',
            },
            {
                header: 'Order Amt',
                cell: (props) => renderOrderAmountField(props),
            },
        ];
        return cols;
    }, [renderOrderAmountField]);

    const table = useReactTable({
        data: requestedMeds,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    return (
        <Fragment key={`office_med_order_table_${officeId}`}>
            <StyledTitle>{requestedMeds[0]?.officeName}</StyledTitle>
            <VirtualizedTable
                tableContainerRef={tableContainerRef}
                rows={rows}
                table={table}
                dataIsLoading={false}
                key={`office_med_order_table_virtualized_table_${officeId}`}
            />
        </Fragment>
    );
}
