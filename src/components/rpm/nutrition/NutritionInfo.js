import React, {useCallback, useMemo, useState} from 'react';
import {Card, CardContent, CardHeader, Grid, LinearProgress, Tab, Tabs} from '@mui/material';
import {useReadNutritionSummaryAndHistory} from '../../../api/nutritionApi';
import {StyledGridContainer} from '../weight/Weight';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

import moment from 'moment/moment';
import {StyledPaper} from '../healthMetrics/HealthMetrics';

export default function NutritionInfo({patientId, isPatientViewing}) {
    const [activeTab, setActiveTab] = useState('Calories');
    const {data: nutritionData, isLoading: isNutritionLoading} =
        useReadNutritionSummaryAndHistory(patientId);

    const activeTabUnit = useMemo(() => {
        let unit;
        switch (activeTab) {
            case 'Calories':
                unit = 'Calories';
                break;
            case 'SaturatedFatGrams':
                unit = 'Sat Fat (g)';
                break;
            case 'ProteinGrams':
                unit = 'Protein (g)';
                break;
            case 'SodiumMg':
                unit = 'Sodium (mg)';
                break;
            case 'CholesterolMg':
                unit = 'Cholesterol (mg)';
                break;
            case 'CarbohydrateGrams':
                unit = 'Carbs (g)';
                break;
            case 'FiberGrams':
                unit = 'Fiber (g)';
                break;
            case 'SugarGrams':
                unit = 'Sugar (g)';
                break;
            default:
                unit = '';
        }
        return unit;
    }, [activeTab]);

    const renderSummaryCard = useCallback(
        (summaryData) => {
            const {numberOfDaysWithData, timePeriod} = summaryData;

            const averageData = summaryData[`average${activeTab}`];
            const maxData = summaryData[`max${activeTab}`];
            const minData = summaryData[`min${activeTab}`];
            const totalData = summaryData[`total${activeTab}`];

            let title, formattedData, formattedMinData, formattedMaxData, formattedDaysWithData;
            switch (timePeriod) {
                case 'DAY':
                    title = 'Today';
                    formattedData = `${activeTabUnit}: ${totalData.toFixed(0)}`;
                    break;
                case 'WEEK':
                    title = `Last 7 Days`;
                    formattedData = `Avg Daily ${activeTabUnit}: ${averageData.toFixed(0)}`;
                    formattedMinData = `Minimum: ${minData.toFixed(0)}`;
                    formattedMaxData = `Maximum: ${maxData.toFixed(0)}`;
                    formattedDaysWithData = `${numberOfDaysWithData} days w/ data`;
                    break;
                case 'MONTH':
                    title = `Last 30 Days`;
                    formattedData = `Avg Daily ${activeTabUnit}: ${averageData.toFixed(0)}`;
                    formattedMinData = `Minimum: ${minData.toFixed(0)}`;
                    formattedMaxData = `Maximum: ${maxData.toFixed(0)}`;
                    formattedDaysWithData = `${numberOfDaysWithData} days w/ data`;
                    break;
                case 'QUARTER':
                    title = `Last 90 Days`;
                    formattedData = `Avg Daily ${activeTabUnit}: ${averageData.toFixed(0)}`;
                    formattedMinData = `Minimum: ${minData.toFixed(0)}`;
                    formattedMaxData = `Maximum: ${maxData.toFixed(0)}`;
                    formattedDaysWithData = `${numberOfDaysWithData} days w/ data`;
                    break;
                default:
                    title = `Last 365 Days`;
                    formattedData = `Avg Daily ${activeTabUnit}: ${averageData.toFixed(0)}`;
                    formattedMinData = `Minimum: ${minData.toFixed(0)}`;
                    formattedMaxData = `Maximum: ${maxData.toFixed(0)}`;
                    formattedDaysWithData = `${numberOfDaysWithData} days w/ data`;
                    break;
            }

            return (
                <Grid item xs={4}>
                    <Card raised>
                        <CardHeader title={title} />
                        <CardContent>
                            <div>{formattedData}</div>
                            {formattedMinData && <div>{formattedMinData}</div>}
                            {formattedMaxData && <div>{formattedMaxData}</div>}
                            {formattedDaysWithData && <div>{formattedDaysWithData}</div>}
                        </CardContent>
                    </Card>
                </Grid>
            );
        },
        [activeTab, activeTabUnit]
    );

    const formattedBarChartData = useMemo(() => {
        if (!nutritionData) return null;
        const {monthlyData} = nutritionData;
        if (!monthlyData) return null;
        let hasData = false;
        const formattedData = [];
        monthlyData.forEach((d) => {
            const {startDate} = d;
            const averageData = d[`average${activeTab}`];
            if (!averageData && !hasData) {
                return;
            }
            hasData = true;
            let value;
            if (averageData) {
                value = parseInt(averageData.toFixed(0));
            }
            formattedData.push({
                label: moment(startDate).format('MMM YYYY'),
                value: value ?? 0,
            });
        });
        return formattedData;
    }, [nutritionData, activeTab]);

    const renderBarChart = useCallback(() => {
        return (
            <Grid item xs={12}>
                <StyledPaper elevation={3}>
                    <h3>Average Daily {activeTabUnit} By Month</h3>
                    <Grid item xs={12}>
                        <ResponsiveContainer width="99%" height={250}>
                            <BarChart
                                data={formattedBarChartData}
                                margin={{top: 5, right: 30, bottom: 5, left: 0}}
                                height={250}
                                width="100%"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#012e3f" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>
                </StyledPaper>
            </Grid>
        );
    }, [formattedBarChartData, activeTabUnit]);

    if (isNutritionLoading) return <LinearProgress />;

    if (
        !nutritionData ||
        (!nutritionData.today &&
            !nutritionData.rollingWeek &&
            !nutritionData.rollingMonth &&
            !nutritionData.rollingQuarter &&
            !nutritionData.rollingYear)
    ) {
        return (
            <div>
                {isPatientViewing && (
                    <div style={{marginTop: 10, marginLeft: 10, marginRight: 10}}>
                        No Nutrition Info in the Last Year. Please add in what you ate in the Track
                        tab above.
                    </div>
                )}
                {!isPatientViewing && (
                    <div style={{marginTop: 10, marginLeft: 10, marginRight: 10}}>
                        No Nutrition Info for this patient in the Last Year. Please have them track
                        their Nutrition in the Systolics app.
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <StyledGridContainer container spacing={2}>
                <Grid item xs={12}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Calories" value={'Calories'} />
                        <Tab label="Sat Fat" value={'SaturatedFatGrams'} />
                        <Tab label="Protein" value={'ProteinGrams'} />
                        <Tab label="Sodium" value={'SodiumMg'} />
                        <Tab label="Cholesterol" value={'CholesterolMg'} />
                        <Tab label="Carbs" value={'CarbohydrateGrams'} />
                        <Tab label="Fiber" value={'FiberGrams'} />
                        <Tab label="Sugar" value={'SugarGrams'} />
                    </Tabs>
                </Grid>
                {renderSummaryCard(nutritionData.today)}
                {renderSummaryCard(nutritionData.rollingWeek)}
                {renderSummaryCard(nutritionData.rollingMonth)}
                {renderSummaryCard(nutritionData.rollingQuarter)}
                {renderSummaryCard(nutritionData.rollingYear)}
                {renderBarChart()}
            </StyledGridContainer>
        </div>
    );
}
