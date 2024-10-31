import React, {useCallback, useMemo, useState} from 'react';
import {Breadcrumbs, Link, Typography} from '@mui/material';
import {
    StyledBreadcrumbs,
    StyledCreateButton,
    StyledDialogContainer,
    StyledDialogTitle,
    StyledFullWidthPageContainer,
    StyledTextField,
} from '../shared/StyledElements';
import {useNavigate} from 'react-router';
import styled from '@emotion/styled';
import {useSnackbar} from 'notistack';
import {useSearchPatient} from '../../api/patientApi';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DesktopDatePicker} from '@mui/x-date-pickers/DesktopDatePicker';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import PatientSearchTable from './PatientSearchTable';

const StyledSearchContainer = styled.div`
    padding-left: 10px;
    display: flex;
`;
const StyledNewPatientContainer = styled.div`
    padding-top: 10px;
    padding-right: 10px;
`;
const StyledRow = styled.div`
    padding-top: 5px;
`;
const StyledEndRow = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export default function PatientSearch() {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dob, setDob] = useState(null);
    const [patients, setPatients] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const {enqueueSnackbar} = useSnackbar();

    const submissionOptions = {
        onSuccess: (data, variables) => {
            setPatients(data);
        },
        onError: ({data}, variables) => {
            enqueueSnackbar(
                `There was an error searching for Patients${data?.message && ': ' + data.message}`,
                {
                    variant: 'error',
                }
            );
        },
    };
    const {mutate: doSearch} = useSearchPatient(submissionOptions);

    const dobIsValid = useMemo(() => {
        if (dob === null) return true;
        return dob?._isValid;
    }, [dob]);

    const handleSearch = useCallback(() => {
        doSearch({body: {firstName, lastName, dob}});
        setHasSearched(true);
    }, [doSearch, firstName, lastName, dob]);

    return (
        <StyledFullWidthPageContainer>
            <StyledBreadcrumbs>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link href="/erx">E-Prescribe</Link>
                    <Typography color="text.primary">Patient Search</Typography>
                </Breadcrumbs>
            </StyledBreadcrumbs>
            <StyledDialogContainer>
                <StyledDialogTitle>Find Existing or Create New Patient</StyledDialogTitle>
                <StyledRow>
                    <StyledSearchContainer>
                        <StyledTextField
                            name="firstName"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            label={`First Name`}
                            type="search"
                        />
                        <StyledTextField
                            name="lastName"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            label={`Last Name`}
                            type="search"
                            sx={{marginRight: '10px', marginLeft: '10px'}}
                        />
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DesktopDatePicker
                                label="DOB (MM/DD/YYYY)"
                                inputFormat="MM/DD/YYYY"
                                value={dob}
                                onChange={(val) => {
                                    setDob(val);
                                }}
                                renderInput={(params) => <StyledTextField {...params} />}
                            />
                        </LocalizationProvider>
                        <StyledCreateButton
                            onClick={handleSearch}
                            variant="contained"
                            size="medium"
                            sx={{margin: '10px'}}
                            disabled={lastName === '' || !dobIsValid}
                        >
                            Search
                        </StyledCreateButton>
                    </StyledSearchContainer>
                </StyledRow>
                {hasSearched && (
                    <StyledEndRow>
                        <StyledNewPatientContainer>
                            <StyledCreateButton
                                onClick={() => {
                                    navigate('/erx/new', {
                                        state: {
                                            patientId: 'new',
                                            isNewPatient: true,
                                            officeId: null,
                                        },
                                    });
                                }}
                                variant="contained"
                                size="medium"
                            >
                                Prescription For New Patient
                            </StyledCreateButton>
                        </StyledNewPatientContainer>
                    </StyledEndRow>
                )}
            </StyledDialogContainer>
            {hasSearched && <PatientSearchTable patients={patients || []} />}
        </StyledFullWidthPageContainer>
    );
}
