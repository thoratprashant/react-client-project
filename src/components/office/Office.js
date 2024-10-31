import React, {useState} from 'react';
import OfficeTable from './OfficeTable';
import OfficeDialog from './OfficeDialog';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import {Roles} from '../../constants/ActorContstants';
import {useUserContext} from '../../UserContext';

export default function Office() {
    const {actor} = useUserContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedOffice, setSelectedOffice] = useState({});

    return (
        <StyledContainer>
            <StyledTableActionsContainer>
                <StyledTextField
                    name="searchText"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    label={`Search Offices`}
                    type="search"
                />
                <StyledCreateButton
                    onClick={() => setDialogOpen(true)}
                    variant="contained"
                    size="medium"
                    disabled={actor.role !== Roles.ADMINISTRATOR.moniker}
                >
                    {`Create Office`}
                </StyledCreateButton>
            </StyledTableActionsContainer>
            <OfficeTable
                searchValue={searchText}
                setSelectedOffice={setSelectedOffice}
                setDialogOpen={setDialogOpen}
            />
            <OfficeDialog
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                office={selectedOffice}
                setSelectedOffice={setSelectedOffice}
            />
        </StyledContainer>
    );
}
