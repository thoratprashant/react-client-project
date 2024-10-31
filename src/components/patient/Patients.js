import React, {useState} from 'react';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import PatientTable from './PatientTable';
import {useNavigate} from 'react-router';

export default function Patients() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');

    return (
        <StyledContainer>
            <StyledTableActionsContainer>
                <StyledTextField
                    name="searchText"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    label={`Search Patients`}
                    type="search"
                />
                <StyledCreateButton
                    onClick={() => {
                        navigate('/patients/new');
                    }}
                    variant="contained"
                    size="medium"
                >
                    Create Patient
                </StyledCreateButton>
            </StyledTableActionsContainer>
            <PatientTable searchValue={searchText} />
        </StyledContainer>
    );
}
