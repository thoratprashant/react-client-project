import React, {useCallback} from 'react';
import {useReadWearableData} from '../../../api/patientApi';
import {
    Area,
    AreaChart,
    Bar,
    CartesianGrid,
    ComposedChart,
    LabelList,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import styled from '@emotion/styled';
import {Grid, Paper} from '@mui/material';
import moment from 'moment';
import {StyledGridContainer} from '../weight/Weight';

export const StyledPaper = styled(Paper)`
    padding: 10px;
    margin: 5px;
    background-image: linear-gradient(to bottom, rgba(255, 166, 0, 0.6), rgba(255, 166, 0, 0.3));

    //background: #1da1f2;
`;
const StyledChartTitleContainer = styled.div`
    display: flex;
    margin-left: 10px;
`;
const StyledTitleTextContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 70%;
`;
const StyledAvgTitleTextContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 30%;
    text-align: right;
`;
const StyledTitle = styled.h3`
    margin: 0 0 2px 0;
`;
const StyledValue = styled.h5`
    margin: 0 0 2px 0;
`;

export default function HealthMetrics({patientId}) {
    const {data: readings, isLoading: isReadingsLoading} = useReadWearableData(patientId, true);
    const rookReadings = readings && !isReadingsLoading && readings?.ROOK ? readings?.ROOK : {};
    const {steps, vo2, exercise, activeCalories, heartRate, sleep} = rookReadings;
    const hasSteps = !!steps?.unit;
    const hasVO2 = !!vo2?.unit;
    const hasExercise = !!exercise?.unit;
    const hasActiveCalories = !!activeCalories?.unit;
    const hasHeartRate = !!heartRate?.unit;
    const hasSleep = !!sleep?.unit;

    const convertMinsToHoursMins = useCallback((value) => {
        const hours = Math.floor(value / 60);
        const hoursLabel = hours && hours > 0 ? `${hours}h ` : '';

        return `${hoursLabel}${Math.floor(value % 60)}m`;
    }, []);

    const renderLabel = useCallback(
        ({value, x, y, stroke, yAxisHoursMins}) => {
            return (
                <text
                    x={x}
                    y={y}
                    dy={-4}
                    fill={stroke}
                    fontSize={14}
                    position="top"
                    fontWeight={600}
                >
                    {yAxisHoursMins ? convertMinsToHoursMins(value) : value}
                </text>
            );
        },
        [convertMinsToHoursMins]
    );

    const renderChartTitle = useCallback(
        ({title, averageValue, mostRecentValue, mostRecentDate, unit, hasUnit = true}) => {
            return (
                <StyledChartTitleContainer>
                    <StyledTitleTextContainer>
                        <StyledTitle>{title}</StyledTitle>
                        <StyledValue>{`Daily Avg: ${averageValue} ${unit}`}</StyledValue>
                    </StyledTitleTextContainer>
                    <StyledAvgTitleTextContainer>
                        <StyledTitle>{`${mostRecentValue}${
                            hasUnit ? ' ' + unit : ''
                        }`}</StyledTitle>
                        <StyledValue>{`On: ${moment(mostRecentDate).format(
                            'MM/DD/YYYY'
                        )}`}</StyledValue>
                    </StyledAvgTitleTextContainer>
                </StyledChartTitleContainer>
            );
        },
        []
    );

    const renderLineChart = useCallback(
        ({
            data,
            title,
            xDataKey = 'date',
            yDataKey = 'value',
            yAxisHoursMins = false,
            averageValue,
            mostRecentValue,
            mostRecentDate,
            unit,
        }) => {
            return (
                <Grid item xs={12}>
                    <StyledPaper elevation={3}>
                        {renderChartTitle({
                            title,
                            averageValue,
                            mostRecentValue,
                            mostRecentDate,
                            unit,
                        })}
                        <Grid item xs={12}>
                            <ResponsiveContainer width="99%" height={250}>
                                <AreaChart
                                    data={data}
                                    margin={{top: 5, right: 30, bottom: 5, left: 0}}
                                    height={250}
                                    width="100%"
                                >
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#012e3f"
                                        fill={'#012e3f'}
                                        fillOpacity={0.5}
                                    >
                                        <LabelList
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({value, x, y, stroke, yAxisHoursMins})
                                            }
                                        />
                                    </Area>
                                    <CartesianGrid
                                        stroke="#ccc"
                                        strokeDasharray="3 3"
                                        // fill={'red'}
                                        // fillOpacity={0.4}
                                    />
                                    <XAxis
                                        dataKey={xDataKey}
                                        tickFormatter={(value) => {
                                            return moment(value, 'YYYY-MM-DD').format('MM/DD');
                                        }}
                                        height={60}
                                    />
                                    <YAxis
                                        dataKey={yDataKey}
                                        tickFormatter={(value) =>
                                            yAxisHoursMins ? convertMinsToHoursMins(value) : value
                                        }
                                        width={75}
                                    />
                                    <Tooltip />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Grid>
                    </StyledPaper>
                </Grid>
            );
        },
        [renderLabel, renderChartTitle, convertMinsToHoursMins]
    );

    const renderHeartRateChart = useCallback(
        ({
            data,
            title,
            xDataKey = 'date',
            yDataKey = 'value',
            yAxisHoursMins = false,
            averageValue,
            mostRecentValue,
            mostRecentDate,
            unit,
        }) => {
            return (
                <Grid item xs={12}>
                    <StyledPaper elevation={3}>
                        {renderChartTitle({
                            title,
                            averageValue,
                            mostRecentValue,
                            mostRecentDate,
                            unit,
                        })}
                        <Grid item xs={12}>
                            <ResponsiveContainer width="99%" height={250}>
                                <AreaChart
                                    data={data}
                                    margin={{top: 5, right: 30, bottom: 5, left: 0}}
                                    height={250}
                                    width="100%"
                                >
                                    <Area
                                        stackId={1}
                                        type="monotone"
                                        dataKey="heartRateMin"
                                        name="Min HR"
                                        stroke="#012e3f"
                                        fill="#012e3f"
                                    >
                                        <LabelList
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({value, x, y, stroke, yAxisHoursMins})
                                            }
                                        />
                                    </Area>
                                    <Area
                                        stackId={1}
                                        type="monotone"
                                        dataKey="heartRateMax"
                                        name="Max HR"
                                        stroke="#00655d"
                                        fill="#00655d"
                                    >
                                        <LabelList
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({value, x, y, stroke, yAxisHoursMins})
                                            }
                                        />
                                    </Area>
                                    <Area
                                        stackId={1}
                                        type="monotone"
                                        dataKey="heartRateAvg"
                                        name="Avg HR"
                                        stroke="#55952e"
                                        fill="#55952e"
                                    >
                                        <LabelList
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({value, x, y, stroke, yAxisHoursMins})
                                            }
                                        />
                                    </Area>
                                    <Area
                                        stackId={1}
                                        type="monotone"
                                        dataKey="heartRateResting"
                                        name={'Resting HR'}
                                        stroke="#ffa600"
                                        fill="#ffa600"
                                    >
                                        <LabelList
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({value, x, y, stroke, yAxisHoursMins})
                                            }
                                        />
                                    </Area>
                                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey={xDataKey}
                                        tickFormatter={(value) => {
                                            return moment(value, 'YYYY-MM-DD').format('MM/DD');
                                        }}
                                        height={60}
                                    />
                                    <YAxis width={75} />
                                    <Tooltip />
                                    <Legend />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Grid>
                    </StyledPaper>
                </Grid>
            );
        },
        [renderLabel, renderChartTitle]
    );

    const renderSleepChart = useCallback(
        ({data, title, xDataKey = 'date', averageValue, mostRecentValue, mostRecentDate, unit}) => {
            return (
                <Grid item xs={12}>
                    <StyledPaper elevation={3}>
                        {renderChartTitle({
                            title,
                            averageValue,
                            mostRecentValue,
                            mostRecentDate,
                            unit,
                            hasUnit: false,
                        })}
                        <Grid item xs={12}>
                            <ResponsiveContainer width="99%" height={250}>
                                <ComposedChart
                                    width="100%"
                                    height={250}
                                    data={data}
                                    margin={{top: 5, right: 30, bottom: 5, left: 0}}
                                >
                                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                                    <Legend />
                                    <XAxis
                                        dataKey={xDataKey}
                                        tickFormatter={(value) => {
                                            return moment(value, 'YYYY-MM-DD').format('MM/DD');
                                        }}
                                        height={60}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => convertMinsToHoursMins(value)}
                                        width={75}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sleepDurationMinutes"
                                        name="Total"
                                        stroke="#012e3f"
                                    >
                                        <LabelList
                                            dataKey="sleepDurationMinutes"
                                            content={({value, x, y, stroke}) =>
                                                renderLabel({
                                                    value,
                                                    x,
                                                    y,
                                                    stroke,
                                                    yAxisHoursMins: true,
                                                })
                                            }
                                        />
                                    </Line>
                                    <Bar
                                        dataKey="lightSleepDurationMinutes"
                                        name="Light Sleep"
                                        stackId={'a'}
                                        fill={'#00655d'}
                                    ></Bar>
                                    <Bar
                                        dataKey="remSleepDurationMinutes"
                                        name="REM Sleep"
                                        stackId={'a'}
                                        fill={'#55952e'}
                                    ></Bar>
                                    <Bar
                                        dataKey="deepSleepDurationMinutes"
                                        name="Deep Sleep"
                                        stackId={'a'}
                                        fill={'#ffa600'}
                                    ></Bar>
                                    <Tooltip formatter={convertMinsToHoursMins} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Grid>
                    </StyledPaper>
                </Grid>
            );
        },
        [renderLabel, renderChartTitle, convertMinsToHoursMins]
    );

    return (
        <StyledGridContainer container spacing={2}>
            <Grid item xs={12}>
                All data and graphs shown in this page are for informational purposes only.
            </Grid>
            {!hasSteps &&
                !hasVO2 &&
                !hasExercise &&
                !hasActiveCalories &&
                !hasHeartRate &&
                !hasSleep && (
                    <Grid item xs={12}>
                        <h2>We have not received any Health Metrics data for this user.</h2>
                    </Grid>
                )}
            {hasSteps &&
                renderLineChart({
                    data: steps?.steps || [],
                    title: steps?.graphTitle,
                    averageValue: steps?.averageSteps,
                    mostRecentValue: steps?.mostRecentSteps,
                    mostRecentDate: steps?.mostRecentStepsDate,
                    unit: steps?.unit,
                })}
            {hasVO2 &&
                renderLineChart({
                    data: vo2?.vo2 || [],
                    title: vo2?.graphTitle,
                    averageValue: vo2?.averageVO2,
                    mostRecentValue: vo2?.mostRecentVO2,
                    mostRecentDate: vo2?.mostRecentVO2Date,
                    unit: vo2?.unit,
                })}
            {hasExercise &&
                renderLineChart({
                    data: exercise?.exercise || [],
                    title: exercise.graphTitle,
                    yAxisHoursMins: true,
                    averageValue: exercise?.averageExerciseMins,
                    mostRecentValue: exercise?.mostRecentExerciseMins,
                    mostRecentDate: exercise?.mostRecentExerciseDate,
                    unit: exercise?.unit,
                })}
            {hasActiveCalories &&
                renderLineChart({
                    data: activeCalories?.calories || [],
                    title: activeCalories?.graphTitle,
                    averageValue: activeCalories?.averageCalories,
                    mostRecentValue: activeCalories?.mostRecentCalories,
                    mostRecentDate: activeCalories?.mostRecentCaloriesDate,
                    unit: activeCalories?.unit,
                })}
            {hasHeartRate &&
                renderHeartRateChart({
                    data: heartRate?.heartRate || [],
                    title: heartRate?.graphTitle,
                    averageValue: heartRate?.averageHeartRate,
                    mostRecentValue: heartRate?.mostRecentHeartRateAvg,
                    mostRecentDate: heartRate?.mostRecentHeartRateDate,
                    unit: heartRate?.unit,
                })}
            {hasSleep &&
                renderSleepChart({
                    data: sleep?.sleep || [],
                    title: sleep?.graphTitle,
                    averageValue: convertMinsToHoursMins(sleep?.averageSleepDurationMins),
                    mostRecentValue: convertMinsToHoursMins(sleep?.mostRecentSleepDurationMins),
                    mostRecentDate: sleep?.mostRecentSleepDate,
                    unit: sleep?.unit,
                })}
        </StyledGridContainer>
    );
}
