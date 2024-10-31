import React, {useEffect, useState} from 'react';
import styled from '@emotion/styled';
import MonitoringQueue from './MonitoringQueue';
import PatientBeingMonitored from './PatientBeingMonitored';
import {useReadPatientForActor} from '../../api/patientApi';
import {useUserContext} from '../../UserContext';
import {Roles} from '../../constants/ActorContstants';
import {LinearProgress} from '@mui/material';

const StyledMonitoringContainer = styled.div`
    width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: row;
`;
const StyledQueue = styled.div`
    min-width: 17%;
    width: 17%;
    overflow-y: auto;
    height: 100vh;
`;
const StyledPatient = styled.div`
    margin-left: 10px;
    overflow-y: auto;
    height: 100vh;
`;

export default function Monitoring({isPatientViewing}) {
    const {actor} = useUserContext();
    const {data: patient, isLoading: isPatientLoading} = useReadPatientForActor(
        actor?.id,
        Boolean(actor?.id) && Boolean(actor.role === Roles.PATIENT.moniker)
    );
    const [selectedPatientId, setSelectedPatientId] = useState(undefined);

    useEffect(() => {
        if (!isPatientLoading && patient?.id) {
            setSelectedPatientId(patient.id);
        }
    }, [isPatientLoading, patient]);
    return (
        <StyledMonitoringContainer>
            {!isPatientViewing && (
                <StyledQueue>
                    <MonitoringQueue
                        setSelectedPatientId={setSelectedPatientId}
                        selectedPatientId={selectedPatientId}
                    />
                </StyledQueue>
            )}
            <StyledPatient>
                {selectedPatientId && (
                    <PatientBeingMonitored
                        key={`patientBeingMonitored_${selectedPatientId}`}
                        patientId={selectedPatientId}
                        isPatientViewing={isPatientViewing}
                    />
                )}
                {isPatientViewing && isPatientLoading && <LinearProgress />}
                {!selectedPatientId && !isPatientViewing && (
                    <div>Select a patient to monitor from the Queue on the left</div>
                )}
            </StyledPatient>
        </StyledMonitoringContainer>
    );
}
