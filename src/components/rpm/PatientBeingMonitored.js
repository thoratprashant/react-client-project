import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Chat from './Chat';
import {useInterval} from '../../util/Interval';
import {useCreateEvent, useReadEventsSummaryForPatient} from '../../api/rpmApi';
import {useSnackbar} from 'notistack';
import moment from 'moment';
import {useStopwatch} from 'react-timer-hook';
import {useTabActive} from '../../util/WindowHelpers';
import {useQueryClient} from '@tanstack/react-query';
import {LinearProgress} from '@mui/material';
import styled from '@emotion/styled';
import {useReadPatient} from '../../api/patientApi';
import PatientMeasurements from './PatientMeasurements';
import {useIdleTimer} from 'react-idle-timer';
import {StyledButton} from '../shared/StyledElements';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';

const StyledMonitorContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-grow: 1;
    margin-top: 10px;
`;
const StyledChatContainer = styled.div`
    width: 33%;
    min-width: 33%;
    height: 100vh;
`;
const StyledPatient = styled.div`
    flex-grow: 1;
    margin-right: 10px;
`;
const StyledPatientHeader = styled.div`
    display: flex;
    flex-direction: row;
    background-color: ${({theme}) => theme.palette.secondary.main};
    align-items: center;
    justify-content: space-between;
    font-size: 24px;
    height: 56px;
`;
const StyledBold = styled.div`
    font-weight: 600;
    margin-left: 15px;
`;
const StyledTimer = styled.div`
    margin-right: 15px;
`;
const StyledPatientMeasurementsContainer = styled.div`
    flex: 1;
`;

const EVENT_INTERVAL = 5000;

export default function PatientBeingMonitored({patientId, isPatientViewing}) {
    const {actor} = useUserContext();
    const {enqueueSnackbar} = useSnackbar();
    const queryClient = useQueryClient();
    const isTabActive = useTabActive();

    const [isInactive, setIsInactive] = useState(false);
    const [isOverLimit, setIsOverLimit] = useState(false);
    const onIdle = useCallback(() => {
        if (!isPatientViewing) setIsInactive(true);
    }, [isPatientViewing]);

    // When the user becomes idle, the onPrompt is called
    // After prompt timeout is reached, the onIdle function is called
    // ex: Set the timeout to 10 seconds, so the onPrompt will pop a dialog. Set the promptTimeout to an additional 2 minutes so you're logged out at a total of 15 minutes.
    const timeoutTime = useMemo(() => {
        if (isPatientViewing) return 1000 * 60 * 30;
        else if (actor.role === Roles.ADMINISTRATOR.moniker) return 1000 * 60 * 30;
        else return 1000 * 10;
    }, [isPatientViewing, actor]);
    const {reset: resetIdle} = useIdleTimer({
        onIdle,
        timeout: timeoutTime,
    });

    const {data: patient, isLoading: isPatientLoading} = useReadPatient(patientId);
    const {data: eventsSummary, isLoading: isEventsSummaryLoading} = useReadEventsSummaryForPatient(
        patientId,
        !isPatientViewing
    );
    const submissionOptions = {
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: ['rpm']});
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error logging your monitoring time ${
                    data?.message && ': ' + data.message
                }`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: createRpmEvent} = useCreateEvent(submissionOptions);

    const nowDate = new Date();
    const {seconds, minutes, hours, isRunning, pause, reset} = useStopwatch({
        autoStart: false,
        offsetTimestamp: nowDate.setSeconds(
            nowDate.getSeconds() + eventsSummary?.totalDurationInSeconds || 0
        ),
    });

    useEffect(() => {
        if (!isPatientViewing && eventsSummary?.totalDurationInSeconds >= 19 * 60 && !isOverLimit) {
            setIsOverLimit(true);
        }
    }, [eventsSummary, isPatientViewing, isOverLimit]);

    useEffect(() => {
        if (isRunning && !isPatientViewing && (!isTabActive || isInactive || isOverLimit)) {
            pause();
            queryClient.invalidateQueries({queryKey: ['rpm']});
        } else if (
            !isRunning &&
            isTabActive &&
            !isInactive &&
            !isOverLimit &&
            !isPatientViewing &&
            eventsSummary?.totalDurationInSeconds !== null &&
            eventsSummary?.totalDurationInSeconds !== undefined
        ) {
            const restartDate = new Date();
            reset(
                restartDate.setSeconds(
                    restartDate.getSeconds() + eventsSummary?.totalDurationInSeconds || 0
                ),
                true
            );
        }
    }, [
        eventsSummary,
        isRunning,
        isTabActive,
        pause,
        queryClient,
        reset,
        isInactive,
        isOverLimit,
        isPatientViewing,
    ]);

    useInterval(
        () => {
            createRpmEvent({body: {patientId, durationInSeconds: EVENT_INTERVAL / 1000}});
        },
        isRunning && isTabActive && !isInactive && !isOverLimit && !isPatientViewing
            ? EVENT_INTERVAL
            : null
    );

    const timer = useMemo(() => {
        return (
            <div>
                {Boolean(hours) && hours > 0 && <span>{hours}:</span>}
                {<span>{minutes.toString().padStart(2, '0')}:</span>}
                {<span>{seconds.toString().padStart(2, '0')}</span>}
            </div>
        );
    }, [hours, minutes, seconds]);

    if ((isEventsSummaryLoading && !isPatientViewing) || isPatientLoading)
        return <LinearProgress />;

    return (
        <StyledMonitorContainer>
            <StyledPatient>
                <StyledPatientHeader>
                    <StyledBold>{`${patient.lastName}, ${patient.firstName}`}</StyledBold>
                    <StyledBold>{`DOB: ${moment(patient.dob).format('MM/DD/YYYY')}`}</StyledBold>
                    <StyledBold>{`Age: ${moment().diff(
                        moment(patient.dob),
                        'years',
                        false
                    )}`}</StyledBold>
                    {!isPatientViewing && <StyledTimer>{timer}</StyledTimer>}
                </StyledPatientHeader>
                <StyledPatientMeasurementsContainer>
                    {((!isInactive && !isOverLimit) || isPatientViewing) && (
                        <PatientMeasurements
                            patientId={patientId}
                            isPatientViewing={isPatientViewing}
                        />
                    )}
                    {isInactive && !isOverLimit && !isPatientViewing && (
                        <div>
                            <h2>
                                You have been inactive for more than 10 seconds. Click 'Activate'
                                below to begin monitoring again.
                            </h2>
                            <StyledButton
                                variant={'contained'}
                                onClick={() => {
                                    resetIdle();
                                    setIsInactive(false);
                                }}
                            >
                                Activate
                            </StyledButton>
                        </div>
                    )}
                    {isOverLimit && !isPatientViewing && (
                        <div>
                            <h2>
                                You have monitored this patient for more than 19 minutes during the
                                30 day period beginning on{' '}
                                {moment(eventsSummary.periodStart, 'YYYY-MM-DD').format(
                                    'MM/DD/YYYY'
                                )}{' '}
                                and ending on{' '}
                                {moment(eventsSummary.periodEnd, 'YYYY-MM-DD').format('MM/DD/YYYY')}
                                . You may no longer monitor this patient in this application. Please
                                contact the patient to set up an appointment if you need to advise
                                them.
                            </h2>
                        </div>
                    )}
                </StyledPatientMeasurementsContainer>
            </StyledPatient>
            <StyledChatContainer>
                {((!isInactive && !isOverLimit) || isPatientViewing) && (
                    <Chat patientId={patientId} />
                )}
            </StyledChatContainer>
        </StyledMonitorContainer>
    );
}
