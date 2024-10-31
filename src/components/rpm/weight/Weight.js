import React, {PureComponent, useCallback, useEffect, useMemo, useRef} from 'react';
import {
    useMarkPatientDeviceReadingsAsReviewed,
    useReadPatient,
    useReadPatientDeviceReadings,
} from '../../../api/patientApi';
import {Card, CardContent, CardHeader, Grid, LinearProgress} from '@mui/material';
import styled from '@emotion/styled';
import moment from 'moment';
import {useUserContext} from '../../../UserContext';
import VirtualizedTable from '../../shared/VirtualizedTable';
import {getCoreRowModel, getSortedRowModel, useReactTable} from '@tanstack/react-table';
import {useQueryClient} from '@tanstack/react-query';
import {useSnackbar} from 'notistack';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, LabelList} from 'recharts';

export const StyledGridContainer = styled(Grid)`
    margin-top: 10px;
    margin-left: 5px;
    box-sizing: border-box;
    width: 100%;
`;

class XAxisTick extends PureComponent {
    render() {
        const {payload, timezone, x, y} = this.props;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} transform="rotate(-35)" textAnchor="end">
                    {moment.utc(payload?.value).tz(timezone).format('MM/DD')}
                </text>
            </g>
        );
    }
}

export default function Weight({patientId, isPatientViewing}) {
    const {actor} = useUserContext();
    const queryClient = useQueryClient();
    const {enqueueSnackbar} = useSnackbar();
    const {data: patient, isLoading: isPatientLoading} = useReadPatient(patientId);
    const {data: readings, isLoading: isReadingsLoading} = useReadPatientDeviceReadings(
        patientId,
        'WEIGHT'
    );

    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['deviceReadings']}).then(() => {});
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error marking the measurements as reviewed${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: markAsReviewed} = useMarkPatientDeviceReadingsAsReviewed(submissionOptions);

    const calcBMI = useCallback(
        (weight) => {
            if (!patient?.heightInches) return null;
            const bmi = ((weight / patient.heightInches / patient.heightInches) * 703).toFixed(1);
            return bmi;
        },
        [patient]
    );

    const renderWeightLossCard = useCallback(() => {
        if (readings.length === 0) return null;
        const sameUnit = readings[0].unit === readings[readings.length - 1].unit;
        const unit = sameUnit ? readings[0].unit : '';
        const diff = (readings[0].value - readings[readings.length - 1].value).toFixed(1);
        const title = diff > 0 ? 'Weight Gain' : 'Weight Loss';
        const formattedDiff = diff <= 0 ? diff : '+' + diff;
        const initialBmi = calcBMI(readings[0].value);
        const recentBmi = calcBMI(readings[readings.length - 1].value);
        const bmiDiff = (initialBmi - recentBmi).toFixed(1);
        const formattedBmidDiff = bmiDiff <= 0 ? bmiDiff : '+' + bmiDiff;
        const days = moment
            .utc(readings[0].readingDateTime)
            .diff(moment.utc(readings[readings.length - 1].readingDateTime), 'days', false);
        return (
            <Grid item xs={4}>
                <Card raised>
                    <CardHeader title={title} />
                    <CardContent>
                        <div>{`${formattedDiff} ${unit}`}</div>
                        {patient?.heightInches && <div>{`BMI Change: ${formattedBmidDiff}`}</div>}
                        <div>{`${days} days`}</div>
                    </CardContent>
                </Card>
            </Grid>
        );
    }, [readings, calcBMI, patient]);

    const columns = useMemo(() => {
        const cols = [
            {
                accessorKey: 'value',
                header: 'Weight',
            },
            {
                accessorKey: 'unit',
                header: 'Unit',
            },
            {
                header: 'Measured On',
                accessorKey: 'readingDateTime',
                cell: (props) => (
                    <div>
                        {moment.utc(props.getValue()).tz(actor.timezone).format('MM/DD/YYYY HH:mm')}
                    </div>
                ),
            },
            {
                header: 'Reviewed On',
                accessorKey: 'reviewedDateTime',
                cell: (props) => (
                    <div>
                        {props.getValue()
                            ? moment
                                  .utc(props.getValue())
                                  .tz(actor.timezone)
                                  .format('MM/DD/YYYY HH:mm')
                            : ''}
                    </div>
                ),
            },
        ];

        return cols;
    }, [actor.timezone]);

    const table = useReactTable({
        data: readings || [],
        columns,
        // state: {
        //     sorting,
        // },
        // onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // debugTable: true,
    });

    const tableContainerRef = useRef(null);

    const {rows} = table.getRowModel();

    const nonReviewedIds = useMemo(() => {
        if (!readings) return [];
        return readings?.filter((r) => r.reviewedDateTime === null).map((r) => r.id);
    }, [readings]);

    useEffect(() => {
        setTimeout(() => {
            if (nonReviewedIds?.length) {
                markAsReviewed({body: {patientId, readingIds: nonReviewedIds}});
            }
        }, 5000);
    }, [readings, patientId, nonReviewedIds, markAsReviewed]);

    const renderLabel = useCallback(({payload, x, y, stroke, value}) => {
        return (
            <text x={x} y={y} dy={-4} fill={stroke} fontSize={16} position="top">
                {value}
            </text>
        );
    }, []);

    const readingsAscendingTime = useMemo(
        () => (readings ? [...readings] : []).reverse(),
        [readings]
    );

    const bmiReadingsAscending = useMemo(() => {
        if (
            !readingsAscendingTime ||
            !patient?.heightInches ||
            readingsAscendingTime.length === 0
        ) {
            return [];
        }
        return [...readingsAscendingTime].map(({value, readingDateTime}) => {
            const bmi = parseFloat(
                ((value / patient.heightInches / patient.heightInches) * 703).toFixed(1)
            );
            return {value: bmi, readingDateTime};
        });
    }, [readingsAscendingTime, patient]);

    const renderLineChart = useCallback(
        (data) => (
            <LineChart
                width={800}
                height={250}
                data={data}
                margin={{top: 5, right: 20, bottom: 5, left: 0}}
            >
                <Line type="monotone" dataKey="value" stroke="#012e3f">
                    <LabelList content={renderLabel} />
                </Line>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis
                    dataKey="readingDateTime"
                    tick={<XAxisTick timezone={actor.timezone} />}
                    height={60}
                />
                <YAxis dataKey="value" />
                <Tooltip />
            </LineChart>
        ),
        [renderLabel, actor]
    );

    if (isReadingsLoading || isPatientLoading) return <LinearProgress />;

    return (
        <div>
            <StyledGridContainer container spacing={2}>
                <Grid item xs={12}>
                    {isPatientViewing && (
                        <h4>
                            Your physician can only see 15 measurements per 30 day period. The rest
                            are for your use only.
                        </h4>
                    )}
                </Grid>
                <Grid item xs={4}>
                    <Card raised>
                        <CardHeader title={'Current Weight'} />
                        <CardContent>
                            {readings.length === 0 && 'No Readings Taken'}
                            {readings.length > 0 && (
                                <div>{`${readings[0].value} ${readings[0].unit}`}</div>
                            )}
                            {readings.length > 0 && patient?.heightInches && (
                                <div>{`BMI: ${calcBMI(readings[0].value)}`}</div>
                            )}
                            {readings.length > 0 && (
                                <div>{`${moment
                                    .utc(readings[0].readingDateTime)
                                    .tz(actor.timezone)
                                    .format('MM/DD/YYYY HH:mm')}`}</div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card raised>
                        <CardHeader title={'Initial Weight'} />
                        <CardContent>
                            {readings.length === 0 && 'No Readings Taken'}
                            {readings.length > 0 && (
                                <div>{`${readings[readings.length - 1].value} ${
                                    readings[readings.length - 1].unit
                                }`}</div>
                            )}
                            {readings.length > 0 && patient?.heightInches && (
                                <div>{`BMI: ${calcBMI(readings[readings.length - 1].value)}`}</div>
                            )}
                            {readings.length > 0 && (
                                <div>{`${moment
                                    .utc(readings[readings.length - 1].readingDateTime)
                                    .tz(actor.timezone)
                                    .format('MM/DD/YYYY HH:mm')}`}</div>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                {renderWeightLossCard()}
                {readingsAscendingTime && readingsAscendingTime.length > 0 && (
                    <Grid item xs={12}>
                        <h3>Weight</h3>
                        {renderLineChart(readingsAscendingTime)}
                    </Grid>
                )}
                {bmiReadingsAscending && bmiReadingsAscending.length > 0 && (
                    <Grid item xs={12}>
                        <h3>BMI</h3>
                        {renderLineChart(bmiReadingsAscending)}
                    </Grid>
                )}
                {!isReadingsLoading && readings && Boolean(readings.length) && (
                    <Grid item xs={12}>
                        <VirtualizedTable
                            tableContainerRef={tableContainerRef}
                            rows={rows}
                            table={table}
                            dataIsLoading={isReadingsLoading}
                        />
                    </Grid>
                )}
            </StyledGridContainer>
        </div>
    );
}
