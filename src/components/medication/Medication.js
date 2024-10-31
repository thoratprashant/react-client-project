import React, {useState} from 'react';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import MedicationTable from './MedicationTable';
import MedicationDialog from './MedicationDialog';
import {Roles} from '../../constants/ActorContstants';
import {useUserContext} from '../../UserContext';

export default function Medication() {
    const {actor} = useUserContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedMedication, setSelectedMedication] = useState({});

    return (
        <StyledContainer>
            <StyledTableActionsContainer>
                <StyledTextField
                    name="searchText"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    label={`Search Medications`}
                    type="search"
                />
                {actor.role === Roles.ADMINISTRATOR.moniker && (
                    <StyledCreateButton
                        onClick={() => setDialogOpen(true)}
                        variant="contained"
                        size="medium"
                    >
                        {`Create Medication`}
                    </StyledCreateButton>
                )}
            </StyledTableActionsContainer>
            <MedicationTable
                searchValue={searchText}
                setSelectedMedication={setSelectedMedication}
                setDialogOpen={setDialogOpen}
            />
            <MedicationDialog
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                medication={selectedMedication}
                setSelectedMedication={setSelectedMedication}
            />
        </StyledContainer>
    );
}
