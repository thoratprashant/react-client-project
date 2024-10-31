import React, {useState} from 'react';
import Weight from './weight/Weight';
import {Box, Tab, Tabs} from '@mui/material';
import HealthMetrics from './healthMetrics/HealthMetrics';
import PrescriptionHistory from '../patient/prescription/PrescriptionHistory';
import NutritionInfo from './nutrition/NutritionInfo';

export default function PatientMeasurements({patientId, isPatientViewing}) {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div>
            <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab label="Weight" />
                    <Tab label="Health Metrics" />
                    <Tab label="Nutrition Info" />
                    <Tab label="Rx History" />
                </Tabs>
            </Box>
            {activeTab === 0 && (
                <Weight patientId={patientId} isPatientViewing={isPatientViewing} />
            )}
            {activeTab === 1 && <HealthMetrics patientId={patientId} />}
            {activeTab === 2 && (
                <NutritionInfo patientId={patientId} isPatientViewing={isPatientViewing} />
            )}
            {activeTab === 3 && <PrescriptionHistory patientId={patientId} />}
        </div>
    );
}
