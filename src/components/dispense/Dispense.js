import React, {useState} from 'react';
import {
    StyledContainer,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import EPrescriptionsTable from '../eprescribe/EPrescriptionsTable';
import {Box, Tab, Tabs} from '@mui/material';
import {PrescriptionStatus} from '../../constants/CommonConstants';

export default function Dispense() {
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    return (
        <StyledContainer>
            <div>
                <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Pending" />
                        <Tab label="Dispensed" />
                    </Tabs>
                </Box>
                <StyledTableActionsContainer>
                    <StyledTextField
                        name="searchText"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        label={`Search Prescriptions`}
                        type="search"
                    />
                </StyledTableActionsContainer>

                {0 === activeTab && (
                    <EPrescriptionsTable
                        searchValue={searchText}
                        prescriptionStatus={PrescriptionStatus.CREATED}
                        source={'Dispense.Pending'}
                    />
                )}
                {1 === activeTab && (
                    <EPrescriptionsTable
                        searchValue={searchText}
                        prescriptionStatus={PrescriptionStatus.DISPENSED}
                        source={'Dispense.Dispensed'}
                    />
                )}
            </div>
        </StyledContainer>
    );
}
