import React, {useCallback, useMemo, useState} from 'react';
import {useReadAllQueueItems} from '../../api/rpmApi';
import styled from '@emotion/styled';
import {Badge, Box, LinearProgress, ListItemButton, Tab, Tabs, Tooltip} from '@mui/material';
import {useUserContext} from '../../UserContext';
import moment from 'moment';
import 'moment-timezone';
// import TimerOffIcon from '@mui/icons-material/TimerOff';
import ChatIcon from '@mui/icons-material/Chat';
import ReportIcon from '@mui/icons-material/Report';
import {StyledTextField} from '../shared/StyledElements';
import {useQueryClient} from '@tanstack/react-query';
import {Roles} from '../../constants/ActorContstants';

const StyledPatientName = styled.div``;
const StyledPatientDob = styled.div`
    font-size: 0.75rem;
`;
const StyledPatientInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 65%;
`;
const StyledAlertsContainer = styled.div`
    width: 34%;
`;
const StyledReadingCount = styled.div`
    border-radius: 50%;
    border: 0.5px solid black;
    text-align: center;
    width: 24px;
    height: 24px;
    color: white;
    font-weight: 600;
    background-color: ${({theme}) => theme.palette.primary.main};
`;
const StyledReportIcon = styled(ReportIcon)`
    color: ${({theme}) => theme.palette.error.main};
`;
// const StyledTimerOffIcon = styled(TimerOffIcon)`
//     color: ${({theme}) => theme.palette.warning.main};
// `;

// const READING_TYPES = {
//     WEIGHT: {icon: <MonitorWeightIcon />, tooltip: 'Weight Measurements Available'},
// };

export default function MonitoringQueue({setSelectedPatientId, selectedPatientId}) {
    const queryClient = useQueryClient();
    const {actor} = useUserContext();
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const {data: queueItems, isLoading: isQueueItemsLoading} = useReadAllQueueItems({
        myPatientsOnly: actor.role === Roles.PHYSICIAN.moniker && activeTab === 0,
    });

    // const renderHasOldReading = useCallback(
    //     (mostRecentReadingDateTime, patientCreatedDateTime) => {
    //         const patientCreatedUTC = moment.utc(patientCreatedDateTime);
    //         const patientOlderThan5Days = moment.utc().add(-5, 'days').isAfter(patientCreatedUTC);
    //         const mostRecentUTC = mostRecentReadingDateTime
    //             ? moment.utc(mostRecentReadingDateTime)
    //             : null;
    //         const mostRecentReadingMoreThan5DaysAgo =
    //             !mostRecentUTC || moment.utc().add(-5, 'days').isAfter(mostRecentUTC);
    //
    //         if (!mostRecentReadingMoreThan5DaysAgo || !patientOlderThan5Days) return null;
    //
    //         const formattedToolTip = !mostRecentUTC
    //             ? `This patient has no readings`
    //             : `Last measurement was on ${mostRecentUTC
    //                   .tz(actor.timezone)
    //                   .format('MM/DD/YYYY HH:mm')} which is more than 5 days ago`;
    //
    //         return (
    //             <Tooltip title={formattedToolTip}>
    //                 <StyledTimerOffIcon />
    //             </Tooltip>
    //         );
    //     },
    //     [actor.timezone]
    // );

    // const renderReadingTypes = useCallback((newReadingsCount, readings, patientId) => {
    //     if (!newReadingsCount || newReadingsCount === 0) return null;
    //
    //     const readingTypes =
    //         readings && readings.length ? new Set(readings.map((r) => r.type)) : [];
    //
    //     const returnVal = Array.from(readingTypes).map((rt, rtI) => {
    //         const icon = READING_TYPES[rt]?.icon;
    //         const tooltip = READING_TYPES[rt]?.tooltip;
    //         if (icon) {
    //             return (
    //                 <Tooltip title={tooltip} key={`reading_type_${patientId}_${rtI}`}>
    //                     <StyledIcon>{icon}</StyledIcon>
    //                 </Tooltip>
    //             );
    //         }
    //         return null;
    //     });
    //     return returnVal;
    // }, []);

    const renderHasBadReading = useCallback((readings) => {
        const readingsByType = {};
        if (readings && readings.length) {
            readings.forEach((read) => {
                if (readingsByType[read.type])
                    readingsByType[read.type].push({
                        value: read.value,
                        readingDateTime: read.readingDateTime,
                        reviewed: read.reviewed,
                    });
                else
                    readingsByType[read.type] = [
                        {
                            value: read.value,
                            readingDateTime: read.readingDateTime,
                            reviewed: read.reviewed,
                        },
                    ];
            });
        }

        let weightWentUp = false;
        if (readingsByType['WEIGHT']) {
            const sorted = readingsByType['WEIGHT'].sort((a, b) => {
                const aMoment = moment.utc(a.readingDateTime);
                const bMoment = moment.utc(b.readingDateTime);
                if (aMoment.isBefore(bMoment)) return 1;
                else if (aMoment.isAfter(bMoment)) return -1;
                return 0;
            });

            sorted.forEach((s, i) => {
                if (i === sorted.length - 1 || s.reviewed || weightWentUp) return;
                weightWentUp = parseInt(s.value) > parseInt(sorted[i + 1].value);
            });
        }

        if (weightWentUp) {
            return (
                <Tooltip title={'Weight increased between readings'}>
                    <StyledReportIcon />
                </Tooltip>
            );
        }
    }, []);

    const filteredQueueItems = useMemo(() => {
        let filtered = queueItems;
        if (Boolean(searchText)) {
            filtered = queueItems.filter(
                (q) =>
                    q.patientFirstName.toLowerCase().includes(searchText.toLowerCase()) ||
                    q.patientLastName.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        return filtered?.sort((a, b) => {
            if (a.newReadingsCount < b.newReadingsCount || a.newMessagesCount < b.newMessagesCount)
                return 1;
            else if (
                a.newReadingsCount > b.newReadingsCount ||
                a.newMessagesCount > b.newMessagesCount
            )
                return -1;
            else {
                return 0;
            }
        });
    }, [queueItems, searchText]);

    if (isQueueItemsLoading) return <LinearProgress />;
    return (
        <div>
            {actor.role === Roles.PHYSICIAN.moniker && (
                <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="My Patients" />
                        <Tab label="All Patients" />
                    </Tabs>
                </Box>
            )}
            <StyledTextField
                name="searchText"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                label={`Search Patients`}
                type="search"
                fullWidth
            />
            {filteredQueueItems.map((q, i) => {
                const {readings, newReadingsCount, patientDob, newMessagesCount} = q;

                return (
                    <ListItemButton
                        key={`queue_item_${i}`}
                        onClick={() => {
                            setSelectedPatientId(q.patientId);
                            queryClient.invalidateQueries('rpm');
                        }}
                        selected={selectedPatientId === q.patientId}
                    >
                        <StyledPatientInfoContainer>
                            <StyledPatientName>{`${q.patientLastName}, ${q.patientFirstName}`}</StyledPatientName>
                            <StyledPatientDob>
                                {`DOB: ${moment(patientDob).format('MM/DD/YYYY')}`}
                            </StyledPatientDob>
                        </StyledPatientInfoContainer>
                        <StyledAlertsContainer>
                            {renderHasBadReading(readings)}
                            {/*{renderHasOldReading(mostRecentReadingDateTime, patientCreatedDateTime)}*/}
                            {newReadingsCount > 0 && (
                                <Tooltip title={`${newReadingsCount} new readings`}>
                                    <StyledReadingCount>{newReadingsCount}</StyledReadingCount>
                                </Tooltip>
                            )}
                            {newMessagesCount > 0 && (
                                <Tooltip title={`${newMessagesCount} new messages`}>
                                    <Badge badgeContent={newMessagesCount} color={'primary'}>
                                        <ChatIcon />
                                    </Badge>
                                </Tooltip>
                            )}
                            {/*{renderReadingTypes(newReadingsCount, readings, q.patientId)}*/}
                        </StyledAlertsContainer>
                    </ListItemButton>
                );
            })}
        </div>
    );
}
