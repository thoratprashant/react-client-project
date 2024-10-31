import React from 'react';
import {useVirtual} from 'react-virtual';
import {Table, TableBody, TableCell, TableHead, TableRow} from '@mui/material';
import {flexRender} from '@tanstack/react-table';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import styled from '@emotion/styled';
import {useTheme} from '@emotion/react';

const StyledTableCellHeader = styled(TableCell)`
    font-weight: 700;
`;

export default function VirtualizedTable({
    tableContainerRef,
    rows,
    table,
    onRowClick,
    darkHeader = false,
}) {
    const theme = useTheme();
    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        overscan: 10,
    });
    const {virtualItems: virtualRows, totalSize} = rowVirtualizer;

    const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

    return (
        <div className="p-2">
            <div ref={tableContainerRef} className="container">
                <Table>
                    <TableHead
                        sx={{
                            backgroundColor: darkHeader
                                ? theme.palette.primary.dark
                                : theme.palette.secondary.main,
                        }}
                    >
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <StyledTableCellHeader
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{
                                                width: header.getSize(),
                                                color: darkHeader
                                                    ? 'white'
                                                    : theme.palette.text.primary,
                                            }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                        onClick:
                                                            header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: <UpIcon />,
                                                        desc: <DownIcon />,
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            )}
                                        </StyledTableCellHeader>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {paddingTop > 0 && (
                            <TableRow>
                                <TableCell style={{height: `${paddingTop}px`}} />
                            </TableRow>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            const onclickHandler = onRowClick
                                ? () => onRowClick(row.original)
                                : undefined;
                            return (
                                <TableRow
                                    key={row.id}
                                    onClick={onclickHandler}
                                    sx={onRowClick ? {cursor: 'pointer'} : {}}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <TableRow>
                                <TableCell style={{height: `${paddingBottom}px`}} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
