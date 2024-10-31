import React, {useMemo, useState} from 'react';
import UsersTable from './UsersTable';
import UserDialog from './UserDialog';
import {useUserContext} from '../../UserContext';
import {
    StyledContainer,
    StyledCreateButton,
    StyledTableActionsContainer,
    StyledTextField,
} from '../shared/StyledElements';
import {Roles} from '../../constants/ActorContstants';

export default function Users({isPhysician}) {
    const {actor} = useUserContext();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedUser, setSelectedUser] = useState({});

    const initialValues = useMemo(
        () => ({
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            officeIds: [],
            npi: '',
            dob: '',
            disabled: false,
            physicianFee: 99.0,
            stateCode: '',
        }),
        []
    );

    return (
        <StyledContainer>
            <StyledTableActionsContainer>
                <StyledTextField
                    name="searchText"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    label={`Search ${isPhysician ? 'Physicians' : 'Users'}`}
                    type="search"
                />
                <StyledCreateButton
                    onClick={() => {
                        setSelectedUser(initialValues);
                        setDialogOpen(true);
                    }}
                    variant="contained"
                    size="medium"
                    disabled={actor.role !== Roles.ADMINISTRATOR.moniker}
                >
                    {`Create ${isPhysician ? 'Physician' : 'User'}`}
                </StyledCreateButton>
            </StyledTableActionsContainer>
            <UsersTable
                searchValue={searchText}
                isPhysician={isPhysician}
                setSelectedUser={setSelectedUser}
                setDialogOpen={setDialogOpen}
            />
            <UserDialog
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                isPhysician={isPhysician}
                user={selectedUser}
                initialValues={initialValues}
                setSelectedUser={setSelectedUser}
            />
        </StyledContainer>
    );
}
