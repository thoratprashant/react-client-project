import React, {useState} from 'react';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import {useNavigate} from 'react-router';
import EPrescriptionsTable from './EPrescriptionsTable';
import {Box, Tab, Tabs} from '@mui/material';
import {PrescriptionStatus} from '../../constants/CommonConstants';

export default function EPrescribe() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    return (
        <StyledContainer>
            <div>
                <Box sx={{borderBottom: 1, borderColor: 'divider', marginBottom: '5px'}}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="New" />
                        <Tab label="Cancelled" />
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
                    {0 === activeTab && (
                        <StyledCreateButton
                            onClick={() => {
                                navigate('/erx/patient/search');
                            }}
                            variant="contained"
                            size="medium"
                        >
                            Create Prescription
                        </StyledCreateButton>
                    )}
                </StyledTableActionsContainer>
                {0 === activeTab && (
                    <EPrescriptionsTable
                        searchValue={searchText}
                        prescriptionStatus={PrescriptionStatus.CREATED}
                        source={'E-Prescribe.New'}
                    />
                )}
                {1 === activeTab && (
                    <EPrescriptionsTable
                        searchValue={searchText}
                        prescriptionStatus={PrescriptionStatus.CANCELLED}
                        source={'E-Prescribe.Cancelled'}
                    />
                )}
            </div>
        </StyledContainer>
    );
}
